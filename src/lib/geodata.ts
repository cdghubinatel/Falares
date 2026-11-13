import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";
import { UF_BY_SIGLA, haversineKm } from "../data/geo.ts";

export type UfFeatures = FeatureCollection<Polygon | MultiPolygon, { codarea: string }>;
/** [código IBGE, nome, UF, lat, lon] */
export type Municipio = [number, string, string, number, number];

let ufPromise: Promise<UfFeatures> | undefined;
let muniPromise: Promise<Municipio[]> | undefined;

export function loadUfs(): Promise<UfFeatures> {
  return (ufPromise ??= fetch(`${import.meta.env.BASE_URL}data/uf.geojson`).then((r) => r.json()));
}

export function loadMunicipios(): Promise<Municipio[]> {
  return (muniPromise ??= fetch(`${import.meta.env.BASE_URL}data/municipios.json`).then((r) => r.json()));
}

/** Distância (km) de um ponto até a borda mais próxima de um conjunto de UFs. */
export function distanceToUfs(ufs: UfFeatures, siglas: string[], lat: number, lon: number): number {
  const codes = new Set(siglas.map((s) => UF_BY_SIGLA.get(s)!.codigo));
  let best = Infinity;
  for (const f of ufs.features) {
    if (!codes.has(f.properties.codarea)) continue;
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const ring of polys.flat()) for (const [x, y] of ring) best = Math.min(best, haversineKm(lat, lon, y, x));
  }
  return best;
}
