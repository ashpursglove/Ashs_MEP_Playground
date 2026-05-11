import { useShallow } from "zustand/react/shallow";

import { useDiagramStore } from "@/store/diagramStore";
import { useProjectStore } from "@/store/projectStore";
import { getSymbol } from "@/symbols/registry";
import { LINE_STYLES, LINE_TYPE_ORDER } from "@/symbols/lines/lineStyles";
import type { LineType, PipeEdgeData } from "@/types/diagram";
import { cn } from "@/lib/utils";

import { ParamField } from "./ParamField";
import { TextInput } from "./fields/TextInput";
import { Select } from "./fields/Select";
import { PIPE_PARAM_SCHEMA } from "./schemas";

interface InspectorProps {
  className?: string;
}

export function Inspector({ className }: InspectorProps) {
  const { selectedNode, selectedEdge } = useDiagramStore(
    useShallow((s) => ({
      selectedNode:
        s.selectedNodeId !== null
          ? s.nodes.find((n) => n.id === s.selectedNodeId)
          : null,
      selectedEdge:
        s.selectedEdgeId !== null
          ? s.edges.find((e) => e.id === s.selectedEdgeId)
          : null,
    })),
  );

  return (
    <aside
      className={cn(
        "flex flex-col border-l border-zinc-800 bg-[var(--color-panel)]",
        className,
      )}
    >
      <header className="border-b border-zinc-800 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Inspector
      </header>
      <div className="flex-1 overflow-y-auto p-3 text-sm">
        {!selectedNode && !selectedEdge && <ProjectMetaForm />}
        {selectedNode && <NodeForm nodeId={selectedNode.id} />}
        {!selectedNode && selectedEdge && <EdgeForm edgeId={selectedEdge.id} />}
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4">
      {title && (
        <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          {title}
        </h3>
      )}
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function NodeForm({ nodeId }: { nodeId: string }) {
  const node = useDiagramStore((s) => s.nodes.find((n) => n.id === nodeId));
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);

  if (!node) return null;
  const symbol = getSymbol(node.data.symbolType);
  if (!symbol) {
    return (
      <p className="text-xs text-red-300">
        Unknown symbol type: {node.data.symbolType}
      </p>
    );
  }

  const params = (node.data.params ?? {}) as Record<string, unknown>;

  return (
    <>
      <Section>
        <Row label="Type">
          <span className="text-xs text-zinc-200">{symbol.label}</span>
        </Row>
        <Row label="ID">
          <span className="font-mono text-[10px] text-zinc-500">
            {node.id}
          </span>
        </Row>
        <label className="flex flex-col gap-1">
          <span className="px-1 text-[11px] font-medium text-zinc-400">
            Tag
          </span>
          <TextInput
            value={node.data.tag ?? ""}
            placeholder={symbol.defaultLabel}
            onChange={(v) => updateNodeData(nodeId, { tag: v })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="px-1 text-[11px] font-medium text-zinc-400">
            Label
          </span>
          <TextInput
            value={node.data.label ?? ""}
            onChange={(v) => updateNodeData(nodeId, { label: v })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="px-1 text-[11px] font-medium text-zinc-400">
            Rotation
          </span>
          <Select
            value={String((node.data.rotation as number | undefined) ?? 0)}
            options={[
              { value: "0", label: "0°" },
              { value: "90", label: "90°" },
              { value: "180", label: "180°" },
              { value: "270", label: "270°" },
            ]}
            onChange={(v) =>
              updateNodeData(nodeId, { rotation: Number.parseInt(v, 10) })
            }
          />
        </label>
      </Section>

      {symbol.paramSchema && symbol.paramSchema.length > 0 && (
        <Section title="Parameters">
          {symbol.paramSchema.map((field) => (
            <ParamField
              key={field.key}
              schema={field}
              value={params[field.key]}
              onChange={(value) =>
                updateNodeData(nodeId, {
                  params: { ...params, [field.key]: value },
                })
              }
            />
          ))}
        </Section>
      )}
    </>
  );
}

function EdgeForm({ edgeId }: { edgeId: string }) {
  const edge = useDiagramStore((s) => s.edges.find((e) => e.id === edgeId));
  const updateEdgeData = useDiagramStore((s) => s.updateEdgeData);

  if (!edge) return null;

  const data: PipeEdgeData = edge.data ?? {};
  const pipe = data.pipe ?? {};

  return (
    <>
      <Section>
        <Row label="Type">
          <span className="text-xs text-zinc-200">Pipe / signal</span>
        </Row>
        <Row label="From">
          <span className="font-mono text-[10px] text-zinc-500">
            {edge.source}
          </span>
        </Row>
        <Row label="To">
          <span className="font-mono text-[10px] text-zinc-500">
            {edge.target}
          </span>
        </Row>
        <label className="flex flex-col gap-1">
          <span className="px-1 text-[11px] font-medium text-zinc-400">
            Line type
          </span>
          <Select
            value={data.lineType ?? "process"}
            options={LINE_TYPE_ORDER.map((t) => ({
              value: t,
              label: LINE_STYLES[t].label,
            }))}
            onChange={(v) => updateEdgeData(edgeId, { lineType: v as LineType })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="px-1 text-[11px] font-medium text-zinc-400">
            Tag
          </span>
          <TextInput
            value={data.tag ?? ""}
            placeholder="e.g. 4&quot;-PS-001"
            onChange={(v) => updateEdgeData(edgeId, { tag: v })}
          />
        </label>
      </Section>

      <Section title="Pipe">
        {PIPE_PARAM_SCHEMA.map((field) => (
          <ParamField
            key={field.key}
            schema={field}
            value={(pipe as Record<string, unknown>)[field.key]}
            onChange={(value) =>
              updateEdgeData(edgeId, {
                pipe: { ...pipe, [field.key]: value },
              })
            }
          />
        ))}
      </Section>
    </>
  );
}

function ProjectMetaForm() {
  const meta = useProjectStore((s) => s.meta);
  const setMeta = useProjectStore((s) => s.setMeta);

  const field = (label: string, key: keyof typeof meta, placeholder?: string) => (
    <label className="flex flex-col gap-1">
      <span className="px-1 text-[11px] font-medium text-zinc-400">
        {label}
      </span>
      <TextInput
        value={meta[key]}
        placeholder={placeholder}
        onChange={(v) => setMeta({ [key]: v } as Partial<typeof meta>)}
      />
    </label>
  );

  return (
    <>
      <p className="mb-3 rounded border border-zinc-800 bg-zinc-900 p-2 text-[11px] text-zinc-400">
        Nothing selected. Editing project metadata used by the PDF title block.
      </p>
      <Section title="Project">
        {field("Title", "title")}
        {field("Drawing number", "drawingNumber")}
      </Section>
      <Section title="Title block">
        <div className="grid grid-cols-2 gap-2">
          {field("Drawn by", "drawnBy")}
          {field("Checked", "checkedBy")}
          {field("Approved", "approvedBy")}
          {field("Date", "date")}
          {field("Scale", "scale")}
          {field("Revision", "revision")}
          {field("Sheet", "sheet")}
          {field("Total sheets", "totalSheets")}
        </div>
      </Section>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-zinc-500">{label}</span>
      <span className="truncate text-right">{children}</span>
    </div>
  );
}
