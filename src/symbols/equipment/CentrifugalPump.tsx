import type { SymbolIconProps } from "@/symbols/types";

export function CentrifugalPump({ width, height, selected }: SymbolIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={width}
      height={height}
      className={selected ? "text-sky-300" : "text-zinc-200"}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
    >
      {/* Circle centred in the 64×64 box so the suction (bottom) and discharge
          (top) nozzles sit symmetrically across the impeller. The inscribed
          equilateral triangle has its apex at 12 o'clock (pointing toward the
          discharge) and its base at the 7 and 5 o'clock positions. */}
      <circle cx={32} cy={32} r={18} />
      <path d="M 32 14 L 47.59 41 L 16.41 41 Z" />
      {/* Discharge nozzle stub (top) */}
      <line x1={32} y1={2} x2={32} y2={14} />
      {/* Suction nozzle stub (bottom — 180° from discharge) */}
      <line x1={32} y1={50} x2={32} y2={62} />
    </svg>
  );
}
