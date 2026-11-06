import type { Stats, Submission } from "./types.ts";

const EMPTY: Stats = { validated: 0, accuracy: { n: 0, hits: 0 }, counts: {} };

/** Votos validados agregados. Se a API estiver fora do ar, o jogo segue só com a referência inicial. */
export async function fetchStats(): Promise<Stats> {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch {
    return EMPTY;
  }
}

export async function submit(body: Submission): Promise<{ hit: boolean; childhoodUf: string; stats: Stats }> {
  const res = await fetch("/api/submissions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Não foi possível enviar");
  return data;
}
