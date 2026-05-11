import { create } from "zustand";

import type { LineType } from "@/types/diagram";

export type AppTab = "editor" | "analysis";

interface UIState {
  tab: AppTab;
  setTab: (tab: AppTab) => void;

  /** Default line type applied to newly drawn connections. */
  activeLineType: LineType;
  setActiveLineType: (lineType: LineType) => void;
}

export const useUIStore = create<UIState>((set) => ({
  tab: "editor",
  setTab: (tab) => set({ tab }),

  activeLineType: "process",
  setActiveLineType: (activeLineType) => set({ activeLineType }),
}));
