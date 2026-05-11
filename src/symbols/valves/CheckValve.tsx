import type { SymbolIconProps } from "@/symbols/types";
import { Bowtie } from "./Bowtie";

export function CheckValve(props: SymbolIconProps) {
  return (
    <Bowtie
      {...props}
      overlay={<circle cx={40} cy={32} r={3.5} fill="currentColor" />}
    />
  );
}
