import type { Stats, Submission } from "./types.ts";

const EMPTY: Stats = { validated: 0, accuracy: { n: 0, hits: 0 }, counts: {} };

/** Endereço da API. Vazio usa o mesmo domínio do site (dev e `npm start`). */
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

/**
 * Sem API (ex.: GitHub Pages sem backend configurado) o jogo funciona inteiro,
 * mas a validação só mostra o resultado, sem salvar nada.
 */
export const CAN_SAVE = import.meta.env.VITE_NO_API !== "1";

/** Votos validados agregados. Se a API estiver fora do ar, o jogo segue só com a referência inicial. */
export async function fetchStats(): Promise<Stats> {
  if (!CAN_SAVE) return EMPTY;
  try {
    const res = await fetch(`${API_URL}/api/stats`);
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch {
    return EMPTY;
  }
}

export async function submit(body: Submission): Promise<{ hit: boolean; childhoodUf: string; stats: Stats }> {
  const res = await fetch(`${API_URL}/api/submissions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Não foi possível enviar");
  return data;
}
