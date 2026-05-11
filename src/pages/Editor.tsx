import { ReactFlowProvider } from "@xyflow/react";

import { Canvas } from "@/components/Canvas/Canvas";
import { Palette } from "@/components/Palette/Palette";
import { Inspector } from "@/components/Inspector/Inspector";

export function Editor() {
  return (
    <ReactFlowProvider>
      <div className="flex h-full w-full">
        <Palette className="w-60 shrink-0" />
        <main className="flex-1 overflow-hidden">
          <Canvas />
        </main>
        <Inspector className="w-80 shrink-0" />
      </div>
    </ReactFlowProvider>
  );
}
