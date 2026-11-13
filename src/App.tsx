import { useEffect, useState } from "react";
import { fetchStats } from "./lib/api.ts";
import type { Municipio } from "./lib/geodata.ts";
import { estimate, type Estimate } from "./lib/model.ts";
import { roundSize } from "./lib/round.ts";
import type { Answer, Stats } from "./lib/types.ts";
import { Done } from "./screens/Done.tsx";
import { Intro } from "./screens/Intro.tsx";
import { Quiz } from "./screens/Quiz.tsx";
import { Result } from "./screens/Result.tsx";
import { Validation } from "./screens/Validation.tsx";

type Screen =
  | { name: "intro" }
  | { name: "quiz"; size: number }
  | { name: "result"; answers: Answer[]; estimate: Estimate }
  | { name: "validation"; answers: Answer[]; estimate: Estimate }
  | { name: "done"; estimate: Estimate; childhood: Municipio };

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: "intro" });
  const [stats, setStats] = useState<Stats>({ validated: 0, accuracy: { n: 0, hits: 0 }, counts: {} });

  useEffect(() => {
    fetchStats().then(setStats);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen.name]);

  function start() {
    setScreen({ name: "quiz", size: roundSize() });
  }

  async function finish(answers: Answer[]) {
    const fresh = await fetchStats();
    setStats(fresh);
    setScreen({ name: "result", answers, estimate: estimate(answers, fresh.counts) });
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="logo" onClick={() => setScreen({ name: "intro" })}>
          Falares
        </button>
      </header>
      <main>
        {screen.name === "intro" && <Intro onStart={start} stats={stats} />}
        {screen.name === "quiz" && <Quiz size={screen.size} counts={stats.counts} onFinish={finish} />}
        {screen.name === "result" && (
          <Result
            answers={screen.answers}
            estimate={screen.estimate}
            stats={stats}
            onValidate={() => setScreen({ ...screen, name: "validation" })}
          />
        )}
        {screen.name === "validation" && (
          <Validation
            answers={screen.answers}
            guess={screen.estimate.guess}
            where={screen.estimate.where}
            onDone={({ childhood, stats }) => {
              if (stats) setStats(stats);
              setScreen({ name: "done", estimate: screen.estimate, childhood });
            }}
          />
        )}
        {screen.name === "done" && (
          <Done estimate={screen.estimate} childhood={screen.childhood} stats={stats} onRestart={start} />
        )}
      </main>
    </div>
  );
}
