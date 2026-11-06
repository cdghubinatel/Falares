import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { UF_BY_CODIGO } from "../data/geo.ts";
import { heatScale } from "../lib/colors.ts";
import { loadUfs, type UfFeatures } from "../lib/geodata.ts";

interface Props {
  /** Probabilidade por sigla de UF. */
  values: Record<string, number>;
  highlight?: string[];
  marker?: { lat: number; lon: number };
}

const W = 600;
const H = 600;

export function BrazilMap({ values, highlight = [], marker }: Props) {
  const [ufs, setUfs] = useState<UfFeatures>();
  const [hover, setHover] = useState<string>();
  useEffect(() => {
    loadUfs().then(setUfs);
  }, []);

  const projection = useMemo(() => (ufs ? geoMercator().fitSize([W, H], ufs) : undefined), [ufs]);
  const path = useMemo(() => (projection ? geoPath(projection) : undefined), [projection]);
  const color = heatScale(values);

  if (!ufs || !path || !projection) return <div className="map map--loading" aria-hidden />;

  const projected = marker ? projection([marker.lon, marker.lat]) : null;
  const hovered = hover ? UF_BY_CODIGO.get(hover) : undefined;

  return (
    <figure className="map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mapa do Brasil colorido pela probabilidade de cada estado">
        {ufs.features.map((f) => {
          const uf = UF_BY_CODIGO.get(f.properties.codarea)!;
          const v = values[uf.sigla] ?? 0;
          return (
            <path
              key={uf.sigla}
              d={path(f) ?? undefined}
              fill={color(v)}
              className={highlight.includes(uf.sigla) ? "uf uf--highlight" : "uf"}
              onPointerEnter={() => setHover(f.properties.codarea)}
              onPointerLeave={() => setHover(undefined)}
            >
              <title>{`${uf.nome}: ${(v * 100).toFixed(1)}%`}</title>
            </path>
          );
        })}
        {projected && (
          <g transform={`translate(${projected[0]} ${projected[1]})`} className="marker">
            <circle r="12" className="marker__halo" />
            <circle r="6" />
          </g>
        )}
      </svg>
      <figcaption className="map__caption">
        {hovered ? (
          <>
            <strong>{hovered.nome}</strong> · {((values[hovered.sigla] ?? 0) * 100).toFixed(1)}%
          </>
        ) : (
          <span className="legend">
            <span>menos provável</span>
            <span className="legend__bar" />
            <span>mais provável</span>
          </span>
        )}
      </figcaption>
    </figure>
  );
}
