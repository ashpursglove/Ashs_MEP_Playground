import { getSymbol } from "@/symbols/registry";
import type { DiagramEdge, DiagramNode } from "@/store/diagramStore";
import {
  PIPE_MATERIAL_OPTIONS,
  PIPE_NOMINAL_OPTIONS,
  type PipeMaterialId,
} from "@/presets/pipes";

export interface EquipmentBomRow {
  id: string;
  itemNo: number;
  tag: string;
  description: string;
  category: string;
  size?: string;
  material?: string;
  quantity: number;
  /** Free-form remarks (rated head/flow for pumps, Cv for valves, …). */
  remarks?: string;
}

export interface PipeBomRow {
  id: string;
  itemNo: number;
  description: string;
  size?: string;
  material?: string;
  totalLengthM: number;
  segments: number;
  remarks?: string;
}

export interface BomData {
  equipment: EquipmentBomRow[];
  pipes: PipeBomRow[];
}

/** Build a BOM from the live diagram. Equipment is grouped per node (tag-level
 * detail), and pipes are aggregated by material × nominal-size since multiple
 * physical segments of the same spec usually merge in procurement.
 */
export function buildBom(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  options: { includePipes: boolean } = { includePipes: true },
): BomData {
  const equipment = buildEquipmentRows(nodes);
  const pipes = options.includePipes ? buildPipeRows(edges) : [];
  return { equipment, pipes };
}

function buildEquipmentRows(nodes: DiagramNode[]): EquipmentBomRow[] {
  // Deduplicate within a tag — if the user used the same tag twice we still
  // list it once and bump the quantity.
  const byKey = new Map<string, EquipmentBomRow>();
  let itemNo = 0;
  for (const n of nodes) {
    const symbol = getSymbol(n.data.symbolType);
    if (!symbol) continue;
    // Skip pure visual "connector" symbols (tap points, off-page connectors…)
    // since they don't represent purchaseable equipment.
    if (symbol.category === "connector") continue;
    const tag = (n.data.tag as string | undefined) ?? n.id;
    const params = (n.data.params ?? {}) as Record<string, unknown>;
    const description = symbol.label;
    const category = symbol.subcategory ?? symbol.category;
    const size = formatSize(symbol.type, params);
    const material = formatMaterial(params);
    const remarks = formatRemarks(symbol.type, params);
    const key = `${symbol.type}::${tag}::${size ?? ""}::${material ?? ""}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.quantity += 1;
    } else {
      itemNo += 1;
      byKey.set(key, {
        id: key,
        itemNo,
        tag,
        description,
        category,
        size,
        material,
        quantity: 1,
        remarks,
      });
    }
  }
  return [...byKey.values()];
}

function buildPipeRows(edges: DiagramEdge[]): PipeBomRow[] {
  const byKey = new Map<string, PipeBomRow>();
  let itemNo = 0;
  for (const e of edges) {
    const lineType = e.data?.lineType ?? "process";
    if (lineType !== "process") continue; // utility / electrical aren't pipe BOM
    const pipe = e.data?.pipe ?? {};
    const materialId = pipe.presetMaterialId as PipeMaterialId | undefined;
    const nominalId = pipe.presetNominalId as string | undefined;
    const materialLabel =
      PIPE_MATERIAL_OPTIONS.find((m) => m.id === materialId)?.label ??
      "Unspecified";
    const sizeLabel =
      PIPE_NOMINAL_OPTIONS.find((s) => s.id === nominalId)?.label ??
      (pipe.innerDiameterMm
        ? `⌀ ${Number(pipe.innerDiameterMm).toFixed(1)} mm ID`
        : "—");
    const key = `${materialLabel}::${sizeLabel}`;
    const len = Number(pipe.lengthM ?? 0);
    const existing = byKey.get(key);
    if (existing) {
      existing.totalLengthM += len;
      existing.segments += 1;
    } else {
      itemNo += 1;
      byKey.set(key, {
        id: key,
        itemNo,
        description: "Process pipe",
        size: sizeLabel,
        material: materialLabel,
        totalLengthM: len,
        segments: 1,
        remarks: undefined,
      });
    }
  }
  return [...byKey.values()];
}

function formatSize(
  _type: string,
  params: Record<string, unknown>,
): string | undefined {
  if (typeof params.valveNominalId === "string") return params.valveNominalId;
  if (typeof params.filterSizeId === "string")
    return String(params.filterSizeId).toUpperCase();
  if (typeof params.nominalDn === "string") return params.nominalDn;
  if (typeof params.ratedFlowM3H === "number")
    return `${params.ratedFlowM3H} m³/h`;
  return undefined;
}

function formatMaterial(params: Record<string, unknown>): string | undefined {
  if (typeof params.material === "string") return params.material;
  return undefined;
}

function formatRemarks(
  type: string,
  params: Record<string, unknown>,
): string | undefined {
  const parts: string[] = [];
  if (typeof params.ratedHeadM === "number")
    parts.push(`${params.ratedHeadM} m head`);
  if (typeof params.ratedFlowM3H === "number" && type.endsWith("pump"))
    parts.push(`${params.ratedFlowM3H} m³/h`);
  if (typeof params.cv === "number") parts.push(`Cv ${params.cv}`);
  if (typeof params.volumeM3 === "number")
    parts.push(`${params.volumeM3} m³`);
  if (typeof params.kValue === "number") parts.push(`K=${params.kValue}`);
  return parts.length ? parts.join(", ") : undefined;
}
