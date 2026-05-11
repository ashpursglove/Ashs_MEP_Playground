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
import { resolvePipePreset, type PipeMaterialId } from "@/presets/pipes";

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
  /** Atomic add nodes / add edges / remove edges (used for tap-point insertion). */
  applyChanges: (changes: {
    addNodes?: DiagramNode[];
    addEdges?: DiagramEdge[];
    removeEdges?: string[];
  }) => void;
  updateNodeData: (id: string, patch: Partial<SymbolNodeData>) => void;
  updateEdgeData: (id: string, patch: Partial<PipeEdgeData>) => void;
  rotateSelected: (deltaDeg: number) => void;
  removeSelected: () => void;
  replaceAll: (nodes: DiagramNode[], edges: DiagramEdge[]) => void;
  clear: () => void;

  nextLineType: LineType;
  setNextLineType: (lineType: LineType) => void;

  /**
   * Sticky pipe preset applied to every new process line. Starts at PVC DN50
   * and updates whenever the user picks a different material/size in the
   * inspector, so the next line they draw inherits the same choice.
   */
  lastPipeMaterial: PipeMaterialId;
  lastPipeNominal: string;
  setLastPipePreset: (material: PipeMaterialId, nominal: string) => void;
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

      onConnect: (connection) => {
        const lineType = get().nextLineType;
        const data: PipeEdgeData = { lineType };
        // Only process pipes carry hydraulic properties; utility/pneumatic
        // signal lines just need the line type.
        if (lineType === "process") {
          const m = get().lastPipeMaterial;
          const n = get().lastPipeNominal;
          const preset = resolvePipePreset(m, n);
          if (preset) {
            data.pipe = {
              innerDiameterMm: preset.innerDiameterMm,
              roughnessMm: preset.roughnessMm,
              presetMaterialId: m,
              presetNominalId: n,
              fittings: [],
              // length & elevation are deliberately left undefined so the
              // user is forced to enter the real route geometry.
            };
          }
        }
        set({
          edges: addEdge<DiagramEdge>(
            { ...connection, type: "pipe", data },
            get().edges,
          ),
        });
      },

      /**
       * Set by the UI before a connection is created so onConnect can stamp the
       * new edge with the active line type without a circular store dependency.
       */
      nextLineType: "process",
      setNextLineType: (lineType) => set({ nextLineType: lineType }),

      lastPipeMaterial: "pvc",
      lastPipeNominal: "dn50",
      setLastPipePreset: (material, nominal) =>
        set({ lastPipeMaterial: material, lastPipeNominal: nominal }),

      onSelectionChange: ({ nodes, edges }) =>
        set({
          selectedNodeId: nodes[0]?.id ?? null,
          selectedEdgeId: edges[0]?.id ?? null,
        }),

      addNode: (node) => set({ nodes: [...get().nodes, node] }),

      applyChanges: ({ addNodes, addEdges, removeEdges }) => {
        const removed = new Set(removeEdges ?? []);
        set({
          nodes: addNodes?.length
            ? [...get().nodes, ...addNodes]
            : get().nodes,
          edges: [
            ...get().edges.filter((e) => !removed.has(e.id)),
            ...(addEdges ?? []),
          ],
        });
      },

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

      rotateSelected: (deltaDeg) => {
        const { selectedNodeId, nodes } = get();
        if (!selectedNodeId) return;
        const node = nodes.find((n) => n.id === selectedNodeId);
        if (!node) return;
        const current = (node.data.rotation ?? 0) as number;
        const next = (((current + deltaDeg) % 360) + 360) % 360;
        set({
          nodes: nodes.map((n) =>
            n.id === selectedNodeId
              ? { ...n, data: { ...n.data, rotation: next } }
              : n,
          ),
        });
      },

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
