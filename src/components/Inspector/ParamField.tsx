import type { ParamFieldSchema } from "@/symbols/types";

import { TextInput } from "./fields/TextInput";
import { Select } from "./fields/Select";
import { CurveEditor, type CurvePoint } from "./fields/CurveEditor";
import { FittingsEditor, type Fitting } from "./fields/FittingsEditor";

interface ParamFieldProps {
  schema: ParamFieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function ParamField({ schema, value, onChange }: ParamFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="px-1 text-[11px] font-medium text-zinc-400">
        {schema.label}
      </span>
      <FieldBody schema={schema} value={value} onChange={onChange} />
      {schema.description && (
        <span className="px-1 text-[10px] text-zinc-500">
          {schema.description}
        </span>
      )}
    </label>
  );
}

function FieldBody({ schema, value, onChange }: ParamFieldProps) {
  switch (schema.kind) {
    case "text":
      return (
        <TextInput
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
        />
      );

    case "number":
      return (
        <TextInput
          type="number"
          value={value == null ? "" : String(value)}
          step={schema.step}
          min={schema.min}
          max={schema.max}
          unit={schema.unit}
          onChange={(v) => {
            if (v === "") {
              onChange(undefined);
              return;
            }
            const n = Number.parseFloat(v);
            onChange(Number.isFinite(n) ? n : undefined);
          }}
        />
      );

    case "select":
      return (
        <Select
          value={typeof value === "string" ? value : ""}
          options={(schema.options ?? []).map((o) => ({ value: o, label: o }))}
          onChange={(v) => onChange(v)}
        />
      );

    case "curve":
      return (
        <CurveEditor
          value={Array.isArray(value) ? (value as CurvePoint[]) : []}
          onChange={(v) => onChange(v)}
        />
      );

    case "fittings":
      return (
        <FittingsEditor
          value={Array.isArray(value) ? (value as Fitting[]) : []}
          onChange={(v) => onChange(v)}
        />
      );

    default:
      return null;
  }
}
