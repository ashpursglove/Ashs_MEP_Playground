import type { SymbolIconProps } from "@/symbols/types";

interface InstrumentBubbleProps extends SymbolIconProps {
  /** Two-letter ISA function code, e.g. "PI", "PT", "FI". */
  code: string;
  /** Field-mounted (no line) is the v1 default. */
  location?: "field" | "panel-main" | "panel-local";
}

export function InstrumentBubble({
  width,
  height,
  selected,
  code,
  location = "field",
}: InstrumentBubbleProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={width}
      height={height}
      className={selected ? "text-sky-300" : "text-zinc-200"}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx={32} cy={32} r={18} />
      {location === "panel-main" && (
        <line x1={14} y1={32} x2={50} y2={32} />
      )}
      {location === "panel-local" && (
        <g>
          <line x1={14} y1={30} x2={50} y2={30} />
          <line x1={14} y1={34} x2={50} y2={34} />
        </g>
      )}
      <text
        x={32}
        y={32}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontFamily="ui-sans-serif, system-ui"
        fontWeight={500}
        fill="currentColor"
        stroke="none"
      >
        {code}
      </text>
    </svg>
  );
}
