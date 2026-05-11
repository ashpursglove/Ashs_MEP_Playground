import { Plus, Trash2 } from "lucide-react";

import { TextInput } from "./TextInput";

export interface CurvePoint {
  q: number;
  h: number;
}

interface CurveEditorProps {
  value: CurvePoint[] | undefined;
  onChange: (value: CurvePoint[]) => void;
}

function parseNumber(text: string): number {
  const n = Number.parseFloat(text);
  return Number.isFinite(n) ? n : 0;
}

export function CurveEditor({ value, onChange }: CurveEditorProps) {
  const points = value ?? [];

  function update(i: number, patch: Partial<CurvePoint>) {
    const next = points.map((p, idx) => (idx === i ? { ...p, ...patch } : p));
    onChange(next);
  }

  function add() {
    const last = points[points.length - 1];
    const nextQ = last ? last.q + 25 : 0;
    onChange([...points, { q: nextQ, h: 0 }]);
  }

  function remove(i: number) {
    onChange(points.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-1 text-[10px] uppercase tracking-wider text-zinc-500">
        <span className="px-1">Q (m³/h)</span>
        <span className="px-1">H (m)</span>
        <span />
      </div>
      {points.length === 0 && (
        <p className="px-1 text-[11px] text-zinc-500">No curve points.</p>
      )}
      {points.map((p, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-1">
          <TextInput
            type="number"
            value={String(p.q)}
            onChange={(v) => update(i, { q: parseNumber(v) })}
          />
          <TextInput
            type="number"
            value={String(p.h)}
            onChange={(v) => update(i, { h: parseNumber(v) })}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="flex h-7 w-7 items-center justify-center rounded border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-red-400"
            title="Remove point"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="mt-1 flex items-center justify-center gap-1 rounded border border-dashed border-zinc-700 px-2 py-1 text-[11px] text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
      >
        <Plus size={12} /> add point
      </button>
    </div>
  );
}
