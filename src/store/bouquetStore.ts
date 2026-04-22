import { create } from "zustand";

// Module-level flag — lives outside React/Zustand so it survives client-side navigation.
// Why setTimeout: React StrictMode (on by default in Next.js) runs every effect twice:
//   mount → cleanup → remount (all synchronously inside React's commit phase).
// If we clear the flag synchronously on first mount, the remount sees false and calls reset().
// setTimeout(0) fires AFTER React's commit phase, so both mounts see the flag as true.
let _skipNextReset = false;
export function setSkipNextReset(val: boolean) { _skipNextReset = val; }
export function consumeSkipNextReset(): boolean {
  if (!_skipNextReset) return false;
  setTimeout(() => { _skipNextReset = false; }, 0);
  return true;
}

export type WrapColor = "brown" | "pink" | "lilac";

export interface Position {
  x: number;
  y: number;
}

export interface FlowerElement {
  id: number;
  flowerId: string;
  x: number;        // 0–100 (%)
  y: number;
  scale: number;
  rotation: number; // degrees
  zIndex: number;
}

interface Snapshot {
  elements: FlowerElement[];
  note: { text: string; color: string } | null;
}

interface BouquetStore {
  wrapStyle: number;
  wrapColor: WrapColor;
  elements: FlowerElement[];
  note: { text: string; color: string } | null;
  history: Snapshot[];
  redoStack: Snapshot[];
  shuffleCount: number;
  shuffleOriginal: Position[] | null;
  rearrangeCount: number;
  rearrangeOriginalIds: string[] | null;
  selectedId: number | null;
  _nextId: number;

  addFlower(flowerId: string, x: number, y: number, scale: number): void;
  removeFlower(id: number): void;
  updateFlower(id: number, changes: Partial<Omit<FlowerElement, "id">>): void;
  updateFlowerLive(id: number, changes: Partial<Omit<FlowerElement, "id">>): void;
  moveFlower(id: number, x: number, y: number): void;
  duplicateFlower(id: number): void;
  selectFlower(id: number | null): void;
  deselect(): void;
  setWrapStyle(n: number): void;
  setWrapColor(color: WrapColor): void;
  setNote(text: string, color: string): void;
  setNoteLive(text: string, color: string): void;
  removeNote(): void;
  undo(): void;
  redo(): void;
  saveHistory(): void;
  shuffle(): void;
  rearrange(): void;
  clearAll(): void;
  reset(): void;
  loadPreset(preset: {
    wrapStyle: number;
    wrapColor: WrapColor;
    elements: Omit<FlowerElement, "id" | "zIndex">[];
  }): void;
}

const MAX_HISTORY = 30;

function takeSnapshot(state: Pick<BouquetStore, "elements" | "note">): Snapshot {
  return {
    elements: state.elements.map((e) => ({ ...e })),
    note: state.note ? { ...state.note } : null,
  };
}

function limitHistory(history: Snapshot[]): Snapshot[] {
  return history.length > MAX_HISTORY ? history.slice(history.length - MAX_HISTORY) : history;
}

function randomPositions(count: number): Position[] {
  return Array.from({ length: count }, () => ({
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
  }));
}

export const INITIAL_STATE = {
  wrapStyle: 1,
  wrapColor: "brown" as WrapColor,
  elements: [] as FlowerElement[],
  note: null,
  history: [] as Snapshot[],
  redoStack: [] as Snapshot[],
  shuffleCount: 0,
  shuffleOriginal: null,
  rearrangeCount: 0,
  rearrangeOriginalIds: null,
  selectedId: null,
  _nextId: 1,
};

// No persist — canvas always starts fresh. Saved bouquets live in the library.
export const useBouquetStore = create<BouquetStore>()((set, get) => ({
  ...INITIAL_STATE,

  saveHistory() {
    const s = get();
    set({
      history: limitHistory([...s.history, takeSnapshot(s)]),
      redoStack: [],
    });
  },

  undo() {
    const { history, elements, note } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set((s) => ({
      history: s.history.slice(0, -1),
      redoStack: [...s.redoStack, takeSnapshot({ elements, note })],
      elements: prev.elements,
      note: prev.note,
    }));
  },

  redo() {
    const { redoStack, elements, note } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set((s) => ({
      redoStack: s.redoStack.slice(0, -1),
      history: limitHistory([...s.history, takeSnapshot({ elements, note })]),
      elements: next.elements,
      note: next.note,
    }));
  },

  addFlower(flowerId, x, y, scale) {
    get().saveHistory();
    set((s) => ({
      elements: [
        ...s.elements,
        { id: s._nextId, flowerId, x, y, scale, rotation: 0, zIndex: s.elements.length },
      ],
      _nextId: s._nextId + 1,
    }));
  },

  removeFlower(id) {
    get().saveHistory();
    set((s) => ({
      elements: s.elements.filter((e) => e.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    }));
  },

  updateFlower(id, changes) {
    get().saveHistory();
    set((s) => ({
      elements: s.elements.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    }));
  },

  // Live update — no history snapshot (use during continuous drags)
  updateFlowerLive(id, changes) {
    set((s) => ({
      elements: s.elements.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    }));
  },

  moveFlower(id, x, y) {
    set((s) => ({
      elements: s.elements.map((e) => (e.id === id ? { ...e, x, y } : e)),
    }));
  },

  duplicateFlower(id) {
    get().saveHistory();
    set((s) => {
      const src = s.elements.find((e) => e.id === id);
      if (!src) return s;
      return {
        elements: [
          ...s.elements,
          {
            ...src,
            id: s._nextId,
            x: Math.min(94, src.x + 4),
            y: Math.min(94, src.y + 4),
            zIndex: s.elements.length,
          },
        ],
        _nextId: s._nextId + 1,
        selectedId: s._nextId,
      };
    });
  },

  selectFlower(id) { set({ selectedId: id }); },
  deselect() { set({ selectedId: null }); },

  setWrapStyle(n) { set({ wrapStyle: Math.max(1, Math.min(9, n)) }); },
  setWrapColor(color) { set({ wrapColor: color }); },

  setNote(text, color) {
    get().saveHistory();
    set({ note: text.trim() ? { text, color } : null });
  },

  setNoteLive(text, color) {
    set({ note: text.trim() ? { text, color } : null });
  },

  removeNote() {
    get().saveHistory();
    set({ note: null });
  },

  shuffle() {
    const { elements, shuffleCount, shuffleOriginal } = get();
    if (elements.length === 0) return;
    const newCount = shuffleCount + 1;

    if (newCount % 5 === 0) {
      if (shuffleOriginal) {
        set({
          elements: elements.map((e, i) =>
            shuffleOriginal[i] ? { ...e, x: shuffleOriginal[i].x, y: shuffleOriginal[i].y } : e
          ),
          shuffleCount: newCount,
          shuffleOriginal: null,
        });
      } else {
        set({ shuffleCount: newCount });
      }
      return;
    }

    const savedOriginal = shuffleOriginal ?? elements.map(({ x, y }) => ({ x, y }));
    const scattered = randomPositions(elements.length);

    set({
      elements: elements.map((e, i) => ({ ...e, x: scattered[i].x, y: scattered[i].y })),
      shuffleCount: newCount,
      shuffleOriginal: savedOriginal,
    });
  },

  rearrange() {
    const { elements, rearrangeCount, rearrangeOriginalIds } = get();
    if (elements.length < 2) return;

    const newCount = rearrangeCount + 1;

    // Every 5th shuffle: restore original arrangement and reset the cycle
    if (newCount % 5 === 0) {
      get().saveHistory();
      set((s) => ({
        elements: rearrangeOriginalIds
          ? s.elements.map((e, i) => ({ ...e, flowerId: rearrangeOriginalIds[i] ?? e.flowerId }))
          : s.elements,
        rearrangeCount: 0,
        rearrangeOriginalIds: null,
      }));
      return;
    }

    // First shuffle of a new cycle — snapshot the current order
    const savedOriginal = rearrangeOriginalIds ?? elements.map((e) => e.flowerId);

    get().saveHistory();
    const ids = elements.map((e) => e.flowerId);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    set((s) => ({
      elements: s.elements.map((e, i) => ({ ...e, flowerId: ids[i] })),
      rearrangeCount: newCount,
      rearrangeOriginalIds: savedOriginal,
    }));
  },

  clearAll() {
    get().saveHistory();
    set({ elements: [], note: null, selectedId: null, shuffleOriginal: null, shuffleCount: 0, rearrangeCount: 0, rearrangeOriginalIds: null });
  },

  reset() { set({ ...INITIAL_STATE }); },

  loadPreset({ wrapStyle, wrapColor, elements }) {
    const nextId = get()._nextId;
    const mapped = elements.map((e, i) => ({
      ...e,
      id: nextId + i,
      zIndex: i,
    }));
    set({
      ...INITIAL_STATE,
      wrapStyle,
      wrapColor,
      elements: mapped,
      _nextId: nextId + elements.length,
    });
  },
}));
