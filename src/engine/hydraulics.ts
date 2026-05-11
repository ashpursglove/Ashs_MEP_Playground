/**
 * Core hydraulic primitives. All inputs are SI: m, kg, s, Pa.
 */

import type { EngineFluid } from "./types";

const MIN_RE = 1; // avoid div-by-zero in laminar formulas

/** Cross-sectional area of a circular pipe (m²) from inner diameter (m). */
export function pipeArea(innerDiameterM: number): number {
  return (Math.PI * innerDiameterM * innerDiameterM) / 4;
}

/** Velocity (m/s) given flow Q (m³/s) and inner diameter (m). */
export function velocity(qM3s: number, innerDiameterM: number): number {
  if (innerDiameterM <= 0) return 0;
  return qM3s / pipeArea(innerDiameterM);
}

/** Reynolds number for circular pipe flow. */
export function reynolds(
  qM3s: number,
  innerDiameterM: number,
  fluid: EngineFluid,
): number {
  if (innerDiameterM <= 0 || fluid.viscosityPaS <= 0) return MIN_RE;
  const v = velocity(qM3s, innerDiameterM);
  return Math.max(
    MIN_RE,
    (fluid.densityKgM3 * Math.abs(v) * innerDiameterM) / fluid.viscosityPaS,
  );
}

/**
 * Darcy friction factor.
 *
 * - Re < 2300:    f = 64/Re (laminar)
 * - Re > 4000:    Swamee–Jain explicit approximation of Colebrook–White
 * - 2300–4000:    linear blend in log-space (avoids discontinuity)
 */
export function frictionFactor(
  re: number,
  roughnessM: number,
  innerDiameterM: number,
): number {
  if (re <= 0 || innerDiameterM <= 0) return 0;
  if (re < 2300) return 64 / re;
  const fTurb = swameeJain(re, roughnessM, innerDiameterM);
  if (re >= 4000) return fTurb;
  // Transition blend
  const fLam = 64 / re;
  const t = (re - 2300) / (4000 - 2300);
  return fLam * (1 - t) + fTurb * t;
}

function swameeJain(
  re: number,
  roughnessM: number,
  innerDiameterM: number,
): number {
  const eOverD = roughnessM / innerDiameterM;
  const log = Math.log10(eOverD / 3.7 + 5.74 / Math.pow(re, 0.9));
  return 0.25 / (log * log);
}

/** Darcy-Weisbach pressure drop along a pipe (Pa). Always non-negative. */
export function darcyWeisbachDeltaP(
  qM3s: number,
  lengthM: number,
  innerDiameterM: number,
  roughnessM: number,
  fluid: EngineFluid,
): number {
  if (innerDiameterM <= 0 || lengthM <= 0) return 0;
  const v = velocity(qM3s, innerDiameterM);
  const re = reynolds(qM3s, innerDiameterM, fluid);
  const f = frictionFactor(re, roughnessM, innerDiameterM);
  return f * (lengthM / innerDiameterM) * 0.5 * fluid.densityKgM3 * v * v;
}

/** Pressure drop across a fitting (Pa) given a total K-value. */
export function fittingDeltaP(
  qM3s: number,
  innerDiameterM: number,
  totalK: number,
  fluid: EngineFluid,
): number {
  if (innerDiameterM <= 0 || totalK <= 0) return 0;
  const v = velocity(qM3s, innerDiameterM);
  return totalK * 0.5 * fluid.densityKgM3 * v * v;
}

/** Hydrostatic head loss/gain for elevation change (Pa). +ve = pipe rises. */
export function elevationDeltaP(
  elevationChangeM: number,
  fluid: EngineFluid,
): number {
  return elevationChangeM * fluid.densityKgM3 * 9.80665;
}
