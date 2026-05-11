import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import { getSymbol } from "@/symbols/registry";
import type { PortDef, PortSide } from "@/types/diagram";
import type { DiagramNode } from "@/store/diagramStore";
import { cn } from "@/lib/utils";

const SIDE_TO_POSITION: Record<PortSide, Position> = {
  top: Position.Top,
  bottom: Position.Bottom,
  left: Position.Left,
  right: Position.Right,
};

function portStyle(port: PortDef, width: number, height: number) {
  switch (port.side) {
    case "top":
      return { left: width * port.position };
    case "bottom":
      return { left: width * port.position };
    case "left":
      return { top: height * port.position };
    case "right":
      return { top: height * port.position };
  }
}

export const SymbolNode = memo(function SymbolNode({
  data,
  selected,
}: NodeProps<DiagramNode>) {
  const symbol = getSymbol(data.symbolType);

  if (!symbol) {
    return (
      <div className="rounded border border-red-500 bg-red-950 px-2 py-1 text-xs text-red-100">
        Unknown symbol: {data.symbolType}
      </div>
    );
  }

  const { Icon, size, ports } = symbol;
  const rotation = data.rotation ?? 0;
  const label = data.tag ?? data.label ?? symbol.defaultLabel ?? "";

  return (
    <div
      className={cn(
        "group relative flex items-center justify-center",
        selected && "drop-shadow-[0_0_6px_rgba(125,211,252,0.6)]",
      )}
      style={{ width: size.width, height: size.height }}
    >
      <div
        className="pointer-events-none"
        style={{
          width: size.width,
          height: size.height,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
        }}
      >
        <Icon width={size.width} height={size.height} selected={selected} />
      </div>

      {ports.map((port) => (
        <Handle
          key={port.id}
          id={port.id}
          type="source"
          position={SIDE_TO_POSITION[port.side]}
          style={{
            ...portStyle(port, size.width, size.height),
            width: 8,
            height: 8,
            background: selected ? "#7dd3fc" : "#71717a",
            border: "1px solid #18181b",
          }}
        />
      ))}

      {label && (
        <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-zinc-300">
          {label}
        </span>
      )}
    </div>
  );
});
