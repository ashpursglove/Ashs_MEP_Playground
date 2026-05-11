import type { EngineNode, PumpCurvePoint } from "@/engine/types";

import { leastSquaresPoly2 } from "@/engine/math/leastSquares";
import { m3sToM3h } from "@/engine/fluid";

/**
 * Quadratic pump curve: H(Q) = a + b·Q + c·Q²  (Q in m³/h, H in m).
 *
 * Built from manufacturer points by least-squares; falls back to a synthetic
 * curve derived from `ratedHeadM` / `ratedFlowM3H` / `shutoffHeadM` when no
 * explicit points are provided.
 */
export interface PumpCurveFn {
  /** Evaluate head (m) at a given Q in m³/s. */
  headAtQM3s: (qM3s: number) => number;
  /** Evaluate head at Q in m³/h. */
  headAtQM3h: (qM3h: number) => number;
  /** Coefficients [a, b, c] for H = a + b·Qh + c·Qh². */
  coeffs: [number, number, number];
  /** Original / generated curve points (m³/h, m). */
  points: PumpCurvePoint[];
}

export function buildPumpCurve(node: EngineNode): PumpCurveFn | null {
  if (node.engineModel !== "pump") return null;
  const params = node.params ?? {};
  const rawPoints = Array.isArray(params.curve)
    ? (params.curve as PumpCurvePoint[]).filter(
        (p) => Number.isFinite(p.q) && Number.isFinite(p.h),
      )
    : [];

  const points: PumpCurvePoint[] = rawPoints.length
    ? rawPoints
    : synthesiseCurve(params);

  const coeffs = leastSquaresPoly2(points.map((p) => ({ x: p.q, y: p.h })));
  const [a, b, c] = coeffs;
  const headAtQM3h = (qh: number) => a + b * qh + c * qh * qh;
  return {
    coeffs,
    points,
    headAtQM3h,
    headAtQM3s: (qs: number) => headAtQM3h(m3sToM3h(qs)),
  };
}

function synthesiseCurve(params: Record<string, unknown>): PumpCurvePoint[] {
  const ratedH = num(params.ratedHeadM, 30);
  const ratedQ = num(params.ratedFlowM3H, 50);
  const shutoff = num(params.shutoffHeadM, ratedH * 1.3);
  // Generate 5 points along a parabola passing through (0, shutoff), (ratedQ, ratedH),
  // and crossing zero head at q ≈ 1.6·ratedQ.
  const maxQ = ratedQ * 1.6;
  const xs = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxQ);
  return xs.map((q) => {
    // H = shutoff - (shutoff - ratedH) * (q/ratedQ)^2 / scaled
    const t = q / maxQ;
    const h = shutoff * (1 - t * t * 0.95) - (shutoff - ratedH) * 0.05 * t;
    return { q: round(q, 3), h: round(Math.max(0, h), 3) };
  });
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function round(x: number, digits: number): number {
  const k = 10 ** digits;
  return Math.round(x * k) / k;
}
