/** Escala sequencial do mapa de calor: creme → terracota. */
const STOPS = [
  [243, 236, 222],
  [244, 196, 150],
  [226, 130, 82],
  [184, 70, 38],
  [120, 34, 22],
];

export function heat(t: number): string {
  const x = Math.max(0, Math.min(1, t)) * (STOPS.length - 1);
  const i = Math.min(Math.floor(x), STOPS.length - 2);
  const f = x - i;
  const [r, g, b] = STOPS[i].map((c, k) => Math.round(c + (STOPS[i + 1][k] - c) * f));
  return `rgb(${r}, ${g}, ${b})`;
}

/** Normaliza as probabilidades para a cor: a UF mais provável fica no topo da escala. */
export function heatScale(values: Record<string, number>): (v: number) => string {
  const max = Math.max(...Object.values(values), 1e-9);
  return (v) => heat(Math.sqrt(v / max));
}
