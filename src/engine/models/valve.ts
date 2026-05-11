import type { EngineFluid, EngineNode } from "@/engine/types";

/**
 * ΔP across a valve from its flow coefficient Cv (US definition).
 *
 *   Q [gpm] = Cv · √(ΔP [psi] / SG)
 *
 * Converted to SI: ΔP [Pa] = (Q [m³/s] / (Cv · 0.865·10⁻⁵))² · ρ · g
 * — using the conversion 1 gpm ≈ 6.309·10⁻⁵ m³/s and 1 psi ≈ 6894.76 Pa.
 *
 * Simpler form (Crane TP-410): ΔP_Pa = ρ_water * (Q_m3h / (Kv))²  with Kv ≈ Cv·0.865
 * but here we use a unified SI helper.
 */

const GPM_TO_M3S = 6.30902e-5;
const PSI_TO_PA = 6894.76;

export function valveDeltaP(
  node: EngineNode,
  qM3s: number,
  fluid: EngineFluid,
): number {
  const params = node.params ?? {};
  const cvRated = numField(params.Cv, 50);
  const open = clamp(numField(params.openFraction, 1), 0.0001, 1);
  // Effective Cv scales roughly linearly with stem opening for the v1 model.
  const cvEff = cvRated * open;
  if (cvEff <= 0 || qM3s <= 0) return 0;

  // Specific gravity relative to water at 4 °C (≈1000 kg/m³).
  const sg = fluid.densityKgM3 / 1000;
  const qGpm = qM3s / GPM_TO_M3S;
  const dpPsi = (qGpm / cvEff) ** 2 * sg;
  return dpPsi * PSI_TO_PA;
}

function numField(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}
