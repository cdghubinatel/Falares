import { useState } from "react";
import { BrazilMap } from "../components/BrazilMap.tsx";
import { REGIONS, UF_BY_SIGLA, UFS, deUF, type RegionId } from "../data/geo.ts";
import { minorityNotes, type Estimate } from "../lib/model.ts";
import { renderShareImage, shareImage } from "../lib/share.ts";
import type { Answer, Stats } from "../lib/types.ts";

interface Props {
  answers: Answer[];
  estimate: Estimate;
  stats: Stats;
  onValidate: () => void;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Abaixo disso o palpite ainda se apoia sobretudo na referência inicial. */
const FEW_VOTES = 300;

export function Result({ answers, estimate, stats, onValidate }: Props) {
  const { guess, byUf, byRegion, ranking, where } = estimate;
  const [sharing, setSharing] = useState<"idle" | "busy" | "downloaded">("idle");

  const focusUf = ranking[0];
  const notes = minorityNotes(answers, focusUf, stats.counts);
  const highlight =
    guess.level === "uf" ? [guess.place] : guess.level === "regiao" ? UFS.filter((u) => u.regiao === guess.place).map((u) => u.sigla) : [];

  const headline = guess.level === "pais" ? "Meu jeito de falar é uma mistura do Brasil todo" : "Meu jeito de falar parece de quem cresceu";
  const topRegions = (Object.keys(byRegion) as RegionId[]).sort((a, b) => byRegion[b] - byRegion[a]);

  async function share() {
    setSharing("busy");
    try {
      const n = notes[0];
      const blob = await renderShareImage({
        headline,
        place: guess.level === "pais" ? "" : where,
        byUf,
        footnote: n ? `Só ${pct(n.share)} das pessoas ${deUF(focusUf)} dizem “${n.term}”. Eu digo.` : undefined,
      });
      const how = await shareImage(blob, `${headline} ${where}. E você?`);
      setSharing(how === "downloaded" ? "downloaded" : "idle");
    } catch {
      setSharing("idle");
    }
  }

  return (
    <section className="result">
      <p className="eyebrow">Resultado</p>
      {guess.level === "pais" ? (
        <h1 className="headline">
          Seu vocabulário é uma <em>mistura</em>. Não deu para cravar uma região.
        </h1>
      ) : (
        <h1 className="headline">
          Seu jeito de falar parece de quem cresceu <em>{where}</em>.
        </h1>
      )}
      {guess.level === "regiao" && (
        <p className="lede">
          Ainda não dá para apontar um estado com segurança. O mais provável é {UF_BY_SIGLA.get(focusUf)!.nome} (
          {pct(byUf[focusUf])}).
        </p>
      )}
      {guess.level === "pais" && (
        <p className="lede">
          Os sinais mais fortes apontam para o {REGIONS[topRegions[0]].nome} e o {REGIONS[topRegions[1]].nome}.
        </p>
      )}

      <div className="result__grid">
        <BrazilMap values={byUf} highlight={highlight} />

        <div className="result__side">
          <h2>Estados mais prováveis</h2>
          <ol className="ranking">
            {ranking.slice(0, 5).map((s) => (
              <li key={s}>
                <span>{UF_BY_SIGLA.get(s)!.nome}</span>
                <span className="ranking__bar">
                  <span style={{ width: pct(byUf[s] / byUf[ranking[0]]) }} />
                </span>
                <span className="ranking__pct">{pct(byUf[s])}</span>
              </li>
            ))}
          </ol>

          {notes.length > 0 && (
            <>
              <h2>Onde você foi minoria</h2>
              <ul className="notes">
                {notes.map((n) => (
                  <li key={n.questionId}>
                    Só <strong>{pct(n.share)}</strong> das pessoas {deUF(focusUf)} dizem <q>{n.term}</q>.
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {stats.validated < FEW_VOTES && (
        <p className="note">
          Por enquanto o palpite combina uma referência inicial sobre o vocabulário de cada região com{" "}
          {stats.validated === 1 ? "1 resposta validada" : `${stats.validated.toLocaleString("pt-BR")} respostas validadas`}.
          Ele fica mais preciso a cada pessoa que confirma de onde é.
        </p>
      )}

      <div className="cta card">
        <div>
          <h2>O Falares acertou?</h2>
          <p>Conte onde você passou a infância. É isso que faz suas respostas entrarem nos mapas.</p>
        </div>
        <div className="cta__actions">
          <button className="btn btn--primary" onClick={onValidate}>
            Conferir o resultado
          </button>
          <button className="btn" onClick={share} disabled={sharing === "busy"}>
            {sharing === "busy" ? "Gerando imagem…" : sharing === "downloaded" ? "Imagem baixada ✓" : "Compartilhar"}
          </button>
        </div>
      </div>
    </section>
  );
}
