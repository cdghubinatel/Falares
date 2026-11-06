import { useEffect, useState } from "react";
import { BrazilMap } from "../components/BrazilMap.tsx";
import { UFS, UF_BY_SIGLA, emUF } from "../data/geo.ts";
import { distanceToUfs, loadUfs, type Municipio } from "../lib/geodata.ts";
import type { Estimate } from "../lib/model.ts";
import type { Stats } from "../lib/types.ts";

interface Props {
  estimate: Estimate;
  childhood: Municipio;
  stats: Stats;
  onRestart: () => void;
}

export function Done({ estimate, childhood, stats, onRestart }: Props) {
  const { guess, ranking, byUf } = estimate;
  const [, name, uf, lat, lon] = childhood;
  const [distance, setDistance] = useState<number>();

  const guessedUfs =
    guess.level === "uf" ? [guess.place] : guess.level === "regiao" ? UFS.filter((u) => u.regiao === guess.place).map((u) => u.sigla) : [];
  const hit = guessedUfs.includes(uf);
  const rank = ranking.indexOf(uf) + 1;

  useEffect(() => {
    if (!hit && guessedUfs.length) loadUfs().then((ufs) => setDistance(distanceToUfs(ufs, guessedUfs, lat, lon)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const accuracy = stats.accuracy.n ? Math.round((stats.accuracy.hits / stats.accuracy.n) * 100) : null;

  return (
    <section className="done">
      <p className="eyebrow">Fim de jogo</p>
      <h1 className="headline">
        {hit ? (
          <>
            Acertamos! Você cresceu <em>{emUF(uf)}</em>.
          </>
        ) : guess.level === "pais" ? (
          <>
            Você cresceu em <em>{name}</em> ({uf}).
          </>
        ) : (
          <>
            Erramos{distance != null && <> por {Math.round(distance).toLocaleString("pt-BR")} km</>}. Você cresceu em{" "}
            <em>{name}</em> ({uf}).
          </>
        )}
      </h1>
      <p className="lede">
        {rank === 1
          ? `${UF_BY_SIGLA.get(uf)!.nome} era o nosso palpite número 1.`
          : `${UF_BY_SIGLA.get(uf)!.nome} era o nosso ${rank}º palpite entre os 27 estados.`}{" "}
        Obrigado! Suas respostas agora fazem parte dos mapas.
      </p>

      <BrazilMap values={byUf} highlight={[uf]} marker={{ lat, lon }} />

      <div className="stats card">
        <div>
          <span className="stats__num">{stats.validated.toLocaleString("pt-BR")}</span>
          <span className="stats__label">respostas validadas até agora</span>
        </div>
        {accuracy != null && (
          <div>
            <span className="stats__num">{accuracy}%</span>
            <span className="stats__label">de acertos do Falares</span>
          </div>
        )}
      </div>

      <div className="cta card">
        <div>
          <h2>Explorar os mapas</h2>
          <p>Em breve: um mapa por pergunta, com as fronteiras entre as palavras e as diferenças entre gerações.</p>
        </div>
        <div className="cta__actions">
          <button className="btn btn--primary" onClick={onRestart}>
            Jogar outra rodada
          </button>
        </div>
      </div>
    </section>
  );
}
