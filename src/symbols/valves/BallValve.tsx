import type { SymbolIconProps } from "@/symbols/types";
import { Bowtie } from "./Bowtie";

export function BallValve(props: SymbolIconProps) {
  return <Bowtie {...props} overlay={<circle cx={32} cy={32} r={6} />} />;
}
