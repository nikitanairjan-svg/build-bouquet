// uiStore — Zustand store for transient UI state (filters, selection, modals)
// TODO: implement actions
import { create } from "zustand";
import type { UIState, ActiveFilter } from "@/types";

interface UIStore extends UIState {
  setActiveFilter: (filter: ActiveFilter) => void;
  selectFlower: (instanceId: string | null) => void;
  toggleSummary: () => void;
  openShareModal: () => void;
  closeShareModal: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  activeFilter: "all",
  selectedInstanceId: null,
  isSummaryOpen: false,
  isShareModalOpen: false,
  setActiveFilter: (_filter) => {
    // TODO
  },
  selectFlower: (_instanceId) => {
    // TODO
  },
  toggleSummary: () => {
    // TODO
  },
  openShareModal: () => {
    // TODO
  },
  closeShareModal: () => {
    // TODO
  },
}));
