/**
 * Render the current diagram + ISO A3 title block to a single SVG string.
 *
 * Coordinate system is millimetres. The page is 420 × 297 mm (A3 landscape).
 * The diagram is fitted inside a drawing area; the title block lives in the
 * bottom-right corner.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { getSmoothStepPath } from "@xyflow/react";

import { getSymbol } from "@/symbols/registry";
import { LINE_STYLES } from "@/symbols/lines/lineStyles";
import type { DiagramEdge, DiagramNode } from "@/store/diagramStore";
import type { ProjectMeta } from "@/store/projectStore";

import { diagramBounds, portWorldPosition } from "./geometry";

/* ----- Page geometry (mm) ----------------------------------------------- */

const PAGE_W = 420;
const PAGE_H = 297;
const MARGIN = 8;
const TITLE_W = 180;
const TITLE_H = 56;

const DRAW_X = MARGIN;
const DRAW_Y = MARGIN;
const DRAW_W = PAGE_W - 2 * MARGIN;
const DRAW_H = PAGE_H - 2 * MARGIN - TITLE_H;

const TITLE_X = PAGE_W - MARGIN - TITLE_W;
const TITLE_Y = PAGE_H - MARGIN - TITLE_H;

const FRAME_STROKE = 0.4;
const FRAME_STROKE_OUTER = 0.6;

/* ----- Public API ------------------------------------------------------- */

export interface RenderSvgInput {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  meta: ProjectMeta;
}

export function renderDrawingSvg({ nodes, edges, meta }: RenderSvgInput): string {
  const diagram = renderDiagramArea(nodes, edges);
  const titleBlock = renderTitleBlock(meta);
  const frame = renderFrame();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_W}mm" height="${PAGE_H}mm" viewBox="0 0 ${PAGE_W} ${PAGE_H}" style="background:white">
${frame}
${diagram}
${titleBlock}
</svg>`;
}

/* ----- Frame + zone numbering ------------------------------------------- */

function renderFrame(): string {
  const COLS = 8;
  const ROWS = 4;
  const colW = DRAW_W / COLS;
  const rowH = (PAGE_H - 2 * MARGIN) / ROWS;

  const ticks: string[] = [];
  for (let i = 1; i < COLS; i++) {
    const x = DRAW_X + i * colW;
    ticks.push(`<line x1="${x}" y1="${MARGIN}" x2="${x}" y2="${MARGIN + 3}" stroke="black" stroke-width="${FRAME_STROKE}" />`);
    ticks.push(`<line x1="${x}" y1="${PAGE_H - MARGIN}" x2="${x}" y2="${PAGE_H - MARGIN - 3}" stroke="black" stroke-width="${FRAME_STROKE}" />`);
  }
  for (let i = 1; i < ROWS; i++) {
    const y = MARGIN + i * rowH;
    ticks.push(`<line x1="${MARGIN}" y1="${y}" x2="${MARGIN + 3}" y2="${y}" stroke="black" stroke-width="${FRAME_STROKE}" />`);
    ticks.push(`<line x1="${PAGE_W - MARGIN}" y1="${y}" x2="${PAGE_W - MARGIN - 3}" y2="${y}" stroke="black" stroke-width="${FRAME_STROKE}" />`);
  }

  const labels: string[] = [];
  for (let i = 0; i < COLS; i++) {
    const x = DRAW_X + i * colW + colW / 2;
    labels.push(textAt(x, MARGIN - 2.2, `${i + 1}`, 3, "middle"));
    labels.push(textAt(x, PAGE_H - MARGIN + 4.5, `${i + 1}`, 3, "middle"));
  }
  for (let i = 0; i < ROWS; i++) {
    const y = MARGIN + i * rowH + rowH / 2;
    const letter = String.fromCharCode("A".charCodeAt(0) + i);
    labels.push(textAt(MARGIN - 2.5, y + 1, letter, 3, "middle"));
    labels.push(textAt(PAGE_W - MARGIN + 2.5, y + 1, letter, 3, "middle"));
  }

  return `<g>
    <rect x="${MARGIN / 2}" y="${MARGIN / 2}" width="${PAGE_W - MARGIN}" height="${PAGE_H - MARGIN}" fill="none" stroke="black" stroke-width="${FRAME_STROKE}" />
    <rect x="${MARGIN}" y="${MARGIN}" width="${PAGE_W - 2 * MARGIN}" height="${PAGE_H - 2 * MARGIN}" fill="none" stroke="black" stroke-width="${FRAME_STROKE_OUTER}" />
    ${ticks.join("\n")}
    ${labels.join("\n")}
  </g>`;
}

/* ----- Title block ------------------------------------------------------ */

function renderTitleBlock(meta: ProjectMeta): string {
  const rows: string[] = [];

  // Outer block
  rows.push(
    `<rect x="${TITLE_X}" y="${TITLE_Y}" width="${TITLE_W}" height="${TITLE_H}" fill="white" stroke="black" stroke-width="${FRAME_STROKE_OUTER}" />`,
  );

  // Divisions: 3 columns × 4 rows -ish
  const colW = TITLE_W / 3;
  for (let i = 1; i < 3; i++) {
    const x = TITLE_X + i * colW;
    rows.push(line(x, TITLE_Y, x, TITLE_Y + TITLE_H));
  }
  const rowH = TITLE_H / 4;
  for (let i = 1; i < 4; i++) {
    const y = TITLE_Y + i * rowH;
    rows.push(line(TITLE_X, y, TITLE_X + TITLE_W, y));
  }

  function cell(col: number, row: number, label: string, value: string) {
    const cx = TITLE_X + col * colW + 1.5;
    const cy = TITLE_Y + row * rowH + 1.5;
    return `${textAt(cx, cy + 2.4, label, 2.0)}${textAt(cx, cy + 6.2, value, 3, "start", true)}`;
  }

  rows.push(cell(0, 0, "DRAWN BY", meta.drawnBy || "—"));
  rows.push(cell(1, 0, "CHECKED", meta.checkedBy || "—"));
  rows.push(cell(2, 0, "APPROVED", meta.approvedBy || "—"));
  rows.push(cell(0, 1, "DATE", meta.date || "—"));
  rows.push(cell(1, 1, "SCALE", meta.scale || "NTS"));
  rows.push(cell(2, 1, "REV", meta.revision || "0"));

  // Big title row (rows 2-3, all 3 cols)
  rows.push(
    `<rect x="${TITLE_X}" y="${TITLE_Y + 2 * rowH}" width="${TITLE_W}" height="${rowH * 2}" fill="white" stroke="black" stroke-width="${FRAME_STROKE}" />`,
  );
  rows.push(
    textAt(TITLE_X + 2, TITLE_Y + 2 * rowH + 4, "TITLE", 2.2, "start"),
  );
  rows.push(
    textAt(TITLE_X + 2, TITLE_Y + 2 * rowH + 10, meta.title || "Untitled", 4.5, "start", true),
  );
  rows.push(
    textAt(TITLE_X + 2, TITLE_Y + 2 * rowH + 16, meta.drawingNumber || "", 3.2, "start", false),
  );
  rows.push(
    textAt(
      TITLE_X + TITLE_W - 2,
      TITLE_Y + TITLE_H - 2,
      `SHEET ${meta.sheet || "1"} OF ${meta.totalSheets || "1"}`,
      2.8,
      "end",
    ),
  );

  return `<g>${rows.join("")}</g>`;
}

/* ----- Diagram area ----------------------------------------------------- */

function renderDiagramArea(nodes: DiagramNode[], edges: DiagramEdge[]): string {
  // Clip to drawing area minus a small inner margin
  const padding = 4;
  const innerX = DRAW_X + padding;
  const innerY = DRAW_Y + padding;
  const innerW = DRAW_W - 2 * padding;
  const innerH = DRAW_H - 2 * padding;

  if (nodes.length === 0) {
    return `<g>${textAt(innerX + innerW / 2, innerY + innerH / 2, "Drag P&ID symbols onto the canvas to start.", 4, "middle")}</g>`;
  }

  const bounds = diagramBounds(nodes);
  const dw = Math.max(1, bounds.maxX - bounds.minX);
  const dh = Math.max(1, bounds.maxY - bounds.minY);
  const scale = Math.min(innerW / dw, innerH / dh);
  // Centre the diagram inside the drawing area
  const offsetX = innerX + (innerW - dw * scale) / 2 - bounds.minX * scale;
  const offsetY = innerY + (innerH - dh * scale) / 2 - bounds.minY * scale;

  const nodesById = new Map(nodes.map((n) => [n.id, n]));

  const edgePaths = edges.map((edge) => renderEdge(edge, nodesById, scale, offsetX, offsetY)).filter(Boolean);
  const nodeMarkup = nodes.map((n) => renderNode(n, scale, offsetX, offsetY));

  return `<g class="diagram"><g class="edges">${edgePaths.join("")}</g><g class="nodes">${nodeMarkup.join("")}</g></g>`;
}

function renderNode(
  node: DiagramNode,
  scale: number,
  offsetX: number,
  offsetY: number,
): string {
  const symbol = getSymbol(node.data.symbolType);
  if (!symbol) return "";

  const { Icon, size } = symbol;
  const x = node.position.x * scale + offsetX;
  const y = node.position.y * scale + offsetY;
  const w = size.width * scale;
  const h = size.height * scale;
  const rotation = node.data.rotation ?? 0;

  // Render the symbol's React component to static SVG markup.
  const innerSvg = renderToStaticMarkup(
    <Icon width={size.width} height={size.height} />,
  );

  const tag = node.data.tag ?? node.data.label ?? symbol.defaultLabel ?? "";
  const fontSize = Math.max(2.6, Math.min(4.5, h * 0.18));
  const tagY = y + h + fontSize + 0.4;

  return `<g transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) ${
    rotation
      ? `rotate(${rotation} ${(w / 2).toFixed(3)} ${(h / 2).toFixed(3)})`
      : ""
  }" color="#0f172a">
    <g transform="scale(${scale.toFixed(4)})">${innerSvg}</g>
    ${
      tag
        ? `<text x="${(w / 2).toFixed(3)}" y="${(tagY - y).toFixed(3)}" text-anchor="middle" font-size="${fontSize.toFixed(2)}" font-family="Helvetica, Arial, sans-serif" fill="#0f172a">${escapeText(tag)}</text>`
        : ""
    }
  </g>`;
}

function renderEdge(
  edge: DiagramEdge,
  nodesById: Map<string, DiagramNode>,
  scale: number,
  offsetX: number,
  offsetY: number,
): string {
  const source = nodesById.get(edge.source);
  const target = nodesById.get(edge.target);
  if (!source || !target) return "";

  const s = portWorldPosition(source, edge.sourceHandle);
  const t = portWorldPosition(target, edge.targetHandle);

  const sx = s.x * scale + offsetX;
  const sy = s.y * scale + offsetY;
  const tx = t.x * scale + offsetX;
  const ty = t.y * scale + offsetY;

  const [path] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
    sourcePosition: s.position,
    targetPosition: t.position,
    borderRadius: 1.5,
  });

  const lineType = edge.data?.lineType ?? "process";
  const style = LINE_STYLES[lineType];

  // Convert React Flow stroke (pixels) -> mm, roughly: 1 stylepx ≈ 0.3 mm
  const baseW = style.strokeWidth * 0.18;
  const dash = style.strokeDasharray
    ? style.strokeDasharray
        .split(/\s+/)
        .map((n) => (Number.parseFloat(n) * 0.18).toFixed(2))
        .join(" ")
    : undefined;

  const primary = `<path d="${path}" fill="none" stroke="#0f172a" stroke-width="${baseW.toFixed(3)}" ${
    dash ? `stroke-dasharray="${dash}"` : ""
  } />`;

  const overlay =
    style.pattern === "hash"
      ? `<path d="${path}" fill="none" stroke="#0f172a" stroke-width="${(baseW + 0.7).toFixed(3)}" stroke-dasharray="0.2 2" />`
      : "";

  const label = edge.data?.tag
    ? labelAlongPath(sx, sy, tx, ty, edge.data.tag)
    : "";

  return primary + overlay + label;
}

function labelAlongPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  text: string,
): string {
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2 - 1;
  return textAt(mx, my, text, 2.4, "middle");
}

/* ----- SVG primitives --------------------------------------------------- */

function line(x1: number, y1: number, x2: number, y2: number): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="${FRAME_STROKE}" />`;
}

function textAt(
  x: number,
  y: number,
  text: string,
  size = 3,
  anchor: "start" | "middle" | "end" = "start",
  bold = false,
): string {
  return `<text x="${x}" y="${y}" font-size="${size}" font-family="Helvetica, Arial, sans-serif" text-anchor="${anchor}" ${
    bold ? 'font-weight="600"' : ""
  } fill="#0f172a">${escapeText(text)}</text>`;
}

function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
