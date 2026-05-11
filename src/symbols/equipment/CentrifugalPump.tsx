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
      <circle cx={32} cy={36} r={18} />
      <path d="M 14 50 L 50 50 L 32 18 Z" />
      <line x1={12} y1={36} x2={14} y2={36} />
      <line x1={32} y1={14} x2={32} y2={18} />
    </svg>
  );
}
