/**
 * Shared layout primitives for note/text annotations. Used by both the live
 * editor preview (`PagePreview.tsx`) and the PDF/SVG renderer
 * (`drawingsRender.tsx`) so a note that fits on screen also fits in the
 * exported PDF — and so a single change to wrapping rules touches both
 * code paths at once.
 *
 * Annotation positions and sizes are in millimetres (page-space), matching
 * the rest of the drawings pipeline.
 *
 * Width measurement is glyph-accurate: we measure each candidate line via a
 * 2D canvas with the same font stack the SVG ends up rendering with, so a
 * string of `w`s gets the wide box it actually needs and a string of `i`s
 * doesn't get the wide box it doesn't. The character-count heuristic only
 * kicks in if there's no DOM (e.g. unit tests) and is signposted as such.
 */

/** Maximum width of a note bubble before text wraps. ~3 inches — wide
 *  enough for a short paragraph, narrow enough to leave room on an A3
 *  sheet for the diagram. */
export const NOTE_MAX_WIDTH_MM = 80;

/** Internal padding between the note's outer rect and its text. */
export const NOTE_PADDING_MM = 1.5;

/** Vertical line spacing factor added to font size. */
export const NOTE_LINE_GAP_MM = 0.6;

/** Multiplicative safety margin around measured widths to absorb the small
 *  difference between canvas glyph metrics and SVG glyph metrics for the
 *  same font. 1.04 = 4% extra. */
const WIDTH_SAFETY_MARGIN = 1.04;

/** Font stack the SVG annotation text uses. MUST be byte-identical to the
 *  `font-family` strings in PagePreview / drawingsRender so canvas and SVG
 *  resolve to the same physical font and our measurements match what
 *  actually renders. */
const NOTE_FONT_STACK = `Inter, Helvetica, Arial, sans-serif`;

/** Character-width fallback when canvas measurement is unavailable. */
const FALLBACK_CHAR_WIDTH_FACTOR = 0.62;

let cachedCtx: CanvasRenderingContext2D | null | undefined;

function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (cachedCtx !== undefined) return cachedCtx;
  if (typeof document === "undefined") {
    cachedCtx = null;
    return null;
  }
  const canvas = document.createElement("canvas");
  cachedCtx = canvas.getContext("2d");
  return cachedCtx;
}

/**
 * Glyph-accurate text width in millimetres. Canvas measures in pixels, but
 * the glyph-width-to-font-size ratio is a typeface invariant — so feeding
 * the canvas a numeric font size that equals our mm value gives us a width
 * whose numeric value matches what the SVG will render in mm.
 *
 * Returns a small-multiplier-padded width so layout tolerates the typical
 * 1-3% drift between canvas and SVG glyph metrics for the same font.
 */
export function measureTextWidthMm(text: string, fontSizeMm: number): number {
  if (text.length === 0) return 0;
  const ctx = getCanvasCtx();
  if (!ctx) {
    return text.length * fontSizeMm * FALLBACK_CHAR_WIDTH_FACTOR;
  }
  ctx.font = `${fontSizeMm}px ${NOTE_FONT_STACK}`;
  return ctx.measureText(text).width * WIDTH_SAFETY_MARGIN;
}

/**
 * Word-wrap a single line of text into runs that each fit within
 * `maxWidthMm` when rendered at `fontSize`. Words wider than the limit
 * (e.g. a 60-character keysmash with no spaces) are hard-broken at
 * character boundaries via binary search.
 */
function wrapSingleLine(
  line: string,
  fontSize: number,
  maxWidthMm: number,
): string[] {
  if (line === "" || measureTextWidthMm(line, fontSize) <= maxWidthMm) {
    return [line];
  }

  const out: string[] = [];
  // `split(/(\s+)/)` keeps the whitespace runs as separate tokens so we can
  // rejoin them on the same line without losing spacing.
  const tokens = line.split(/(\s+)/).filter((t) => t !== "");
  let current = "";

  function flush() {
    if (current) {
      out.push(current.replace(/\s+$/, ""));
      current = "";
    }
  }

  // Hard-break a single overlong token at the longest prefix that fits.
  function hardBreak(word: string) {
    let remaining = word;
    while (measureTextWidthMm(remaining, fontSize) > maxWidthMm) {
      // Binary search for the longest prefix of `remaining` whose width
      // stays under maxWidthMm. Each iteration of this outer while loop
      // emits one wrapped line for the word and shrinks `remaining`.
      let lo = 1;
      let hi = remaining.length;
      while (lo < hi) {
        const mid = Math.floor((lo + hi + 1) / 2);
        if (measureTextWidthMm(remaining.slice(0, mid), fontSize) <= maxWidthMm) {
          lo = mid;
        } else {
          hi = mid - 1;
        }
      }
      out.push(remaining.slice(0, lo));
      remaining = remaining.slice(lo);
    }
    current = remaining;
  }

  for (const token of tokens) {
    const isWs = /^\s+$/.test(token);

    if (isWs) {
      // Whitespace is meaningful only as a separator. Drop it if it'd
      // overflow on its own (rare but possible at the line edge).
      if (!current) continue;
      if (measureTextWidthMm(current + token, fontSize) <= maxWidthMm) {
        current += token;
      }
      continue;
    }

    // Token by itself overflows — flush the current buffer and hard-break.
    if (measureTextWidthMm(token, fontSize) > maxWidthMm) {
      flush();
      hardBreak(token);
      continue;
    }

    // Normal word: append if it fits, otherwise wrap to a new line.
    if (
      current &&
      measureTextWidthMm(current + token, fontSize) > maxWidthMm
    ) {
      flush();
      current = token;
    } else {
      current += token;
    }
  }
  flush();
  return out.length > 0 ? out : [""];
}

/**
 * Wrap a multi-line string into the final rendered lines for a note. Empty
 * input lines (from `\n\n`) are preserved so users can produce paragraph
 * spacing inside a note.
 */
export function wrapNoteText(
  text: string,
  fontSize: number,
  maxWidthMm: number = NOTE_MAX_WIDTH_MM,
): string[] {
  const usable = maxWidthMm - 2 * NOTE_PADDING_MM;
  const out: string[] = [];
  for (const ln of (text ?? "").split("\n")) {
    if (ln === "") {
      out.push("");
      continue;
    }
    out.push(...wrapSingleLine(ln, fontSize, usable));
  }
  return out.length > 0 ? out : [""];
}

export interface NoteBox {
  lines: string[];
  /** Outer rectangle width in mm. */
  w: number;
  /** Outer rectangle height in mm. */
  h: number;
  padding: number;
  lineHeight: number;
}

/**
 * Compute the rendered bounding box for a note annotation, including the
 * wrapped text lines. The returned `w`/`h` are the outer rectangle in mm;
 * callers position it at the annotation's (x, y) corner.
 *
 * Width is the actual measured width of the widest wrapped line, plus the
 * padding on both sides — never narrower than 20 mm, never wider than the
 * wrap limit.
 */
export function computeNoteBox(
  text: string,
  fontSize: number,
  maxWidthMm: number = NOTE_MAX_WIDTH_MM,
): NoteBox {
  const lines = wrapNoteText(text, fontSize, maxWidthMm);
  const lineHeight = fontSize + NOTE_LINE_GAP_MM;
  let maxRendered = 0;
  for (const ln of lines) {
    const w = measureTextWidthMm(ln, fontSize);
    if (w > maxRendered) maxRendered = w;
  }
  const naturalW = maxRendered + 2 * NOTE_PADDING_MM;
  const w = Math.min(maxWidthMm, Math.max(20, naturalW));
  const h = Math.max(1, lines.length) * lineHeight + 2 * NOTE_PADDING_MM;
  return { lines, w, h, padding: NOTE_PADDING_MM, lineHeight };
}
