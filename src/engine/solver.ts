/**
 * Single-path hydraulic solver. v1 walks a single chain of components in
 * series; v2 will swap this for a branched / looped solver behind the same
 * `solve()` signature without touching the UI or engine models.
 */

import type {
  ComponentLoss,
  EngineFluid,
  EngineGraph,
  PumpCurvePoint,
  SinglePathResult,
} from "./types";

import { extractPath, type PathStep } from "./path";
import { m3hToM3s, m3sToM3h, paToHead } from "./fluid";
import { buildPumpCurve, type PumpCurveFn } from "./models/pump";
import { pipeLoss } from "./models/pipe";
import { valveDeltaP } from "./models/valve";

export interface SolveInput {
  graph: EngineGraph;
  fluid: EngineFluid;
  startNodeId: string;
  endNodeId: string;
}

export interface ForwardSolveInput extends SolveInput {
  mode: "forward";
}

export interface InverseSolveInput extends SolveInput {
  mode: "inverse";
  /** Desired operating flow in m³/h. */
  targetQM3h: number;
}

export type Solve = ForwardSolveInput | InverseSolveInput;

const MAX_PROBE_QM3H = 2000; // search range upper bound; covers most real pumps

export function solve(input: Solve): SinglePathResult {
  const path = extractPath(input.graph, input.startNodeId, input.endNodeId);
  const warnings: string[] = [];

  const pumps = path
    .map((step) => ({ step, curve: buildPumpCurve(step.node) }))
    .filter((x) => x.curve);
  const pumpCurve = pumps[0]?.curve ?? null;
  if (pumps.length === 0) warnings.push("No pump found along the selected path.");
  if (pumps.length > 1)
    warnings.push("Multiple pumps in series — using the first only (v1).");

  if (input.mode === "forward") {
    return solveForward(input, path, pumpCurve, warnings);
  }
  return solveInverse(input, path, pumpCurve, warnings);
}

/* ----- Forward (find Q given pump) -------------------------------------- */

function solveForward(
  input: ForwardSolveInput,
  path: PathStep[],
  pumpCurve: PumpCurveFn | null,
  warnings: string[],
): SinglePathResult {
  const elevationDelta = sumElevation(path);

  // f(Q) = pump head - (elevation gain + total head loss)
  const f = (qM3s: number) => {
    const head = pumpCurve ? pumpCurve.headAtQM3s(qM3s) : 0;
    const lossHead = paToHead(
      totalLossPa(path, qM3s, input.fluid),
      input.fluid,
    );
    return head - (elevationDelta + lossHead);
  };

  let qM3s = 0;
  if (pumpCurve) {
    qM3s = findRoot(f, m3hToM3s(MAX_PROBE_QM3H));
    if (!Number.isFinite(qM3s)) {
      warnings.push(
        "Pump curve and system curve do not intersect within search range.",
      );
      qM3s = 0;
    }
  } else {
    warnings.push("Without a pump, the operating point cannot be determined.");
  }

  return buildResult({
    input,
    path,
    qM3s,
    pumpCurve,
    warnings,
    elevationDelta,
  });
}

/* ----- Inverse (given Q, what pump head?) ------------------------------- */

function solveInverse(
  input: InverseSolveInput,
  path: PathStep[],
  pumpCurve: PumpCurveFn | null,
  warnings: string[],
): SinglePathResult {
  const elevationDelta = sumElevation(path);
  const qM3s = m3hToM3s(Math.max(0, input.targetQM3h));
  return buildResult({
    input,
    path,
    qM3s,
    pumpCurve,
    warnings,
    elevationDelta,
  });
}

/* ----- Common assembly -------------------------------------------------- */

function buildResult(args: {
  input: SolveInput;
  path: PathStep[];
  qM3s: number;
  pumpCurve: PumpCurveFn | null;
  warnings: string[];
  elevationDelta: number;
}): SinglePathResult {
  const { input, path, qM3s, pumpCurve, warnings, elevationDelta } = args;
  const components: ComponentLoss[] = [];

  for (const step of path) {
    if (step.node.engineModel === "pump" && pumpCurve) {
      const head = pumpCurve.headAtQM3s(qM3s);
      components.push({
        nodeId: step.node.id,
        label: step.node.tag ?? step.node.id,
        kind: "pump",
        deltaPpa: -head * input.fluid.densityKgM3 * 9.80665, // negative = adds head
        headM: -head,
      });
    } else if (step.node.engineModel === "valve") {
      const dp = valveDeltaP(step.node, qM3s, input.fluid);
      components.push({
        nodeId: step.node.id,
        label: step.node.tag ?? step.node.id,
        kind: "valve",
        deltaPpa: dp,
        headM: paToHead(dp, input.fluid),
      });
    }
    if (step.edge) {
      const loss = pipeLoss(step.edge, qM3s, input.fluid);
      components.push({
        edgeId: step.edge.id,
        label: `pipe ${step.node.tag ?? step.node.id} → next`,
        kind: "pipe",
        deltaPpa: loss.totalPa,
        headM: paToHead(loss.totalPa, input.fluid),
        reynolds: loss.reynolds,
        velocityMs: loss.velocityMs,
      });
    }
  }

  const pumpHeadM = pumpCurve ? pumpCurve.headAtQM3s(qM3s) : 0;
  const systemHeadM = components
    .filter((c) => c.kind !== "pump")
    .reduce((acc, c) => acc + c.headM, 0);

  // Sample curves for the chart
  const sampleQs = sampleRange(0, m3hToM3s(MAX_PROBE_QM3H), 60);
  const pumpCurveSampled: PumpCurvePoint[] = pumpCurve
    ? sampleQs.map((q) => ({ q: m3sToM3h(q), h: pumpCurve.headAtQM3s(q) }))
    : [];
  const systemCurveSampled: PumpCurvePoint[] = sampleQs.map((q) => {
    const lossHead = paToHead(totalLossPa(path, q, input.fluid), input.fluid);
    return { q: m3sToM3h(q), h: elevationDelta + lossHead };
  });

  return {
    qM3s,
    qM3h: m3sToM3h(qM3s),
    systemHeadM,
    pumpHeadM,
    elevationDeltaM: elevationDelta,
    components,
    pumpCurveSampled,
    systemCurveSampled,
    warnings,
  };
}

/* ----- Helpers ---------------------------------------------------------- */

function sumElevation(path: PathStep[]): number {
  let total = 0;
  for (const step of path) {
    if (step.edge) total += step.edge.pipe.elevationChangeM || 0;
  }
  return total;
}

function totalLossPa(
  path: PathStep[],
  qM3s: number,
  fluid: EngineFluid,
): number {
  let total = 0;
  for (const step of path) {
    if (step.edge) {
      const loss = pipeLoss(step.edge, qM3s, fluid);
      total += loss.frictionPa + loss.fittingsPa; // elevation kept separate
    }
    if (step.node.engineModel === "valve") {
      total += valveDeltaP(step.node, qM3s, fluid);
    }
  }
  return total;
}

function findRoot(f: (q: number) => number, hiM3s: number): number {
  // f(0) should be > 0 (pump shutoff head exceeds zero loss + zero elevation)
  // f(hi) should be < 0 (system head exceeds pump head at high Q)
  const fLo = f(0);
  const fHi = f(hiM3s);
  if (!Number.isFinite(fLo) || !Number.isFinite(fHi)) return Number.NaN;
  if (Math.sign(fLo) === Math.sign(fHi)) return Number.NaN;

  let lo = 0;
  let hi = hiM3s;
  for (let i = 0; i < 80; i++) {
    const mid = 0.5 * (lo + hi);
    const fMid = f(mid);
    if (Math.abs(fMid) < 1e-3 || (hi - lo) < 1e-8) return mid;
    if (Math.sign(fMid) === Math.sign(fLo)) lo = mid;
    else hi = mid;
  }
  return 0.5 * (lo + hi);
}

function sampleRange(lo: number, hi: number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i <= n; i++) out.push(lo + (i / n) * (hi - lo));
  return out;
}
