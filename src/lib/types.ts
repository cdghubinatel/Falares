export type AnswerKind = "term" | "skip";

export interface Answer {
  questionId: string;
  kind: AnswerKind;
  /** Variante escolhida; ausente quando a pessoa prefere não responder. */
  term?: string;
}

/** Votos validados: pergunta → termo → UF da infância → contagem. */
export type Counts = Record<string, Record<string, Record<string, number>>>;

export interface Stats {
  validated: number;
  accuracy: { n: number; hits: number };
  counts: Counts;
}

export type GuessLevel = "uf" | "regiao" | "pais";

export interface Guess {
  level: GuessLevel;
  /** Sigla da UF ou id da região; vazio quando level = "pais". */
  place: string;
}

export const AGE_BANDS = ["até 17", "18–24", "25–34", "35–44", "45–59", "60+"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export type Feedback = "acertou" | "quase" | "errou";

export interface Submission {
  answers: Answer[];
  guess: Guess;
  feedback: Feedback;
  childhoodMunicipio: number;
  currentMunicipio?: number;
  ageBand?: AgeBand;
}
