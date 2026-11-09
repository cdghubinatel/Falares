import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync, existsSync, mkdirSync, createReadStream, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { QUESTION_BY_ID, matchVariant } from "../src/data/questions.ts";
import { REGIONS, UF_BY_SIGLA } from "../src/data/geo.ts";
import { AGE_BANDS, type Answer, type Counts, type Stats, type Submission } from "../src/lib/types.ts";

const ROOT = new URL("..", import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? 3001);
const PROD = process.env.NODE_ENV === "production";

// Municípios: código IBGE → UF
const municipios = new Map<number, string>(
  (JSON.parse(readFileSync(join(ROOT, "public/data/municipios.json"), "utf8")) as [number, string, string][]).map(
    ([codigo, , uf]) => [codigo, uf],
  ),
);

mkdirSync(join(ROOT, "data"), { recursive: true });
const db = new DatabaseSync(process.env.DB_PATH ?? join(ROOT, "data/falares.db"));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    childhood_municipio INTEGER NOT NULL,
    childhood_uf TEXT NOT NULL,
    current_municipio INTEGER,
    age_band TEXT,
    guess_level TEXT NOT NULL,
    guess_place TEXT NOT NULL,
    guess_hit INTEGER NOT NULL,
    feedback TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS answers (
    submission_id INTEGER NOT NULL REFERENCES submissions(id),
    question_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    term TEXT,
    free_text TEXT
  );
  CREATE INDEX IF NOT EXISTS answers_question ON answers(question_id, term);
`);

const insertSubmission = db.prepare(`
  INSERT INTO submissions (childhood_municipio, childhood_uf, current_municipio, age_band,
    guess_level, guess_place, guess_hit, feedback)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertAnswer = db.prepare(
  `INSERT INTO answers (submission_id, question_id, kind, term, free_text) VALUES (?, ?, ?, ?, ?)`,
);

function getStats(): Stats {
  const counts: Counts = {};
  const rows = db
    .prepare(
      `SELECT a.question_id AS q, a.term AS term, s.childhood_uf AS uf, COUNT(*) AS n
       FROM answers a JOIN submissions s ON s.id = a.submission_id
       WHERE a.term IS NOT NULL
       GROUP BY a.question_id, a.term, s.childhood_uf`,
    )
    .all() as { q: string; term: string; uf: string; n: number }[];
  for (const { q, term, uf, n } of rows) ((counts[q] ??= {})[term] ??= {})[uf] = n;

  const acc = db.prepare(`SELECT COUNT(*) AS n, COALESCE(SUM(guess_hit), 0) AS hits FROM submissions`).get() as {
    n: number;
    hits: number;
  };
  return { validated: acc.n, accuracy: { n: acc.n, hits: acc.hits }, counts };
}

class BadRequest extends Error {}

function cleanAnswer(raw: unknown): Answer | null {
  const a = raw as Partial<Answer>;
  const q = typeof a?.questionId === "string" ? QUESTION_BY_ID.get(a.questionId) : undefined;
  if (!q) return null;
  switch (a.kind) {
    case "term":
      if (typeof a.term !== "string" || !q.variants.some((v) => v.term === a.term)) return null;
      return { questionId: q.id, kind: "term", term: a.term };
    case "other": {
      const text = typeof a.text === "string" ? a.text.trim().slice(0, 60) : "";
      if (!text) return null;
      return { questionId: q.id, kind: "other", text, term: matchVariant(q, text) ?? undefined };
    }
    case "skip":
      return { questionId: q.id, kind: "skip" };
    default:
      return null;
  }
}

function saveSubmission(body: Submission) {
  const childhoodUf = municipios.get(Number(body?.childhoodMunicipio));
  if (!childhoodUf) throw new BadRequest("Município da infância inválido");
  const current =
    body.currentMunicipio != null && municipios.has(Number(body.currentMunicipio)) ? Number(body.currentMunicipio) : null;
  const age = AGE_BANDS.includes(body.ageBand as never) ? body.ageBand! : null;
  if (!["acertou", "quase", "errou"].includes(body.feedback)) throw new BadRequest("Resposta inválida");

  const { level, place } = body.guess ?? {};
  let hit: boolean;
  if (level === "uf" && UF_BY_SIGLA.has(place)) hit = place === childhoodUf;
  else if (level === "regiao" && place in REGIONS) hit = UF_BY_SIGLA.get(childhoodUf)!.regiao === place;
  else if (level === "pais") hit = false;
  else throw new BadRequest("Palpite inválido");

  if (!Array.isArray(body.answers)) throw new BadRequest("Respostas inválidas");
  const seen = new Set<string>();
  const answers = body.answers
    .map(cleanAnswer)
    .filter((a): a is Answer => a !== null && !seen.has(a.questionId) && !!seen.add(a.questionId));
  if (answers.length === 0) throw new BadRequest("Nenhuma resposta");

  db.exec("BEGIN");
  try {
    const { lastInsertRowid } = insertSubmission.run(
      Number(body.childhoodMunicipio),
      childhoodUf,
      current,
      age,
      level,
      level === "pais" ? "" : place,
      hit ? 1 : 0,
      body.feedback,
    );
    for (const a of answers) insertAnswer.run(lastInsertRowid, a.questionId, a.kind, a.term ?? null, a.text ?? null);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return { hit, childhoodUf };
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > 64_000) reject(new BadRequest("Corpo grande demais"));
      else chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new BadRequest("JSON inválido"));
      }
    });
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(data));
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".geojson": "application/geo+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function serveStatic(req: IncomingMessage, res: ServerResponse) {
  const dist = join(ROOT, "dist");
  const path = normalize(decodeURIComponent(new URL(req.url!, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(dist, path);
  if (!file.startsWith(dist) || !existsSync(file) || statSync(file).isDirectory()) file = join(dist, "index.html");
  res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}

createServer(async (req, res) => {
  try {
    if (req.url === "/api/stats" && req.method === "GET") return send(res, 200, getStats());
    if (req.url === "/api/submissions" && req.method === "POST") {
      const result = saveSubmission((await readJson(req)) as Submission);
      return send(res, 201, { ...result, stats: getStats() });
    }
    if (req.url?.startsWith("/api/")) return send(res, 404, { error: "Não encontrado" });
    if (PROD) return serveStatic(req, res);
    send(res, 404, { error: "Em desenvolvimento, use o servidor do Vite" });
  } catch (e) {
    if (e instanceof BadRequest) return send(res, 400, { error: e.message });
    console.error(e);
    send(res, 500, { error: "Erro interno" });
  }
}).listen(PORT, () => console.log(`Falares API em http://localhost:${PORT}`));
