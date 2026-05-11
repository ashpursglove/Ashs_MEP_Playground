import { useCallback, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  useReactFlow,
  type OnSelectionChangeParams,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useShallow } from "zustand/react/shallow";

import {
  useDiagramStore,
  type DiagramEdge,
  type DiagramNode,
} from "@/store/diagramStore";
import { getSymbol } from "@/symbols/registry";
import { SymbolNode } from "@/components/Canvas/SymbolNode";
import { PipeEdge } from "@/components/Canvas/PipeEdge";
import { DRAG_DATA_TYPE } from "@/components/Palette/dragMime";
import { nextTag } from "@/components/Canvas/autoTag";
import { cn } from "@/lib/utils";

interface CanvasProps {
  className?: string;
}

const nodeTypes: NodeTypes = { symbol: SymbolNode };
const edgeTypes: EdgeTypes = { pipe: PipeEdge };

let idCounter = 0;
function nextNodeId() {
  idCounter += 1;
  return `n-${Date.now().toString(36)}-${idCounter}`;
}

export function Canvas({ className }: CanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    addNode,
  } = useDiagramStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      onNodesChange: s.onNodesChange,
      onEdgesChange: s.onEdgesChange,
      onConnect: s.onConnect,
      onSelectionChange: s.onSelectionChange,
      addNode: s.addNode,
    })),
  );

  const handleSelection = useCallback(
    (params: OnSelectionChangeParams) => {
      onSelectionChange({
        nodes: params.nodes as DiagramNode[],
        edges: params.edges as DiagramEdge[],
      });
    },
    [onSelectionChange],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const symbolType = event.dataTransfer.getData(DRAG_DATA_TYPE);
      if (!symbolType) return;
      const symbol = getSymbol(symbolType);
      if (!symbol) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Centre the symbol on the drop point.
      position.x -= symbol.size.width / 2;
      position.y -= symbol.size.height / 2;

      const tag = symbol.tagPrefix
        ? nextTag(symbol.tagPrefix, useDiagramStore.getState().nodes)
        : undefined;

      const node: DiagramNode = {
        id: nextNodeId(),
        type: "symbol",
        position,
        data: {
          symbolType,
          tag,
          label: symbol.defaultLabel,
          params: { ...(symbol.defaultParams ?? {}) },
        },
      };
      addNode(node);
    },
    [addNode, screenToFlowPosition],
  );

  const defaultEdgeOptions = useMemo(
    () => ({ type: "pipe" as const }),
    [],
  );

  return (
    <div
      ref={wrapperRef}
      className={cn("relative h-full w-full bg-[var(--color-canvas)]", className)}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelection}
        fitView
        snapToGrid
        snapGrid={[10, 10]}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          maskColor="rgba(0,0,0,0.6)"
          nodeColor={() => "#52525b"}
        />
      </ReactFlow>
    </div>
  );
}
