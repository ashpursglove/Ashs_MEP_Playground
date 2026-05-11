import type { ReactNode } from "react";
import type { SymbolIconProps } from "@/symbols/types";

interface BowtieProps extends SymbolIconProps {
  /** Extra glyph drawn inside the SVG (knob, actuator, etc.) */
  overlay?: ReactNode;
}

/** Shared bowtie body used by every inline valve symbol. */
export function Bowtie({ width, height, selected, overlay }: BowtieProps) {
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
      <path d="M 8 20 L 8 44 L 32 32 Z" />
      <path d="M 56 20 L 56 44 L 32 32 Z" />
      {overlay}
    </svg>
  );
}
