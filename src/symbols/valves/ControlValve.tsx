import type { SymbolIconProps } from "@/symbols/types";
import { Bowtie } from "./Bowtie";

export function ControlValve(props: SymbolIconProps) {
  return (
    <Bowtie
      {...props}
      overlay={
        <g>
          <line x1={32} y1={32} x2={32} y2={14} />
          <rect x={22} y={4} width={20} height={12} rx={2} />
          <line x1={22} y1={4} x2={42} y2={16} />
          <line x1={42} y1={4} x2={22} y2={16} />
        </g>
      }
    />
  );
}
