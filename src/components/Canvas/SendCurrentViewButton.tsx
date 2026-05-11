import { useCallback, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { ImagePlus } from "lucide-react";

import { useDiagramStore } from "@/store/diagramStore";
import { useDrawingsStore, newPageId } from "@/store/drawingsStore";

interface Props {
  className?: string;
}

/**
 * Captures the current React Flow viewport (the rectangle the user is looking
 * at) and stores it as a new diagram page in the Drawings tab. The captured
 * page also includes a frozen snapshot of nodes + edges so it remains stable
 * even if the live diagram is edited afterwards.
 */
export function SendCurrentViewButton({ className }: Props) {
  const flow = useReactFlow();
  const addPage = useDrawingsStore((s) => s.addPage);
  const pages = useDrawingsStore((s) => s.pages);
  const [confirming, setConfirming] = useState(false);

  const onClick = useCallback(() => {
    const nodes = useDiagramStore.getState().nodes;
    const edges = useDiagramStore.getState().edges;
    if (nodes.length === 0) {
      alert("Nothing to send — drop some symbols on the canvas first.");
      return;
    }

    // Compute world-space bounds of the visible viewport.
    const viewport = flow.getViewport();
    // The DOM node that wraps the React Flow pane.
    const pane = document.querySelector(".react-flow") as HTMLElement | null;
    const rect = pane?.getBoundingClientRect();
    const screenW = rect?.width ?? 1024;
    const screenH = rect?.height ?? 768;

    // React Flow viewport `x`,`y` are translation offsets. World coords of the
    // top-left visible point are -(x/zoom), -(y/zoom).
    const minX = -viewport.x / viewport.zoom;
    const minY = -viewport.y / viewport.zoom;
    const maxX = minX + screenW / viewport.zoom;
    const maxY = minY + screenH / viewport.zoom;

    const idx = pages.filter((p) => p.type === "diagram").length + 1;
    addPage({
      id: newPageId(),
      title: `View — sheet ${idx}`,
      type: "diagram",
      titleBlock: {},
      diagram: {
        bounds: { minX, minY, maxX, maxY },
        nodes: structuredClone(nodes),
        edges: structuredClone(edges),
      },
      annotations: [],
    });
    setConfirming(true);
    window.setTimeout(() => setConfirming(false), 1400);
  }, [addPage, flow, pages]);

  return (
    <button
      type="button"
      onClick={onClick}
      title="Capture the current view as a new page in the Drawings tab"
      className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-md border border-zinc-700 bg-[var(--color-panel)]/95 px-2.5 py-1.5 text-[11px] font-medium text-zinc-200 shadow-lg backdrop-blur transition hover:border-sky-500 hover:text-sky-200 ${className ?? ""}`}
    >
      <ImagePlus size={13} strokeWidth={1.75} />
      {confirming ? "Sent ✓" : "Send view to Drawings"}
    </button>
  );
}
