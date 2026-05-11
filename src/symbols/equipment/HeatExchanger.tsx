import type { SymbolIconProps } from "@/symbols/types";

export function HeatExchanger({ width, height, selected }: SymbolIconProps) {
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
      <rect x={4} y={18} width={56} height={28} rx={14} ry={14} />
      <line x1={6} y1={26} x2={58} y2={26} />
      <line x1={6} y1={38} x2={58} y2={38} />
      <line x1={20} y1={18} x2={20} y2={46} />
      <line x1={44} y1={18} x2={44} y2={46} />
    </svg>
  );
}
