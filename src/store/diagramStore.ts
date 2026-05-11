import { create } from "zustand";
import { temporal } from "zundo";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type Connection,
} from "@xyflow/react";

import type { LineType, PipeEdgeData, SymbolNodeData } from "@/types/diagram";

export type DiagramNode = Node<SymbolNodeData>;
export type DiagramEdge = Edge<PipeEdgeData>;

interface DiagramState {
  nodes: DiagramNode[];
  edges: DiagramEdge[];

  /** Selected node/edge ids (single-select for the inspector). */
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  onNodesChange: (changes: NodeChange<DiagramNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<DiagramEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  onSelectionChange: (params: { nodes: DiagramNode[]; edges: DiagramEdge[] }) => void;

  addNode: (node: DiagramNode) => void;
  updateNodeData: (id: string, patch: Partial<SymbolNodeData>) => void;
  updateEdgeData: (id: string, patch: Partial<PipeEdgeData>) => void;
  removeSelected: () => void;
  replaceAll: (nodes: DiagramNode[], edges: DiagramEdge[]) => void;
  clear: () => void;

  nextLineType: LineType;
  setNextLineType: (lineType: LineType) => void;
}

export const useDiagramStore = create<DiagramState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,

      onNodesChange: (changes) =>
        set({ nodes: applyNodeChanges(changes, get().nodes) }),

      onEdgesChange: (changes) =>
        set({ edges: applyEdgeChanges(changes, get().edges) }),

      onConnect: (connection) =>
        set({
          edges: addEdge<DiagramEdge>(
            {
              ...connection,
              type: "pipe",
              data: { lineType: get().nextLineType },
            },
            get().edges,
          ),
        }),

      /**
       * Set by the UI before a connection is created so onConnect can stamp the
       * new edge with the active line type without a circular store dependency.
       */
      nextLineType: "process",
      setNextLineType: (lineType) => set({ nextLineType: lineType }),

      onSelectionChange: ({ nodes, edges }) =>
        set({
          selectedNodeId: nodes[0]?.id ?? null,
          selectedEdgeId: edges[0]?.id ?? null,
        }),

      addNode: (node) => set({ nodes: [...get().nodes, node] }),

      updateNodeData: (id, patch) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
          ),
        }),

      updateEdgeData: (id, patch) =>
        set({
          edges: get().edges.map((e) =>
            e.id === id
              ? { ...e, data: { ...(e.data ?? {}), ...patch } }
              : e,
          ),
        }),

      removeSelected: () => {
        const { selectedNodeId, selectedEdgeId, nodes, edges } = get();
        if (selectedNodeId) {
          set({
            nodes: nodes.filter((n) => n.id !== selectedNodeId),
            edges: edges.filter(
              (e) => e.source !== selectedNodeId && e.target !== selectedNodeId,
            ),
            selectedNodeId: null,
          });
        } else if (selectedEdgeId) {
          set({
            edges: edges.filter((e) => e.id !== selectedEdgeId),
            selectedEdgeId: null,
          });
        }
      },

      replaceAll: (nodes, edges) =>
        set({
          nodes,
          edges,
          selectedNodeId: null,
          selectedEdgeId: null,
        }),

      clear: () =>
        set({
          nodes: [],
          edges: [],
          selectedNodeId: null,
          selectedEdgeId: null,
        }),
    }),
    {
      // Only track diagram geometry/data in history, not transient selection.
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
      limit: 100,
    },
  ),
);

/** Convenience hook for the temporal API (undo/redo/clear). */
export function useDiagramHistory() {
  return useDiagramStore.temporal;
}
