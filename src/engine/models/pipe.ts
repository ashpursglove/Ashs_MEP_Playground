import type { EngineFluid, EnginePipeEdge, PipeProps } from "@/engine/types";

import {
  darcyWeisbachDeltaP,
  elevationDeltaP,
  fittingDeltaP,
  reynolds,
  velocity,
} from "@/engine/hydraulics";

export interface PipeLossResult {
  /** Friction loss in Pa. */
  frictionPa: number;
  /** Total fittings loss in Pa. */
  fittingsPa: number;
  /** Static elevation pressure rise (signed). */
  elevationPa: number;
  /** Sum (Pa). Positive = consumes head, negative = recovers head (downhill). */
  totalPa: number;
  reynolds: number;
  velocityMs: number;
}

const MIN_PIPE_LEN = 0.001;

export function pipeLoss(
  edge: EnginePipeEdge,
  qM3s: number,
  fluid: EngineFluid,
): PipeLossResult {
  const pipe: PipeProps = edge.pipe;
  const D = (pipe.innerDiameterMm || 0) / 1000;
  const L = Math.max(MIN_PIPE_LEN, pipe.lengthM || 0);
  const roughM = (pipe.roughnessMm || 0) / 1000;

  const frictionPa = darcyWeisbachDeltaP(qM3s, L, D, roughM, fluid);
  const totalK = (pipe.fittings ?? []).reduce(
    (acc, f) => acc + f.k * f.count,
    0,
  );
  const fittingsPa = fittingDeltaP(qM3s, D, totalK, fluid);
  const elevationPa = elevationDeltaP(pipe.elevationChangeM || 0, fluid);

  return {
    frictionPa,
    fittingsPa,
    elevationPa,
    totalPa: frictionPa + fittingsPa + elevationPa,
    reynolds: reynolds(qM3s, D, fluid),
    velocityMs: velocity(qM3s, D),
  };
}
