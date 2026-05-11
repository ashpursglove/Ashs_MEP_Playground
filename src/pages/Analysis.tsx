import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Play } from "lucide-react";

import { useDiagramStore } from "@/store/diagramStore";
import { useProjectStore } from "@/store/projectStore";
import { toEngineGraph } from "@/engine/adapter";
import { NoPathError } from "@/engine/path";
import { solve } from "@/engine/solver";
import type { SinglePathResult } from "@/engine/types";
import { TextInput } from "@/components/Inspector/fields/TextInput";
import { Select } from "@/components/Inspector/fields/Select";
import { cn } from "@/lib/utils";

type Mode = "forward" | "inverse";

export function Analysis() {
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const fluids = useProjectStore((s) => s.fluids);
  const addFluid = useProjectStore((s) => s.addFluid);
  const updateFluid = useProjectStore((s) => s.updateFluid);

  const [startId, setStartId] = useState<string>("");
  const [endId, setEndId] = useState<string>("");
  const [fluidId, setFluidId] = useState<string>(fluids[0]?.id ?? "");
  const [mode, setMode] = useState<Mode>("forward");
  const [targetQM3h, setTargetQM3h] = useState<number>(50);
  const [result, setResult] = useState<SinglePathResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nodeOptions = useMemo(
    () =>
      nodes.map((n) => ({
        value: n.id,
        label: n.data.tag || n.data.label || n.id,
      })),
    [nodes],
  );

  const fluid = fluids.find((f) => f.id === fluidId) ?? fluids[0];

  function runSolve() {
    setError(null);
    setResult(null);
    if (!fluid) {
      setError("Select a fluid first.");
      return;
    }
    if (!startId || !endId) {
      setError("Pick both start and end components.");
      return;
    }
    try {
      const graph = toEngineGraph(nodes, edges);
      const r = solve(
        mode === "forward"
          ? { mode, graph, fluid, startNodeId: startId, endNodeId: endId }
          : {
              mode,
              graph,
              fluid,
              startNodeId: startId,
              endNodeId: endId,
              targetQM3h,
            },
      );
      setResult(r);
    } catch (e) {
      if (e instanceof NoPathError) {
        setError(e.message);
      } else {
        setError(`Solver failed: ${(e as Error).message}`);
      }
    }
  }

  function createFluid() {
    const id = `fluid-${Date.now().toString(36)}`;
    addFluid({
      id,
      name: "New fluid",
      densityKgM3: 1000,
      viscosityPaS: 1e-3,
      temperatureC: 20,
    });
    setFluidId(id);
  }

  return (
    <div className="flex h-full w-full">
      <aside className="flex w-80 shrink-0 flex-col border-r border-zinc-800 bg-[var(--color-panel)] overflow-y-auto">
        <header className="border-b border-zinc-800 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Analysis input
        </header>
        <div className="flex flex-col gap-4 p-3 text-sm">
          <Section title="Endpoints">
            <Field label="From">
              <Select
                value={startId}
                options={[{ value: "", label: "— select —" }, ...nodeOptions]}
                onChange={setStartId}
              />
            </Field>
            <Field label="To">
              <Select
                value={endId}
                options={[{ value: "", label: "— select —" }, ...nodeOptions]}
                onChange={setEndId}
              />
            </Field>
          </Section>

          <Section
            title="Fluid"
            action={
              <button
                type="button"
                onClick={createFluid}
                className="text-[10px] text-sky-400 hover:text-sky-300"
              >
                + new
              </button>
            }
          >
            <Field label="Active fluid">
              <Select
                value={fluidId}
                options={fluids.map((f) => ({ value: f.id, label: f.name }))}
                onChange={setFluidId}
              />
            </Field>
            {fluid && (
              <>
                <Field label="Name">
                  <TextInput
                    value={fluid.name}
                    onChange={(v) => updateFluid(fluid.id, { name: v })}
                  />
                </Field>
                <Field label="Density">
                  <TextInput
                    type="number"
                    unit="kg/m³"
                    value={String(fluid.densityKgM3)}
                    onChange={(v) =>
                      updateFluid(fluid.id, {
                        densityKgM3: parseFinite(v, fluid.densityKgM3),
                      })
                    }
                  />
                </Field>
                <Field label="Viscosity">
                  <TextInput
                    type="number"
                    unit="Pa·s"
                    step={1e-5}
                    value={String(fluid.viscosityPaS)}
                    onChange={(v) =>
                      updateFluid(fluid.id, {
                        viscosityPaS: parseFinite(v, fluid.viscosityPaS),
                      })
                    }
                  />
                </Field>
                <Field label="Temperature">
                  <TextInput
                    type="number"
                    unit="°C"
                    value={String(fluid.temperatureC)}
                    onChange={(v) =>
                      updateFluid(fluid.id, {
                        temperatureC: parseFinite(v, fluid.temperatureC),
                      })
                    }
                  />
                </Field>
              </>
            )}
          </Section>

          <Section title="Mode">
            <div className="grid grid-cols-2 gap-1 rounded-md border border-zinc-800 bg-[var(--color-panel-2)] p-0.5">
              {(["forward", "inverse"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded px-2 py-1 text-[11px] font-medium transition",
                    mode === m
                      ? "bg-zinc-700 text-zinc-50"
                      : "text-zinc-400 hover:text-zinc-200",
                  )}
                >
                  {m === "forward" ? "Find Q" : "Set Q"}
                </button>
              ))}
            </div>
            {mode === "inverse" && (
              <Field label="Target flow">
                <TextInput
                  type="number"
                  unit="m³/h"
                  value={String(targetQM3h)}
                  onChange={(v) =>
                    setTargetQM3h(parseFinite(v, targetQM3h))
                  }
                />
              </Field>
            )}
          </Section>

          <button
            type="button"
            onClick={runSolve}
            className="mt-2 flex items-center justify-center gap-2 rounded bg-sky-500 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-sky-400"
          >
            <Play size={14} /> Solve
          </button>

          {error && (
            <p className="rounded border border-red-800 bg-red-950/60 px-2 py-1.5 text-[11px] text-red-200">
              <AlertTriangle size={12} className="-mt-0.5 mr-1 inline" />
              {error}
            </p>
          )}
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        {result ? <ResultView result={result} mode={mode} /> : <EmptyState />}
      </main>
    </div>
  );
}

function ResultView({
  result,
  mode,
}: {
  result: SinglePathResult;
  mode: Mode;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="grid grid-cols-4 gap-2 border-b border-zinc-800 p-3 text-xs">
        <StatCard
          label={mode === "forward" ? "Operating Q" : "Target Q"}
          value={`${result.qM3h.toFixed(2)} m³/h`}
        />
        <StatCard
          label="Pump head"
          value={`${result.pumpHeadM.toFixed(2)} m`}
        />
        <StatCard
          label="System head"
          value={`${result.systemHeadM.toFixed(2)} m`}
        />
        <StatCard
          label="Elevation Δ"
          value={`${result.elevationDeltaM.toFixed(2)} m`}
        />
      </div>

      <section className="border-b border-zinc-800 p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Pump vs. system curve
        </h3>
        <div className="h-64">
          <PumpSystemChart result={result} />
        </div>
      </section>

      <section className="p-3">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Per-component losses
        </h3>
        <ComponentsTable result={result} />
      </section>

      {result.warnings.length > 0 && (
        <section className="border-t border-zinc-800 p-3">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Warnings
          </h3>
          <ul className="space-y-1 text-[12px] text-amber-300">
            {result.warnings.map((w, i) => (
              <li key={i}>
                <AlertTriangle size={12} className="-mt-0.5 mr-1 inline" />
                {w}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function PumpSystemChart({ result }: { result: SinglePathResult }) {
  const data: { q: number; pump?: number; system?: number }[] = [];
  const map = new Map<number, { q: number; pump?: number; system?: number }>();
  for (const p of result.pumpCurveSampled) {
    const key = Number(p.q.toFixed(2));
    map.set(key, { ...(map.get(key) ?? { q: key }), pump: p.h });
  }
  for (const p of result.systemCurveSampled) {
    const key = Number(p.q.toFixed(2));
    map.set(key, { ...(map.get(key) ?? { q: key }), system: p.h });
  }
  for (const [, v] of [...map.entries()].sort((a, b) => a[0] - b[0])) {
    data.push(v);
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid stroke="#27272a" strokeDasharray="2 3" />
        <XAxis
          dataKey="q"
          type="number"
          domain={[0, "dataMax"]}
          stroke="#71717a"
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
          label={{
            value: "Q (m³/h)",
            position: "insideBottom",
            offset: -2,
            fill: "#71717a",
            fontSize: 11,
          }}
        />
        <YAxis
          stroke="#71717a"
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
          label={{
            value: "H (m)",
            angle: -90,
            position: "insideLeft",
            fill: "#71717a",
            fontSize: 11,
          }}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #3f3f46",
            color: "#e4e4e7",
            fontSize: 11,
          }}
          formatter={(v: number) => (typeof v === "number" ? v.toFixed(2) : v)}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="pump"
          name="Pump"
          stroke="#7dd3fc"
          dot={false}
          strokeWidth={2}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="system"
          name="System"
          stroke="#fda4af"
          dot={false}
          strokeWidth={2}
          connectNulls
        />
        {result.qM3h > 0 && (
          <ReferenceDot
            x={result.qM3h}
            y={result.pumpHeadM}
            r={5}
            fill="#fde047"
            stroke="#000"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

function ComponentsTable({ result }: { result: SinglePathResult }) {
  return (
    <div className="overflow-x-auto rounded border border-zinc-800">
      <table className="w-full text-xs">
        <thead className="bg-zinc-900 text-[10px] uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="px-2 py-1 text-left">Component</th>
            <th className="px-2 py-1 text-left">Kind</th>
            <th className="px-2 py-1 text-right">ΔP (bar)</th>
            <th className="px-2 py-1 text-right">Head (m)</th>
            <th className="px-2 py-1 text-right">v (m/s)</th>
            <th className="px-2 py-1 text-right">Re</th>
          </tr>
        </thead>
        <tbody>
          {result.components.map((c, i) => (
            <tr
              key={i}
              className="border-t border-zinc-800 text-zinc-300 odd:bg-zinc-950 even:bg-[var(--color-panel)]"
            >
              <td className="px-2 py-1">{c.label}</td>
              <td className="px-2 py-1">{c.kind}</td>
              <td className="px-2 py-1 text-right">
                {(c.deltaPpa / 1e5).toFixed(4)}
              </td>
              <td className="px-2 py-1 text-right">{c.headM.toFixed(3)}</td>
              <td className="px-2 py-1 text-right">
                {c.velocityMs != null ? c.velocityMs.toFixed(2) : "—"}
              </td>
              <td className="px-2 py-1 text-right">
                {c.reynolds != null ? Math.round(c.reynolds).toLocaleString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-[var(--color-panel)] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-zinc-500">
      <p className="text-sm">
        Pick two process-line endpoints and a fluid, then hit Solve.
      </p>
      <p className="max-w-md text-[11px] leading-relaxed text-zinc-600">
        Forward mode: given the pump curve, find the operating Q where pump
        head equals system head. Inverse mode: given a target Q, see exactly
        what each component costs you.
      </p>
    </div>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          {title}
        </h3>
        {action}
      </header>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="px-1 text-[11px] font-medium text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function parseFinite(v: string, fallback: number): number {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}
