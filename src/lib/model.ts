import { QUESTION_BY_ID, type Question } from "../data/questions.ts";
import { REGIONS, UFS, emUF, expandPlaces, type RegionId } from "../data/geo.ts";
import type { Answer, Counts, Guess } from "./types.ts";

/**
 * Peso da referência inicial (vocab.md), em "votos equivalentes" por UF.
 * Com poucos votos validados o palpite se apoia nela; conforme os votos de
 * uma UF crescem, eles passam a dominar.
 */
const SEED_STRENGTH = 12;
/** Achata a verossimilhança para o palpite não ficar confiante demais. */
const TEMPERATURE = 0.7;

/**
 * Referência inicial. Cada variante tem peso 1, e a variante típica de uma UF
 * ganha SEED_LOCAL a mais. As palavras comuns recebem ainda uma fatia fixa
 * (SEED_COMMON_SHARE) igual em todas as UFs.
 */
const SEED_LOCAL = 5;
const SEED_COMMON_SHARE = 0.55;

/** Prior: chance de alguém ter crescido em cada UF, pela população (achatada). */
const PRIOR: Record<string, number> = (() => {
  const w = UFS.map((u) => Math.pow(u.pop, 0.7));
  const z = w.reduce((a, b) => a + b, 0);
  return Object.fromEntries(UFS.map((u, i) => [u.sigla, w[i] / z]));
})();

const seedCache = new Map<string, Map<string, Record<string, number>>>();

/**
 * P(termo | UF) segundo a referência inicial.
 *
 * O denominador é o mesmo para toda UF, como se cada uma tivesse uma variante
 * típica. Onde o vocab.md não cita nenhuma, essa fatia fica para "alguma
 * palavra local que ainda não conhecemos", e a distribuição soma menos de 1.
 * Assim, responder a palavra comum não favorece as UFs sobre as quais
 * sabemos menos, como o Norte.
 */
function seedDistribution(q: Question): Map<string, Record<string, number>> {
  let byUf = seedCache.get(q.id);
  if (byUf) return byUf;
  byUf = new Map();
  const places = q.variants.map((v) => expandPlaces(v.where ?? []));
  const nCommon = q.variants.filter((v) => v.common).length;
  const commonShare = nCommon ? SEED_COMMON_SHARE : 0;
  for (const uf of UFS) {
    const local = places.map((p) => p.has(uf.sigla));
    const denom = q.variants.length + SEED_LOCAL * Math.max(1, local.filter(Boolean).length);
    const shares = q.variants.map(
      (v, i) => (v.common ? commonShare / nCommon : 0) + ((1 - commonShare) * (1 + (local[i] ? SEED_LOCAL : 0))) / denom,
    );
    byUf.set(uf.sigla, Object.fromEntries(q.variants.map((v, i) => [v.term, shares[i]])));
  }
  seedCache.set(q.id, byUf);
  return byUf;
}

/** Fração estimada de pessoas da UF que usam o termo, combinando votos e referência. */
export function termShare(questionId: string, term: string, uf: string, counts: Counts): number {
  const q = QUESTION_BY_ID.get(questionId)!;
  const seed = seedDistribution(q).get(uf)![term] ?? 0;
  const qCounts = counts[questionId] ?? {};
  const n = qCounts[term]?.[uf] ?? 0;
  const total = Object.values(qCounts).reduce((sum, byUf) => sum + (byUf[uf] ?? 0), 0);
  return (n + SEED_STRENGTH * seed) / (total + SEED_STRENGTH);
}

/** Respostas que entram no cálculo (as não respondidas ficam de fora). */
export function informativeAnswers(answers: Answer[]): Answer[] {
  return answers.filter((a) => a.kind === "term" && a.term);
}

/** Distribuição de probabilidade sobre as UFs dadas as respostas. */
export function posterior(answers: Answer[], counts: Counts): Record<string, number> {
  const used = informativeAnswers(answers);
  const logp: Record<string, number> = {};
  for (const uf of UFS) {
    logp[uf.sigla] = used.reduce(
      (s, a) => s + TEMPERATURE * Math.log(termShare(a.questionId, a.term!, uf.sigla, counts)),
      Math.log(PRIOR[uf.sigla]),
    );
  }
  const max = Math.max(...Object.values(logp));
  const exp = Object.fromEntries(Object.entries(logp).map(([k, v]) => [k, Math.exp(v - max)]));
  const z = Object.values(exp).reduce((a, b) => a + b, 0);
  return Object.fromEntries(Object.entries(exp).map(([k, v]) => [k, v / z]));
}

function entropy(p: number[]): number {
  return -p.reduce((s, x) => (x > 0 ? s + x * Math.log2(x) : s), 0);
}

/**
 * Ganho de informação esperado de uma pergunta: quanto, em média, a resposta
 * deve reduzir a incerteza sobre a UF, partindo da distribuição atual.
 */
export function informationGain(q: Question, current: Record<string, number>, counts: Counts): number {
  const siglas = Object.keys(current);
  const byTerm = q.variants.map((v) => siglas.map((s) => termShare(q.id, v.term, s, counts)));
  // O que sobra é a chance de uma palavra local que não está entre as opções.
  byTerm.push(siglas.map((_, i) => Math.max(1e-9, 1 - byTerm.reduce((sum, shares) => sum + shares[i], 0))));
  let after = 0;
  for (const shares of byTerm) {
    const pTerm = siglas.reduce((sum, s, i) => sum + current[s] * shares[i], 0);
    // Mesma atualização (achatada) que `posterior` faria com essa resposta.
    const updated = siglas.map((s, i) => current[s] * shares[i] ** TEMPERATURE);
    const z = updated.reduce((a, b) => a + b, 0);
    after += pTerm * entropy(updated.map((u) => u / z));
  }
  return entropy(siglas.map((s) => current[s])) - after;
}

export interface Estimate {
  byUf: Record<string, number>;
  byRegion: Record<RegionId, number>;
  guess: Guess;
  /** "em Minas Gerais", "no Nordeste"… */
  where: string;
  ranking: string[];
}

export function noRegiao(id: RegionId): string {
  return `no ${REGIONS[id].nome}`;
}

export function placeLabel(guess: Guess): string {
  if (guess.level === "uf") return emUF(guess.place);
  if (guess.level === "regiao") return noRegiao(guess.place as RegionId);
  return "no Brasil";
}

export function estimate(answers: Answer[], counts: Counts): Estimate {
  const used = informativeAnswers(answers);
  const byUf = posterior(answers, counts);

  const byRegion = Object.fromEntries(Object.keys(REGIONS).map((r) => [r, 0])) as Record<RegionId, number>;
  for (const uf of UFS) byRegion[uf.regiao] += byUf[uf.sigla];

  const ranking = Object.keys(byUf).sort((a, b) => byUf[b] - byUf[a]);
  const topRegion = (Object.keys(byRegion) as RegionId[]).sort((a, b) => byRegion[b] - byRegion[a])[0];

  // Só arrisca uma UF quando ela se destaca; senão sobe para a região.
  let guess: Guess;
  if (used.length >= 3 && byUf[ranking[0]] >= 0.5) guess = { level: "uf", place: ranking[0] };
  else if (used.length >= 2 && byRegion[topRegion] >= 0.6) guess = { level: "regiao", place: topRegion };
  else guess = { level: "pais", place: "" };

  return { byUf, byRegion, guess, where: placeLabel(guess), ranking };
}

export interface MinorityNote {
  questionId: string;
  term: string;
  share: number;
}

/** Respostas em que o usuário foi minoria na UF estimada (ou na mais provável). */
export function minorityNotes(answers: Answer[], uf: string, counts: Counts, limit = 3): MinorityNote[] {
  return informativeAnswers(answers)
    .map((a) => ({ questionId: a.questionId, term: a.term!, share: termShare(a.questionId, a.term!, uf, counts) }))
    .filter((n) => n.share < 0.3)
    .sort((a, b) => a.share - b.share)
    .slice(0, limit);
}
