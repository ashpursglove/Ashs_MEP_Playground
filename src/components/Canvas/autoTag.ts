import type { DiagramNode } from "@/store/diagramStore";

/**
 * Return the next available tag for a given prefix, based on existing tags.
 * Convention: prefix + dash + 3-digit number, starting at 101.
 */
export function nextTag(prefix: string, nodes: DiagramNode[]): string {
  const re = new RegExp(`^${escapeRegex(prefix)}-(\\d+)$`);
  let maxN = 100;
  for (const n of nodes) {
    const t = (n.data.tag ?? "") as string;
    const m = re.exec(t);
    if (m) {
      const v = Number.parseInt(m[1], 10);
      if (v > maxN) maxN = v;
    }
  }
  return `${prefix}-${maxN + 1}`;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
