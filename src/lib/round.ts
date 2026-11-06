import { FIXED_QUESTIONS, QUESTIONS, QUESTION_BY_ID, ROUND_SIZE, type Question } from "../data/questions.ts";
import { informationGain, posterior } from "./model.ts";
import type { Answer, Counts } from "./types.ts";

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function roundSize(): number {
  return ROUND_SIZE;
}

/** Entre as perguntas mais úteis, sorteia uma para as rodadas não saírem sempre iguais. */
const TOP_CANDIDATES = 3;

/**
 * Escolhe a próxima pergunta. Primeiro vêm as fixas, em ordem aleatória;
 * depois, a que mais deve reduzir a incerteza sobre a região, dado o que a
 * pessoa já respondeu.
 */
export function nextQuestion(asked: string[], answers: Answer[], counts: Counts): Question {
  const fixed = FIXED_QUESTIONS.filter((id) => !asked.includes(id));
  if (fixed.length) return QUESTION_BY_ID.get(fixed[Math.floor(Math.random() * fixed.length)])!;

  const current = posterior(answers, counts);
  const ranked = QUESTIONS.filter((q) => !asked.includes(q.id))
    .map((q) => ({ q, gain: informationGain(q, current, counts) }))
    .sort((a, b) => b.gain - a.gain)
    .slice(0, TOP_CANDIDATES);
  const total = ranked.reduce((s, r) => s + r.gain, 0);
  let x = Math.random() * total;
  for (const r of ranked) if ((x -= r.gain) <= 0) return r.q;
  return ranked[0].q;
}
