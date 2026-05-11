import type { SymbolIconProps } from "@/symbols/types";

export function Column({ width, height, selected }: SymbolIconProps) {
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
      <rect x={22} y={4} width={20} height={56} rx={10} ry={10} />
      {[14, 22, 30, 38, 46, 54].map((y) => (
        <line key={y} x1={24} y1={y} x2={40} y2={y} />
      ))}
    </svg>
  );
}
