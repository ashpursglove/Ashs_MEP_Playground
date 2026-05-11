import { useCallback } from "react";

import { useDiagramStore } from "@/store/diagramStore";
import { useProjectStore } from "@/store/projectStore";
import { pushRecent } from "@/io/recentFiles";

import {
  makeProjectJson,
  parseProjectJson,
  pickAndReadFile,
  pickAndWriteFile,
  writeFileAt,
} from "./saveLoad";
import { exportPdf } from "./pdfExport";
import { exportEquipmentCsv } from "./csvExport";

export function useProjectIO() {
  const newProject = useCallback(() => {
    const project = useProjectStore.getState();
    const diagram = useDiagramStore.getState();
    if (project.isDirty) {
      const confirmed = confirm(
        "You have unsaved changes. Start a new project anyway?",
      );
      if (!confirmed) return;
    }
    diagram.clear();
    project.resetToDefaults();
    useDiagramStore.temporal.getState().clear();
  }, []);

  const openProject = useCallback(async () => {
    const project = useProjectStore.getState();
    if (project.isDirty) {
      const confirmed = confirm(
        "You have unsaved changes. Open another file anyway?",
      );
      if (!confirmed) return;
    }
    let picked;
    try {
      picked = await pickAndReadFile();
    } catch (e) {
      alert(`Could not open file: ${(e as Error).message}`);
      return;
    }
    if (!picked) return;

    try {
      const parsed = parseProjectJson(picked.content);
      useDiagramStore
        .getState()
        .replaceAll(parsed.diagram.nodes, parsed.diagram.edges);
      project.loadProjectMeta({
        meta: parsed.meta,
        fluids: parsed.fluids,
        filePath: picked.path,
      });
      useDiagramStore.temporal.getState().clear();
      pushRecent(picked.path);
    } catch (e) {
      alert(`Failed to load project: ${(e as Error).message}`);
    }
  }, []);

  const saveAs = useCallback(async () => {
    const { meta, fluids, filePath: existing } = useProjectStore.getState();
    const { nodes, edges } = useDiagramStore.getState();
    const json = makeProjectJson({ meta, fluids, nodes, edges });
    const path = await pickAndWriteFile(existing, json);
    if (!path) return;
    useProjectStore.getState().setFilePath(path);
    useProjectStore.getState().markClean();
    pushRecent(path);
  }, []);

  const save = useCallback(async () => {
    const { meta, fluids, filePath } = useProjectStore.getState();
    const { nodes, edges } = useDiagramStore.getState();
    if (!filePath) {
      await saveAs();
      return;
    }
    const json = makeProjectJson({ meta, fluids, nodes, edges });
    try {
      await writeFileAt(filePath, json);
      useProjectStore.getState().markClean();
      pushRecent(filePath);
    } catch (e) {
      alert(`Failed to save: ${(e as Error).message}`);
    }
  }, [saveAs]);

  const openRecent = useCallback(async (path: string) => {
    const project = useProjectStore.getState();
    if (project.isDirty) {
      const confirmed = confirm(
        "You have unsaved changes. Open another file anyway?",
      );
      if (!confirmed) return;
    }
    try {
      const { readTextFile } = await import("@tauri-apps/plugin-fs");
      const content = await readTextFile(path);
      const parsed = parseProjectJson(content);
      useDiagramStore
        .getState()
        .replaceAll(parsed.diagram.nodes, parsed.diagram.edges);
      project.loadProjectMeta({
        meta: parsed.meta,
        fluids: parsed.fluids,
        filePath: path,
      });
      useDiagramStore.temporal.getState().clear();
      pushRecent(path);
    } catch (e) {
      alert(`Failed to open recent file: ${(e as Error).message}`);
    }
  }, []);

  const exportPdfNow = useCallback(async () => {
    const { meta } = useProjectStore.getState();
    const { nodes, edges } = useDiagramStore.getState();
    try {
      await exportPdf({ nodes, edges, meta });
    } catch (e) {
      alert(`PDF export failed: ${(e as Error).message}`);
    }
  }, []);

  const exportCsvNow = useCallback(async () => {
    const { nodes } = useDiagramStore.getState();
    const { meta } = useProjectStore.getState();
    const base = (meta.drawingNumber || "equipment-list").replace(
      /[\\/:*?"<>|]/g,
      "_",
    );
    try {
      await exportEquipmentCsv(nodes, `${base}.csv`);
    } catch (e) {
      alert(`CSV export failed: ${(e as Error).message}`);
    }
  }, []);

  return {
    newProject,
    openProject,
    save,
    saveAs,
    openRecent,
    exportPdf: exportPdfNow,
    exportCsv: exportCsvNow,
  };
}
