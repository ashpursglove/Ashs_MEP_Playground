import type { SymbolIconProps } from "@/symbols/types";

export function PositiveDisplacementPump({ width, height, selected }: SymbolIconProps) {
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
      <circle cx={32} cy={32} r={20} />
      <circle cx={22} cy={32} r={6} />
      <circle cx={42} cy={32} r={6} />
    </svg>
  );
}
