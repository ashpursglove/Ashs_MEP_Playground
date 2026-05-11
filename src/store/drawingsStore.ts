import { create } from "zustand";

import type { DiagramEdge, DiagramNode } from "@/store/diagramStore";
import type { ProjectMeta } from "@/store/projectStore";
import type { SinglePathResult } from "@/engine/types";

/* ------------------------------ Page types ------------------------------ */

export type DrawingPageType = "diagram" | "analysis" | "bom" | "blank";

export interface DiagramView {
  /** World-space rectangle (in flow coords) captured from the editor viewport. */
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  /** Frozen snapshot of the diagram at capture time so the page is reproducible
   *  even if the user keeps editing the live drawing afterwards. */
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface AnalysisSnapshot {
  startId: string;
  endId: string;
  startLabel: string;
  endLabel: string;
  fluidName: string;
  mode: "forward" | "inverse";
  targetQM3h?: number;
  result: SinglePathResult;
  /** Frozen diagram snapshot used to draw the route preview on the page so it
   *  stays accurate even if the live diagram is edited later. */
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  /** IDs of the nodes / edges that lie on the analysed path (for highlighting
   *  in the route preview). */
  pathNodeIds: string[];
  pathEdgeIds: string[];
  /** When an analysis is too long to fit on a single sheet, the breakdown is
   *  split across multiple consecutive pages. These describe which slice of
   *  `result.components` this page is responsible for and where it sits in
   *  the set. The first page (pageIndex 0) carries the full layout — route
   *  preview, KPI cards, warnings — and every continuation page only renders
   *  the per-component table for its slice. */
  pageIndex?: number;
  totalPages?: number;
  componentSlice?: { start: number; end: number };
}

export interface BomConfig {
  /** Include pipe segments grouped by material/size in addition to equipment. */
  includePipes: boolean;
}

export type AnnotationKind = "text" | "note" | "arrow";

export interface Annotation {
  id: string;
  kind: AnnotationKind;
  /** Position in millimetres relative to the page top-left. */
  x: number;
  y: number;
  /** For arrows: endpoint relative to the page top-left. */
  x2?: number;
  y2?: number;
  text?: string;
  /** Font size in mm. Defaults vary by kind. */
  fontSize?: number;
}

export interface DrawingPage {
  id: string;
  /** Human-readable name shown in the sidebar (e.g. "Process flow — sheet 1"). */
  title: string;
  type: DrawingPageType;
  /**
   * Per-page overrides for the title block fields. Anything left undefined
   * here falls back to the live project meta when rendering, so global
   * properties (drawn by, approved by, …) propagate automatically.
   */
  titleBlock: Partial<ProjectMeta>;
  diagram?: DiagramView;
  analysis?: AnalysisSnapshot;
  bom?: BomConfig;
  annotations: Annotation[];
}

interface DrawingsState {
  pages: DrawingPage[];
  selectedPageId: string | null;
  /** Optional company logo as a data URL (or null = no logo). */
  companyLogo: string | null;

  /* ----- selection & CRUD ----- */
  selectPage: (id: string | null) => void;
  addPage: (page: DrawingPage) => void;
  removePage: (id: string) => void;
  movePage: (id: string, dir: -1 | 1) => void;
  duplicatePage: (id: string) => void;
  updatePage: (id: string, patch: Partial<DrawingPage>) => void;
  updateTitleBlock: (id: string, patch: Partial<ProjectMeta>) => void;
  renamePage: (id: string, title: string) => void;

  /* ----- annotations ----- */
  addAnnotation: (pageId: string, ann: Annotation) => void;
  updateAnnotation: (pageId: string, annId: string, patch: Partial<Annotation>) => void;
  removeAnnotation: (pageId: string, annId: string) => void;

  /* ----- logo ----- */
  setCompanyLogo: (logo: string | null) => void;

  /* ----- bulk ops (load / new) ----- */
  replace: (pages: DrawingPage[], logo: string | null) => void;
  clear: () => void;
}

let pageCounter = 0;
function genPageId() {
  pageCounter += 1;
  return `pg-${Date.now().toString(36)}-${pageCounter}`;
}

export function newPageId() {
  return genPageId();
}

export function newAnnotationId() {
  return `ann-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const useDrawingsStore = create<DrawingsState>((set) => ({
  pages: [],
  selectedPageId: null,
  companyLogo: null,

  selectPage: (id) => set({ selectedPageId: id }),

  addPage: (page) =>
    set((s) => ({
      pages: [...s.pages, page],
      selectedPageId: page.id,
    })),

  removePage: (id) =>
    set((s) => {
      const idx = s.pages.findIndex((p) => p.id === id);
      if (idx === -1) return s;
      const pages = s.pages.filter((p) => p.id !== id);
      let nextSel: string | null = null;
      if (s.selectedPageId === id) {
        nextSel = pages[Math.min(idx, pages.length - 1)]?.id ?? null;
      } else {
        nextSel = s.selectedPageId;
      }
      return { pages, selectedPageId: nextSel };
    }),

  movePage: (id, dir) =>
    set((s) => {
      const idx = s.pages.findIndex((p) => p.id === id);
      const target = idx + dir;
      if (idx === -1 || target < 0 || target >= s.pages.length) return s;
      const pages = s.pages.slice();
      const [page] = pages.splice(idx, 1);
      pages.splice(target, 0, page);
      return { pages };
    }),

  duplicatePage: (id) =>
    set((s) => {
      const src = s.pages.find((p) => p.id === id);
      if (!src) return s;
      const idx = s.pages.findIndex((p) => p.id === id);
      const clone: DrawingPage = {
        ...src,
        id: genPageId(),
        title: `${src.title} (copy)`,
        annotations: src.annotations.map((a) => ({ ...a })),
      };
      const pages = s.pages.slice();
      pages.splice(idx + 1, 0, clone);
      return { pages, selectedPageId: clone.id };
    }),

  updatePage: (id, patch) =>
    set((s) => ({
      pages: s.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  updateTitleBlock: (id, patch) =>
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === id ? { ...p, titleBlock: { ...p.titleBlock, ...patch } } : p,
      ),
    })),

  renamePage: (id, title) =>
    set((s) => ({
      pages: s.pages.map((p) => (p.id === id ? { ...p, title } : p)),
    })),

  addAnnotation: (pageId, ann) =>
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === pageId ? { ...p, annotations: [...p.annotations, ann] } : p,
      ),
    })),

  updateAnnotation: (pageId, annId, patch) =>
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === pageId
          ? {
              ...p,
              annotations: p.annotations.map((a) =>
                a.id === annId ? { ...a, ...patch } : a,
              ),
            }
          : p,
      ),
    })),

  removeAnnotation: (pageId, annId) =>
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === pageId
          ? { ...p, annotations: p.annotations.filter((a) => a.id !== annId) }
          : p,
      ),
    })),

  setCompanyLogo: (logo) => set({ companyLogo: logo }),

  replace: (pages, logo) =>
    set({
      pages,
      companyLogo: logo,
      selectedPageId: pages[0]?.id ?? null,
    }),

  clear: () => set({ pages: [], selectedPageId: null, companyLogo: null }),
}));

/* ---------------------------- selector helpers ---------------------------- */

export function useSelectedDrawingPage(): DrawingPage | null {
  return useDrawingsStore((s) =>
    s.selectedPageId
      ? s.pages.find((p) => p.id === s.selectedPageId) ?? null
      : null,
  );
}
