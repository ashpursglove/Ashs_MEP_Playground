import { useEffect } from "react";

import { useDiagramStore } from "@/store/diagramStore";
import { useProjectStore } from "@/store/projectStore";

/**
 * Flags the project as dirty whenever the diagram's nodes or edges change.
 * Initial state is never dirty; loads call `loadProjectMeta` which resets
 * dirty, then this subscriber will only fire for subsequent mutations.
 */
export function useDirtyTracker() {
  useEffect(() => {
    let prev = {
      nodes: useDiagramStore.getState().nodes,
      edges: useDiagramStore.getState().edges,
    };
    const unsub = useDiagramStore.subscribe((state) => {
      if (state.nodes !== prev.nodes || state.edges !== prev.edges) {
        prev = { nodes: state.nodes, edges: state.edges };
        useProjectStore.getState().markDirty();
      }
    });
    return unsub;
  }, []);
}
