import { Plus, Trash2 } from "lucide-react";

import { TextInput } from "./TextInput";
import { Select } from "./Select";

export interface Fitting {
  kind: string;
  k: number;
  count: number;
}

interface FittingsEditorProps {
  value: Fitting[] | undefined;
  onChange: (value: Fitting[]) => void;
}

/** Typical K-values for common fittings (turbulent). */
export const FITTING_PRESETS: { kind: string; k: number; label: string }[] = [
  { kind: "elbow-90-standard", k: 0.75, label: "90° elbow (standard)" },
  { kind: "elbow-90-long", k: 0.45, label: "90° elbow (long radius)" },
  { kind: "elbow-45", k: 0.35, label: "45° elbow" },
  { kind: "tee-through", k: 0.4, label: "Tee (run-through)" },
  { kind: "tee-branch", k: 1.0, label: "Tee (branch)" },
  { kind: "gate-open", k: 0.17, label: "Gate valve (open)" },
  { kind: "ball-open", k: 0.05, label: "Ball valve (open)" },
  { kind: "check-swing", k: 2.0, label: "Check valve (swing)" },
  { kind: "entrance-sharp", k: 0.5, label: "Entrance (sharp)" },
  { kind: "exit", k: 1.0, label: "Exit" },
];

const PRESET_OPTIONS = FITTING_PRESETS.map((p) => ({
  value: p.kind,
  label: p.label,
}));

function parseNumber(text: string): number {
  const n = Number.parseFloat(text);
  return Number.isFinite(n) ? n : 0;
}

export function FittingsEditor({ value, onChange }: FittingsEditorProps) {
  const items = value ?? [];

  function update(i: number, patch: Partial<Fitting>) {
    onChange(items.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  function add() {
    const preset = FITTING_PRESETS[0];
    onChange([...items, { kind: preset.kind, k: preset.k, count: 1 }]);
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function applyPreset(i: number, kind: string) {
    const preset = FITTING_PRESETS.find((p) => p.kind === kind);
    if (preset) update(i, { kind: preset.kind, k: preset.k });
  }

  return (
    <div className="flex flex-col gap-1">
      {items.length === 0 && (
        <p className="px-1 text-[11px] text-zinc-500">No fittings.</p>
      )}
      {items.map((f, i) => (
        <div key={i} className="grid grid-cols-[1fr_60px_44px_auto] gap-1">
          <Select
            value={f.kind}
            options={PRESET_OPTIONS}
            onChange={(v) => applyPreset(i, v)}
          />
          <TextInput
            type="number"
            value={String(f.k)}
            onChange={(v) => update(i, { k: parseNumber(v) })}
          />
          <TextInput
            type="number"
            min={1}
            step={1}
            value={String(f.count)}
            onChange={(v) =>
              update(i, { count: Math.max(1, Math.round(parseNumber(v))) })
            }
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="flex h-7 w-7 items-center justify-center rounded border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-red-400"
            title="Remove fitting"
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
        <Plus size={12} /> add fitting
      </button>
    </div>
  );
}
