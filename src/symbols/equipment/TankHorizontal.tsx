import type { SymbolIconProps } from "@/symbols/types";

export function TankHorizontal({ width, height, selected }: SymbolIconProps) {
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
      <rect x={6} y={20} width={52} height={24} rx={12} ry={12} />
    </svg>
  );
}
