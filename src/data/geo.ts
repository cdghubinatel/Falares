export type RegionId = "N" | "NE" | "SE" | "S" | "CO";

export interface UF {
  sigla: string;
  codigo: string; // código IBGE da UF (igual ao `codarea` da malha)
  nome: string;
  regiao: RegionId;
  lat: number;
  lon: number;
  /** População em milhões (Censo 2022). */
  pop: number;
}

export const REGIONS: Record<RegionId, { nome: string; adj: string }> = {
  N: { nome: "Norte", adj: "do Norte" },
  NE: { nome: "Nordeste", adj: "do Nordeste" },
  SE: { nome: "Sudeste", adj: "do Sudeste" },
  S: { nome: "Sul", adj: "do Sul" },
  CO: { nome: "Centro-Oeste", adj: "do Centro-Oeste" },
};

export const UFS: UF[] = [
  { sigla: "RO", codigo: "11", nome: "Rondônia", regiao: "N", lat: -10.83, lon: -63.34, pop: 1.58 },
  { sigla: "AC", codigo: "12", nome: "Acre", regiao: "N", lat: -8.77, lon: -70.55, pop: 0.83 },
  { sigla: "AM", codigo: "13", nome: "Amazonas", regiao: "N", lat: -3.47, lon: -65.1, pop: 3.94 },
  { sigla: "RR", codigo: "14", nome: "Roraima", regiao: "N", lat: 1.99, lon: -61.33, pop: 0.64 },
  { sigla: "PA", codigo: "15", nome: "Pará", regiao: "N", lat: -3.79, lon: -52.48, pop: 8.12 },
  { sigla: "AP", codigo: "16", nome: "Amapá", regiao: "N", lat: 1.41, lon: -51.77, pop: 0.73 },
  { sigla: "TO", codigo: "17", nome: "Tocantins", regiao: "N", lat: -9.46, lon: -48.26, pop: 1.51 },
  { sigla: "MA", codigo: "21", nome: "Maranhão", regiao: "NE", lat: -5.42, lon: -45.44, pop: 6.78 },
  { sigla: "PI", codigo: "22", nome: "Piauí", regiao: "NE", lat: -6.6, lon: -42.28, pop: 3.27 },
  { sigla: "CE", codigo: "23", nome: "Ceará", regiao: "NE", lat: -5.2, lon: -39.53, pop: 8.79 },
  { sigla: "RN", codigo: "24", nome: "Rio Grande do Norte", regiao: "NE", lat: -5.81, lon: -36.59, pop: 3.3 },
  { sigla: "PB", codigo: "25", nome: "Paraíba", regiao: "NE", lat: -7.28, lon: -36.72, pop: 3.97 },
  { sigla: "PE", codigo: "26", nome: "Pernambuco", regiao: "NE", lat: -8.38, lon: -37.86, pop: 9.06 },
  { sigla: "AL", codigo: "27", nome: "Alagoas", regiao: "NE", lat: -9.62, lon: -36.82, pop: 3.13 },
  { sigla: "SE", codigo: "28", nome: "Sergipe", regiao: "NE", lat: -10.57, lon: -37.45, pop: 2.21 },
  { sigla: "BA", codigo: "29", nome: "Bahia", regiao: "NE", lat: -13.29, lon: -41.71, pop: 14.14 },
  { sigla: "MG", codigo: "31", nome: "Minas Gerais", regiao: "SE", lat: -18.1, lon: -44.38, pop: 20.54 },
  { sigla: "ES", codigo: "32", nome: "Espírito Santo", regiao: "SE", lat: -19.19, lon: -40.34, pop: 3.83 },
  { sigla: "RJ", codigo: "33", nome: "Rio de Janeiro", regiao: "SE", lat: -22.25, lon: -42.66, pop: 16.05 },
  { sigla: "SP", codigo: "35", nome: "São Paulo", regiao: "SE", lat: -22.19, lon: -48.79, pop: 44.41 },
  { sigla: "PR", codigo: "41", nome: "Paraná", regiao: "S", lat: -24.89, lon: -51.55, pop: 11.44 },
  { sigla: "SC", codigo: "42", nome: "Santa Catarina", regiao: "S", lat: -27.45, lon: -50.95, pop: 7.61 },
  { sigla: "RS", codigo: "43", nome: "Rio Grande do Sul", regiao: "S", lat: -30.17, lon: -53.5, pop: 10.88 },
  { sigla: "MS", codigo: "50", nome: "Mato Grosso do Sul", regiao: "CO", lat: -20.51, lon: -54.54, pop: 2.76 },
  { sigla: "MT", codigo: "51", nome: "Mato Grosso", regiao: "CO", lat: -12.64, lon: -55.42, pop: 3.66 },
  { sigla: "GO", codigo: "52", nome: "Goiás", regiao: "CO", lat: -15.98, lon: -49.86, pop: 7.06 },
  { sigla: "DF", codigo: "53", nome: "Distrito Federal", regiao: "CO", lat: -15.83, lon: -47.86, pop: 2.82 },
];

export const UF_BY_SIGLA = new Map(UFS.map((u) => [u.sigla, u]));
export const UF_BY_CODIGO = new Map(UFS.map((u) => [u.codigo, u]));

/** "do Rio Grande do Sul", "da Bahia", "de Minas Gerais" etc. */
const PREPOSICAO: Record<string, string> = {
  AC: "do", AL: "de", AP: "do", AM: "do", BA: "da", CE: "do", DF: "do", ES: "do", GO: "de",
  MA: "do", MT: "de", MS: "de", MG: "de", PA: "do", PB: "da", PR: "do", PE: "de", PI: "do",
  RJ: "do", RN: "do", RS: "do", RO: "de", RR: "de", SC: "de", SP: "de", SE: "de", TO: "do",
};

export function deUF(sigla: string): string {
  return `${PREPOSICAO[sigla]} ${UF_BY_SIGLA.get(sigla)!.nome}`;
}

/** "no Rio Grande do Sul", "na Bahia", "em Minas Gerais" etc. */
export function emUF(sigla: string): string {
  const em = { do: "no", da: "na", de: "em" }[PREPOSICAO[sigla]];
  return `${em} ${UF_BY_SIGLA.get(sigla)!.nome}`;
}

/** Expande uma lista que mistura siglas de UF e de região ("NE", "SP") em siglas de UF. */
export function expandPlaces(places: string[]): Set<string> {
  const out = new Set<string>();
  for (const p of places) {
    if (p in REGIONS) UFS.filter((u) => u.regiao === p).forEach((u) => out.add(u.sigla));
    else if (UF_BY_SIGLA.has(p)) out.add(p);
    else throw new Error(`Lugar desconhecido: ${p}`);
  }
  return out;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}
