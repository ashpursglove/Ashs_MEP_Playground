/**
 * Bridge from the diagram store's React Flow types into the engine's pure
 * graph types. Defaults are applied here so the engine can assume sane values.
 */

import type { DiagramEdge, DiagramNode } from "@/store/diagramStore";
import { getSymbol } from "@/symbols/registry";
import type { EngineModel } from "@/symbols/types";

import type { EngineGraph, EnginePipeEdge, PipeProps } from "./types";

const DEFAULT_PIPE: PipeProps = {
  lengthM: 1,
  innerDiameterMm: 50,
  roughnessMm: 0.045,
  elevationChangeM: 0,
  fittings: [],
};

export function toEngineGraph(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
): EngineGraph {
  const engineNodes = nodes.map((n) => {
    const symbol = getSymbol(n.data.symbolType);
    return {
      id: n.id,
      symbolType: n.data.symbolType,
      engineModel: (symbol?.engineModel ?? "passive") as EngineModel,
      tag: n.data.tag ?? n.data.label,
      params: (n.data.params ?? {}) as Record<string, unknown>,
    };
  });

  const engineEdges: EnginePipeEdge[] = edges.map((e) => {
    const data = e.data ?? {};
    const userPipe = (data.pipe ?? {}) as Partial<PipeProps>;
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
      lineType: data.lineType ?? "process",
      pipe: { ...DEFAULT_PIPE, ...userPipe, fittings: userPipe.fittings ?? [] },
    };
  });

  return { nodes: engineNodes, edges: engineEdges };
}
