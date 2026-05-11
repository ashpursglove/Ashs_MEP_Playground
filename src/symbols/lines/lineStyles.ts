import type { LineType } from "@/types/diagram";
import type { LineStyleDef } from "@/symbols/types";

export const LINE_STYLES: Record<LineType, LineStyleDef> = {
  process: {
    type: "process",
    label: "Process",
    description: "Main process flow",
    stroke: "#e5e7eb",
    strokeWidth: 2.25,
  },
  utility: {
    type: "utility",
    label: "Utility",
    description: "Utility services (steam, water, air)",
    stroke: "#9ca3af",
    strokeWidth: 1.5,
  },
  pneumatic: {
    type: "pneumatic",
    label: "Pneumatic signal",
    description: "Instrument pneumatic signal",
    stroke: "#fde68a",
    strokeWidth: 1.5,
    pattern: "hash",
  },
  electric: {
    type: "electric",
    label: "Electric signal",
    description: "Electrical / electronic signal",
    stroke: "#86efac",
    strokeWidth: 1.5,
    strokeDasharray: "6 3",
  },
};

export const LINE_TYPE_ORDER: LineType[] = [
  "process",
  "utility",
  "pneumatic",
  "electric",
];
