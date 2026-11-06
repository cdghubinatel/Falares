import type { Stats } from "../lib/types.ts";

interface Props {
  stats: Stats;
  onStart: () => void;
}

export function Intro({ stats, onStart }: Props) {
  return (
    <section className="intro">
      <p className="eyebrow">Mandioca, aipim ou macaxeira?</p>
      <h1 className="display">
        De onde é o seu <em>jeito de falar</em>?
      </h1>
      <p className="lede">
        Responda como você chama algumas coisas do dia a dia e o Falares tenta adivinhar em que parte do Brasil você
        cresceu. São 12 perguntas, sem cadastro.
      </p>
      <button className="btn btn--primary btn--lg" onClick={onStart}>
        Começar
      </button>
      <ul className="intro__steps">
        <li>
          <strong>1.</strong> Responda com a palavra que sai natural pra você.
        </li>
        <li>
          <strong>2.</strong> Veja o palpite e um mapa de onde seu vocabulário mais combina.
        </li>
        <li>
          <strong>3.</strong> Conte se acertamos. Suas respostas ajudam a desenhar o mapa das palavras do Brasil.
        </li>
      </ul>
      {stats.validated > 0 && (
        <p className="muted">{stats.validated.toLocaleString("pt-BR")} pessoas já contaram de onde são.</p>
      )}
    </section>
  );
}
