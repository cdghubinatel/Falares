import { geoMercator, geoPath } from "d3-geo";
import { UF_BY_CODIGO } from "../data/geo.ts";
import { heatScale } from "./colors.ts";
import { loadUfs } from "./geodata.ts";

interface ShareCard {
  headline: string;
  place: string;
  byUf: Record<string, number>;
  footnote?: string;
}

const W = 1080;
const H = 1350;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderShareImage({ headline, place, byUf, footnote }: ShareCard): Promise<Blob> {
  await document.fonts.ready;
  const ufs = await loadUfs();
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#f7f2e8";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#c2522d";
  ctx.font = "700 44px Fraunces, Georgia, serif";
  ctx.fillText("Falares", 80, 120);

  ctx.fillStyle = "#4a5357";
  ctx.font = "400 40px Inter, system-ui, sans-serif";
  let y = 210;
  for (const line of wrap(ctx, headline, W - 160)) {
    ctx.fillText(line, 80, y);
    y += 54;
  }

  ctx.fillStyle = "#1d2629";
  ctx.font = "700 76px Fraunces, Georgia, serif";
  for (const line of wrap(ctx, place, W - 160)) {
    y += 20;
    ctx.fillText(line, 80, y + 50);
    y += 76;
  }

  const mapTop = y + 60;
  const mapSize = Math.min(H - mapTop - 240, W - 160);
  const projection = geoMercator().fitExtent(
    [
      [(W - mapSize) / 2, mapTop],
      [(W + mapSize) / 2, mapTop + mapSize],
    ],
    ufs,
  );
  const path = geoPath(projection, ctx);
  const color = heatScale(byUf);
  ctx.strokeStyle = "#f7f2e8";
  ctx.lineWidth = 2;
  for (const f of ufs.features) {
    const uf = UF_BY_CODIGO.get(f.properties.codarea)!;
    ctx.beginPath();
    path(f);
    ctx.fillStyle = color(byUf[uf.sigla] ?? 0);
    ctx.fill();
    ctx.stroke();
  }

  if (footnote) {
    ctx.fillStyle = "#4a5357";
    ctx.font = "italic 400 34px Inter, system-ui, sans-serif";
    let fy = H - 140;
    for (const line of wrap(ctx, footnote, W - 160).slice(0, 2)) {
      ctx.fillText(line, 80, fy);
      fy += 46;
    }
  }

  ctx.fillStyle = "#c2522d";
  ctx.font = "600 32px Inter, system-ui, sans-serif";
  ctx.fillText(`Descubra o seu em ${location.host}`, 80, H - 50);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas"))), "image/png"));
}

/** Compartilha pela folha nativa do sistema quando possível; senão baixa o PNG. */
export async function shareImage(blob: Blob, text: string): Promise<"shared" | "downloaded"> {
  const file = new File([blob], "falares.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "shared";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "falares.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}
