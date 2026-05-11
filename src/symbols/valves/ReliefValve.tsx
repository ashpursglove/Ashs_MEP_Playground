import type { SymbolIconProps } from "@/symbols/types";

export function ReliefValve({ width, height, selected }: SymbolIconProps) {
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
      {/* angled valve body: horizontal inlet leg + vertical outlet leg */}
      <path d="M 8 32 L 8 44 L 32 38 Z" />
      <path d="M 32 38 L 26 12 L 38 12 Z" />
      <line x1={32} y1={12} x2={32} y2={4} />
      {/* spring coil */}
      <path d="M 26 8 L 38 6 L 26 4" />
    </svg>
  );
}
