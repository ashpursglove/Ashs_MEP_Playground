import { useState } from "react";
import { FileDown, Sheet } from "lucide-react";

import {
  useDrawingsStore,
  useSelectedDrawingPage,
} from "@/store/drawingsStore";
import { useDiagramStore } from "@/store/diagramStore";
import { useProjectStore } from "@/store/projectStore";
import { exportDrawingsPdf } from "@/io/drawingsPdf";
import { exportBomCsv } from "@/io/bomExport";
import { PageList } from "@/components/Drawings/PageList";
import { PagePreview } from "@/components/Drawings/PagePreview";
import { PageInspector } from "@/components/Drawings/PageInspector";

export function Drawings() {
  const pages = useDrawingsStore((s) => s.pages);
  const selectedPage = useSelectedDrawingPage();
  const meta = useProjectStore((s) => s.meta);
  const companyLogo = useDrawingsStore((s) => s.companyLogo);
  const liveNodes = useDiagramStore((s) => s.nodes);
  const liveEdges = useDiagramStore((s) => s.edges);
  const [exporting, setExporting] = useState(false);

  const pageNumber = selectedPage
    ? pages.findIndex((p) => p.id === selectedPage.id) + 1
    : 0;

  async function onExportPdf() {
    if (pages.length === 0) {
      alert("Add at least one page before exporting.");
      return;
    }
    setExporting(true);
    try {
      await exportDrawingsPdf({
        pages,
        meta,
        liveNodes,
        liveEdges,
        companyLogo,
      });
    } catch (e) {
      alert(`PDF export failed: ${(e as Error).message}`);
    } finally {
      setExporting(false);
    }
  }

  async function onExportBom() {
    try {
      await exportBomCsv({
        nodes: liveNodes,
        edges: liveEdges,
        meta,
      });
    } catch (e) {
      alert(`BOM export failed: ${(e as Error).message}`);
    }
  }

  return (
    <div className="flex h-full w-full">
      <PageList />

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-[var(--color-panel)] px-3 py-1.5">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500">
            {selectedPage ? selectedPage.title : "No page selected"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportBom}
              className="flex items-center gap-1.5 rounded border border-zinc-700 bg-[var(--color-panel-2)] px-2 py-1 text-[11px] text-zinc-200 hover:border-sky-500"
            >
              <Sheet size={12} /> BOM CSV
            </button>
            <button
              type="button"
              onClick={onExportPdf}
              disabled={exporting || pages.length === 0}
              className="flex items-center gap-1.5 rounded bg-sky-500 px-3 py-1 text-[11px] font-medium text-zinc-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileDown size={12} />
              {exporting ? "Exporting…" : `Export PDF (${pages.length})`}
            </button>
          </div>
        </div>

        {selectedPage ? (
          <PagePreview
            page={selectedPage}
            pageNumber={pageNumber}
            totalPages={pages.length}
          />
        ) : (
          <EmptyMain />
        )}
      </main>

      {selectedPage && <PageInspector page={selectedPage} />}
    </div>
  );
}

function EmptyMain() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-950 p-6 text-center">
      <div className="max-w-md space-y-3 text-zinc-400">
        <h2 className="text-lg text-zinc-200">No pages yet</h2>
        <p className="text-[12px] leading-relaxed text-zinc-500">
          Build up a multi-page set of drawings from your project:
        </p>
        <ul className="space-y-1.5 text-left text-[12px] leading-relaxed text-zinc-400">
          <li>
            <strong className="text-zinc-200">Editor →</strong> scroll &amp;
            zoom to a view, then click{" "}
            <span className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-200">
              Send view to Drawings
            </span>
            .
          </li>
          <li>
            <strong className="text-zinc-200">Analysis →</strong> solve, then
            use{" "}
            <span className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-200">
              Send report to Drawings
            </span>{" "}
            for a full report sheet.
          </li>
          <li>
            <strong className="text-zinc-200">Add →</strong> use the sidebar
            to add a Bill of Materials, the full diagram fitted to one page,
            or a blank annotation sheet.
          </li>
        </ul>
      </div>
    </div>
  );
}
