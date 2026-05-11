import type { ParamFieldSchema } from "@/symbols/types";

/**
 * Shared schema for edge (pipe) properties shown in the Inspector. Mirrors the
 * `PipeEdgeData.pipe` shape so the inspector can build a form generically.
 */
export const PIPE_PARAM_SCHEMA: ParamFieldSchema[] = [
  {
    key: "lengthM",
    label: "Length",
    unit: "m",
    kind: "number",
    default: 1,
    min: 0,
  },
  {
    key: "innerDiameterMm",
    label: "Inner diameter",
    unit: "mm",
    kind: "number",
    default: 50,
    min: 0,
  },
  {
    key: "roughnessMm",
    label: "Roughness",
    unit: "mm",
    kind: "number",
    default: 0.045,
    min: 0,
    step: 0.001,
    description: "Absolute roughness. 0.045 mm for commercial steel.",
  },
  {
    key: "elevationChangeM",
    label: "Elevation change",
    unit: "m",
    kind: "number",
    default: 0,
    description: "Positive = pipe rises from source to target.",
  },
  {
    key: "fittings",
    label: "Fittings",
    kind: "fittings",
  },
];
