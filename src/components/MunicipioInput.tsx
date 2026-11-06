import { useEffect, useId, useMemo, useState } from "react";
import { normalizeTerm } from "../data/questions.ts";
import { loadMunicipios, type Municipio } from "../lib/geodata.ts";

interface Props {
  label: string;
  hint?: string;
  value: Municipio | null;
  onChange: (m: Municipio | null) => void;
  required?: boolean;
}

type Indexed = { m: Municipio; key: string };

export function MunicipioInput({ label, hint, value, onChange, required }: Props) {
  const id = useId();
  const [all, setAll] = useState<Indexed[]>([]);
  const [text, setText] = useState(value ? `${value[1]} (${value[2]})` : "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    loadMunicipios().then((list) => setAll(list.map((m) => ({ m, key: normalizeTerm(`${m[1]} ${m[2]}`) }))));
  }, []);

  const matches = useMemo(() => {
    const q = normalizeTerm(text.replace(/[()/,]/g, " "));
    if (q.length < 2 || value) return [];
    const starts: Municipio[] = [];
    const contains: Municipio[] = [];
    for (const { m, key } of all) {
      if (key.startsWith(q)) starts.push(m);
      else if (key.includes(q)) contains.push(m);
      if (starts.length >= 8) break;
    }
    return [...starts, ...contains].slice(0, 8);
  }, [text, all, value]);

  function pick(m: Municipio) {
    onChange(m);
    setText(`${m[1]} (${m[2]})`);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!matches.length) return;
    if (e.key === "ArrowDown") setActive((a) => (a + 1) % matches.length);
    else if (e.key === "ArrowUp") setActive((a) => (a - 1 + matches.length) % matches.length);
    else if (e.key === "Enter") pick(matches[active]);
    else if (e.key === "Escape") setOpen(false);
    else return;
    e.preventDefault();
  }

  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {!required && <span className="optional">(opcional)</span>}
      </label>
      {hint && <p className="field__hint">{hint}</p>}
      <div className="combo">
        <input
          id={id}
          type="text"
          autoComplete="off"
          placeholder="Digite o nome do município"
          value={text}
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls={`${id}-list`}
          onChange={(e) => {
            setText(e.target.value);
            setActive(0);
            setOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
        />
        {value && (
          <button
            type="button"
            className="combo__clear"
            aria-label="Limpar"
            onClick={() => {
              onChange(null);
              setText("");
            }}
          >
            ×
          </button>
        )}
        {open && matches.length > 0 && (
          <ul id={`${id}-list`} role="listbox" className="combo__list">
            {matches.map((m, i) => (
              <li
                key={m[0]}
                role="option"
                aria-selected={i === active}
                className={i === active ? "active" : undefined}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(m);
                }}
              >
                {m[1]} <span className="muted">{m[2]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
