import { useState } from "react";
import { MunicipioInput } from "../components/MunicipioInput.tsx";
import { CAN_SAVE, submit } from "../lib/api.ts";
import type { Municipio } from "../lib/geodata.ts";
import { AGE_BANDS, type AgeBand, type Answer, type Feedback, type Guess, type Stats } from "../lib/types.ts";

interface Props {
  answers: Answer[];
  guess: Guess;
  where: string;
  /** `stats` vem atualizado da API; sem API, fica de fora. */
  onDone: (result: { childhood: Municipio; feedback: Feedback; stats?: Stats }) => void;
}

const FEEDBACK: { value: Feedback; label: string }[] = [
  { value: "acertou", label: "Acertou" },
  { value: "quase", label: "Chegou perto" },
  { value: "errou", label: "Errou" },
];

export function Validation({ answers, guess, where, onDone }: Props) {
  const [feedback, setFeedback] = useState<Feedback>();
  const [childhood, setChildhood] = useState<Municipio | null>(null);
  const [current, setCurrent] = useState<Municipio | null>(null);
  const [age, setAge] = useState<AgeBand | "">("");
  const [status, setStatus] = useState<"idle" | "sending" | { error: string }>("idle");

  const ready = feedback && childhood && status !== "sending";

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback || !childhood) return;
    if (!CAN_SAVE) return onDone({ childhood, feedback });
    setStatus("sending");
    try {
      const { stats } = await submit({
        answers,
        guess,
        feedback,
        childhoodMunicipio: childhood[0],
        currentMunicipio: current?.[0],
        ageBand: age || undefined,
      });
      onDone({ childhood, feedback, stats });
    } catch (err) {
      setStatus({ error: (err as Error).message });
    }
  }

  return (
    <section className="validation">
      <p className="eyebrow">Validação</p>
      <h1 className="headline">
        {guess.level === "pais" ? "Agora conta pra gente: de onde você é?" : <>Você cresceu mesmo {where}?</>}
      </h1>

      <form onSubmit={send} className="card form">
        <fieldset className="field">
          <legend>O palpite do Falares…</legend>
          <div className="segmented">
            {FEEDBACK.map((f) => (
              <button
                type="button"
                key={f.value}
                className={feedback === f.value ? "segmented__item segmented__item--on" : "segmented__item"}
                aria-pressed={feedback === f.value}
                onClick={() => setFeedback(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </fieldset>

        <MunicipioInput
          label="Município onde você passou a maior parte da infância"
          value={childhood}
          onChange={setChildhood}
          required
        />

        <MunicipioInput label="Município onde você mora hoje" value={current} onChange={setCurrent} />

        <div className="field">
          <label htmlFor="age">
            Faixa etária <span className="optional">(opcional)</span>
          </label>
          <select id="age" value={age} onChange={(e) => setAge(e.target.value as AgeBand | "")}>
            <option value="">Prefiro não dizer</option>
            {AGE_BANDS.map((b) => (
              <option key={b} value={b}>
                {b === "60+" ? "60 anos ou mais" : b === "até 17" ? "até 17 anos" : `${b} anos`}
              </option>
            ))}
          </select>
        </div>

        <aside className="privacy">
          {CAN_SAVE ? (
            <>
              <strong>Privacidade.</strong> Guardamos apenas os municípios e a faixa etária que você informar, junto com
          suas respostas. Nada de nome, e-mail, IP ou localização exata. Só a partir daqui suas respostas passam a contar
          nos mapas; se você não enviar, nada é salvo.
            </>
          ) : (
            <>
              <strong>Privacidade.</strong> Nesta versão nada é enviado nem salvo: o resultado é calculado no seu
              navegador.
            </>
          )}
        </aside>

        {typeof status === "object" && <p className="error">{status.error}</p>}

        <button className="btn btn--primary btn--block" disabled={!ready}>
          {status === "sending" ? "Enviando…" : CAN_SAVE ? "Enviar e ver se acertou" : "Ver se acertou"}
        </button>
      </form>
    </section>
  );
}
