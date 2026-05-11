/**
 * BFS path extractor. Operates on the engine graph; only follows process lines
 * (configurable). Returns an alternating sequence of nodes and edges.
 */

import type { EngineGraph, EngineNode, EnginePipeEdge } from "./types";

export interface PathStep {
  node: EngineNode;
  /** Outgoing edge to the next node, undefined for the terminal node. */
  edge?: EnginePipeEdge;
}

interface PathOptions {
  /** If true (default), only follow `lineType === "process"` edges. */
  processOnly?: boolean;
}

export class NoPathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoPathError";
  }
}

export function extractPath(
  graph: EngineGraph,
  startId: string,
  endId: string,
  options: PathOptions = {},
): PathStep[] {
  if (startId === endId) {
    throw new NoPathError("Start and end nodes must differ.");
  }
  const processOnly = options.processOnly ?? true;

  const adj = new Map<string, { to: string; edge: EnginePipeEdge }[]>();
  for (const node of graph.nodes) adj.set(node.id, []);
  for (const edge of graph.edges) {
    if (processOnly && edge.lineType !== "process") continue;
    adj.get(edge.source)?.push({ to: edge.target, edge });
    adj.get(edge.target)?.push({ to: edge.source, edge });
  }

  const predecessor = new Map<string, { from: string; edge: EnginePipeEdge }>();
  const visited = new Set<string>([startId]);
  const queue = [startId];

  while (queue.length) {
    const current = queue.shift()!;
    if (current === endId) break;
    for (const { to, edge } of adj.get(current) ?? []) {
      if (visited.has(to)) continue;
      visited.add(to);
      predecessor.set(to, { from: current, edge });
      queue.push(to);
    }
  }

  if (!predecessor.has(endId)) {
    throw new NoPathError(
      "No process-line path exists between the selected components.",
    );
  }

  // Reconstruct
  const ordered: { id: string; edge?: EnginePipeEdge }[] = [{ id: endId }];
  let cursor = endId;
  while (cursor !== startId) {
    const step = predecessor.get(cursor)!;
    ordered.unshift({ id: step.from, edge: step.edge });
    cursor = step.from;
  }

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  return ordered.map(({ id, edge }) => ({
    node: nodeMap.get(id)!,
    edge,
  }));
}
