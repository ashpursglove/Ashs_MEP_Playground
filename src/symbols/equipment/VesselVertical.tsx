import type { SymbolIconProps } from "@/symbols/types";

export function VesselVertical({ width, height, selected }: SymbolIconProps) {
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
      <rect x={22} y={8} width={20} height={48} rx={10} ry={10} />
    </svg>
  );
}
