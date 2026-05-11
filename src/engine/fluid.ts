import type { EngineFluid } from "./types";

export const WATER_20C: EngineFluid = {
  id: "water-20c",
  name: "Water (20 °C)",
  densityKgM3: 998.2,
  viscosityPaS: 1.002e-3,
  temperatureC: 20,
};

export const G = 9.80665; // m/s²

/** Convert m³/h -> m³/s. */
export function m3hToM3s(qM3h: number): number {
  return qM3h / 3600;
}

/** Convert m³/s -> m³/h. */
export function m3sToM3h(qM3s: number): number {
  return qM3s * 3600;
}

/** Head (m) -> pressure (Pa). */
export function headToPa(head: number, fluid: EngineFluid): number {
  return head * fluid.densityKgM3 * G;
}

/** Pressure (Pa) -> head (m). */
export function paToHead(pa: number, fluid: EngineFluid): number {
  return pa / (fluid.densityKgM3 * G);
}
