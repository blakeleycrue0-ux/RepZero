import type { MuscleGroupRating, MuscleRating } from "@/lib/store/types";
import { MUSCLE_LABELS } from "@/lib/muscle-labels";
import { brand } from "@/lib/brand";

const W = 1080;
const H = 1350;

const COLORS = {
  ink: "#0b0b0d",
  paper: "#f7f7f5",
  navy: "#2a3fa0",
  strong: "#3fb984",
  solid: "#2a3fa0",
  developing: "#e0a33e",
  muted: "#a3a3a0",
};

function ratingColor(r: MuscleRating): string {
  return COLORS[r];
}

function drawBrandMark(ctx: CanvasRenderingContext2D, light: boolean) {
  ctx.fillStyle = light ? COLORS.ink : COLORS.paper;
  ctx.font = "500 30px Georgia, serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(brand.name, 72, H - 72);
  ctx.fillStyle = light ? "rgba(11,11,13,0.55)" : "rgba(247,247,245,0.55)";
  ctx.font = "400 22px system-ui, sans-serif";
  ctx.fillText(new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), 72, H - 40);
}

function baseCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  return { canvas, ctx };
}

function fillBg(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
  return cursorY;
}

// Template A — muscle map summary card.
export function drawScanCard(groups: MuscleGroupRating[], summary: string): HTMLCanvasElement {
  const { canvas, ctx } = baseCanvas();
  fillBg(ctx, COLORS.ink);

  ctx.fillStyle = COLORS.paper;
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText("SCAN RESULTS", 72, 130);

  ctx.font = "500 68px Georgia, serif";
  wrapText(ctx, "Where the work goes next.", 72, 220, W - 144, 78);

  // simple humanoid glyph built from stacked rounded rects, colored per group
  const cx = W / 2;
  let y = 470;
  const order: { id: keyof typeof MUSCLE_LABELS; w: number }[] = [
    { id: "shoulders", w: 340 },
    { id: "chest", w: 220 },
    { id: "core", w: 190 },
    { id: "quads", w: 240 },
    { id: "calves", w: 160 },
  ];
  const byId = Object.fromEntries(groups.map((g) => [g.id, g]));
  const blockH = 66;
  for (const row of order) {
    const g = byId[row.id];
    ctx.fillStyle = g ? ratingColor(g.rating) : COLORS.muted;
    roundRect(ctx, cx - row.w / 2, y, row.w, blockH, 18);
    ctx.fill();
    y += blockH + 14;
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(247,247,245,0.75)";
  ctx.font = "400 30px system-ui, sans-serif";
  wrapText(ctx, summary, 72, y + 90, W - 144, 42);

  // legend
  const legendY = H - 220;
  const legend: [MuscleRating, string][] = [
    ["developing", "Developing"],
    ["solid", "Solid"],
    ["strong", "Strong"],
  ];
  let lx = 72;
  ctx.font = "400 26px system-ui, sans-serif";
  for (const [rating, label] of legend) {
    ctx.fillStyle = ratingColor(rating);
    ctx.beginPath();
    ctx.arc(lx + 12, legendY - 8, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(247,247,245,0.75)";
    ctx.fillText(label, lx + 34, legendY);
    lx += ctx.measureText(label).width + 90;
  }

  drawBrandMark(ctx, false);
  return canvas;
}

// Template B — big stat / streak poster.
export function drawStatCard(headline: string, value: string, caption: string): HTMLCanvasElement {
  const { canvas, ctx } = baseCanvas();
  fillBg(ctx, COLORS.navy);

  ctx.fillStyle = "rgba(247,247,245,0.8)";
  ctx.font = "500 30px system-ui, sans-serif";
  ctx.fillText(headline.toUpperCase(), 72, 150);

  ctx.fillStyle = COLORS.paper;
  ctx.font = "600 300px Georgia, serif";
  ctx.fillText(value, 64, 640);

  ctx.font = "400 34px system-ui, sans-serif";
  ctx.fillStyle = "rgba(247,247,245,0.85)";
  wrapText(ctx, caption, 72, 740, W - 144, 46);

  drawBrandMark(ctx, false);
  return canvas;
}

// Template C — before/after comparison card.
export function drawComparisonCard(
  fromLabel: string,
  toLabel: string,
  improved: number,
  totalGroups: number
): HTMLCanvasElement {
  const { canvas, ctx } = baseCanvas();
  fillBg(ctx, COLORS.paper);

  ctx.fillStyle = COLORS.ink;
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText("PROGRESS", 72, 130);

  ctx.font = "500 64px Georgia, serif";
  wrapText(ctx, `${fromLabel} → ${toLabel}`, 72, 220, W - 144, 74);

  ctx.font = "600 260px Georgia, serif";
  ctx.fillStyle = COLORS.strong;
  ctx.fillText(String(improved), 72, 620);

  ctx.font = "400 36px system-ui, sans-serif";
  ctx.fillStyle = "rgba(11,11,13,0.7)";
  ctx.fillText(`of ${totalGroups} muscle groups moved up a level`, 72, 690);

  const barY = 820;
  const barW = W - 144;
  const filled = barW * (improved / totalGroups);
  ctx.fillStyle = "rgba(11,11,13,0.1)";
  roundRect(ctx, 72, barY, barW, 24, 12);
  ctx.fill();
  ctx.fillStyle = COLORS.strong;
  roundRect(ctx, 72, barY, Math.max(24, filled), 24, 12);
  ctx.fill();

  drawBrandMark(ctx, true);
  return canvas;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not export image"))), "image/png");
  });
}

export async function shareOrDownload(canvas: HTMLCanvasElement, filename: string) {
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], filename, { type: "image/png" });
  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: brand.name });
      return;
    } catch {
      // user cancelled or share failed — fall through to download
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
