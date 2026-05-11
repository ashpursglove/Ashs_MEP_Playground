import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";

import { LINE_STYLES } from "@/symbols/lines/lineStyles";
import type { DiagramEdge } from "@/store/diagramStore";

export const PipeEdge = memo(function PipeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<DiagramEdge>) {
  const lineType = data?.lineType ?? "process";
  const style = LINE_STYLES[lineType];

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  const stroke = selected ? "#7dd3fc" : style.stroke;
  const strokeWidth = (style.strokeWidth ?? 2) + (selected ? 0.5 : 0);

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke,
          strokeWidth,
          strokeDasharray: style.strokeDasharray,
          fill: "none",
        }}
      />
      {/* Pneumatic-style hash overlay: stroke a dashed copy with short on/long off */}
      {style.pattern === "hash" && (
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth + 4}
          strokeDasharray="1 12"
          strokeLinecap="butt"
        />
      )}
      {data?.tag && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute rounded bg-zinc-900/90 px-1.5 py-0.5 text-[10px] text-zinc-200 ring-1 ring-zinc-700"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {data.tag}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
