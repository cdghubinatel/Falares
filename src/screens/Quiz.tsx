import { useState } from "react";
import { CATEGORIES, type Question } from "../data/questions.ts";
import { nextQuestion, shuffle } from "../lib/round.ts";
import type { Answer, Counts } from "../lib/types.ts";

interface Props {
  size: number;
  counts: Counts;
  onFinish: (answers: Answer[]) => void;
}

interface Asked {
  question: Question;
  /** Ordem das opções, sorteada uma vez. */
  options: string[];
}

function ask(question: Question): Asked {
  return { question, options: shuffle(question.variants.map((v) => v.term)) };
}

export function Quiz({ size, counts, onFinish }: Props) {
  const [asked, setAsked] = useState<Asked[]>(() => [ask(nextQuestion([], [], counts))]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  const { question: q, options } = asked[index];
  const current = answers[q.id];

  function answer(a: Answer) {
    const next = { ...answers, [q.id]: a };
    setAnswers(next);
    const inOrder = asked.map(({ question }) => next[question.id]).filter((x): x is Answer => !!x);
    if (index + 1 < asked.length) {
      setIndex(index + 1);
    } else if (asked.length < size) {
      // A próxima pergunta é escolhida conforme as respostas dadas até aqui.
      const ids = asked.map(({ question }) => question.id);
      setAsked([...asked, ask(nextQuestion(ids, inOrder, counts))]);
      setIndex(index + 1);
    } else {
      onFinish(inOrder);
    }
  }

  return (
    <section className="quiz" key={q.id}>
      <div className="progress" aria-label={`Pergunta ${index + 1} de ${size}`}>
        <div className="progress__bar" style={{ width: `${(index / size) * 100}%` }} />
      </div>
      <div className="quiz__meta">
        <span>
          {index + 1} de {size}
        </span>
        <span className="chip">{CATEGORIES[q.category]}</span>
      </div>

      <div className="card prompt">
        <div className="prompt__emoji" aria-hidden>
          {q.emoji}
        </div>
        <p className="prompt__text">{q.description}</p>
        <p className="prompt__ask">Como você chama isso?</p>
      </div>

      <div className="options">
        {options.map((term) => (
          <button
            key={term}
            className={current?.kind === "term" && current.term === term ? "option option--selected" : "option"}
            onClick={() => answer({ questionId: q.id, kind: "term", term })}
          >
            {term}
          </button>
        ))}
      </div>

      <div className="options options--fixed">
        <button
          className={current?.kind === "skip" ? "option option--ghost option--selected" : "option option--ghost"}
          onClick={() => answer({ questionId: q.id, kind: "skip" })}
        >
          Prefiro não responder
        </button>
      </div>

      <nav className="quiz__nav">
        <button className="link" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          ← Voltar
        </button>
      </nav>
    </section>
  );
}
