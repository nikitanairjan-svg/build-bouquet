import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Domain Types ─────────────────────────────────────────────

export type WrapColor = "brown" | "pink" | "lilac";

export interface Position {
  x: number;
  y: number;
}

export interface FlowerElement {
  id: number;
  flowerId: string;
  x: number;        // canvas position, 0–100 (%)
  y: number;
  scale: number;    // e.g. 0.5–2.0
  rotation: number; // degrees
  zIndex: number;
}

// Snapshot captures the mutable canvas state for undo/redo
interface Snapshot {
  elements: FlowerElement[];
  note: { text: string; color: string } | null;
}

// ─── Store Interface ──────────────────────────────────────────

interface BouquetStore {
  // ── State
  wrapStyle: number;                          // 1–9
  wrapColor: WrapColor;
  elements: FlowerElement[];
  note: { text: string; color: string } | null;
  history: Snapshot[];                        // undo stack, max 30
  redoStack: Snapshot[];                      // redo stack (spec: "redo")
  shuffleCount: number;
  shuffleOriginal: Position[] | null;         // positions at cycle start
  selectedId: number | null;

  /** Internal auto-increment — not part of the public API */
  _nextId: number;

  // ── Actions
  addFlower(flowerId: string, x: number, y: number, scale: number): void;
  removeFlower(id: number): void;
  /** Update flower props and save a history snapshot. */
  updateFlower(id: number, changes: Partial<Omit<FlowerElement, "id">>): void;
  /** Reposition a flower WITHOUT saving history — used during drag. */
  moveFlower(id: number, x: number, y: number): void;
  /** Clone a flower with a small position offset. */
  duplicateFlower(id: number): void;
  selectFlower(id: number | null): void;
  deselect(): void;
  setWrapStyle(n: number): void;
  setWrapColor(color: WrapColor): void;
  setNote(text: string, color: string): void;
  /** Update note without touching history — for live textarea preview. */
  setNoteLive(text: string, color: string): void;
  removeNote(): void;
  undo(): void;
  redo(): void;
  /** Push current canvas state onto the undo stack. Call before every mutation. */
  saveHistory(): void;
  shuffle(): void;
  clearAll(): void;
  reset(): void;
}

// ─── Helpers ──────────────────────────────────────────────────

const MAX_HISTORY = 30;

function takeSnapshot(state: Pick<BouquetStore, "elements" | "note">): Snapshot {
  return {
    elements: state.elements.map((e) => ({ ...e })),
    note: state.note ? { ...state.note } : null,
  };
}

function limitHistory(history: Snapshot[]): Snapshot[] {
  return history.length > MAX_HISTORY
    ? history.slice(history.length - MAX_HISTORY)
    : history;
}

/** Randomly scatter n elements within a 10–90% canvas safe zone */
function randomPositions(count: number): Position[] {
  return Array.from({ length: count }, () => ({
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
  }));
}

// ─── Initial State ────────────────────────────────────────────

const INITIAL_STATE = {
  wrapStyle: 1,
  wrapColor: "brown" as WrapColor,
  elements: [] as FlowerElement[],
  note: null,
  history: [] as Snapshot[],
  redoStack: [] as Snapshot[],
  shuffleCount: 0,
  shuffleOriginal: null,
  selectedId: null,
  _nextId: 1,
};

// ─── Store ────────────────────────────────────────────────────

export const useBouquetStore = create<BouquetStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ── History ────────────────────────────────────────────

      saveHistory() {
        const s = get();
        set({
          history: limitHistory([...s.history, takeSnapshot(s)]),
          redoStack: [], // any new action wipes the redo future
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
          history: limitHistory([
            ...s.history,
            takeSnapshot({ elements, note }),
          ]),
          elements: next.elements,
          note: next.note,
        }));
      },

      // ── Flowers ────────────────────────────────────────────

      addFlower(flowerId, x, y, scale) {
        get().saveHistory();
        set((s) => ({
          elements: [
            ...s.elements,
            {
              id: s._nextId,
              flowerId,
              x,
              y,
              scale,
              rotation: 0,
              zIndex: s.elements.length,
            },
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
          elements: s.elements.map((e) =>
            e.id === id ? { ...e, ...changes } : e
          ),
        }));
      },

      moveFlower(id, x, y) {
        set((s) => ({
          elements: s.elements.map((e) =>
            e.id === id ? { ...e, x, y } : e
          ),
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

      selectFlower(id) {
        set({ selectedId: id });
      },

      deselect() {
        set({ selectedId: null });
      },

      // ── Wrap ───────────────────────────────────────────────

      setWrapStyle(n) {
        set({ wrapStyle: Math.max(1, Math.min(9, n)) });
      },

      setWrapColor(color) {
        set({ wrapColor: color });
      },

      // ── Note ───────────────────────────────────────────────

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

      // ── Shuffle ────────────────────────────────────────────
      //
      // Cycle of 5:
      //   shuffle 1 → save original positions, randomise
      //   shuffle 2–4 → randomise
      //   shuffle 5 → restore original, clear shuffleOriginal (cycle resets)

      shuffle() {
        const { elements, shuffleCount, shuffleOriginal } = get();
        if (elements.length === 0) return;

        const newCount = shuffleCount + 1;

        // 5th shuffle of the cycle → restore & end cycle
        if (newCount % 5 === 0) {
          if (shuffleOriginal) {
            set({
              elements: elements.map((e, i) =>
                shuffleOriginal[i]
                  ? { ...e, x: shuffleOriginal[i].x, y: shuffleOriginal[i].y }
                  : e
              ),
              shuffleCount: newCount,
              shuffleOriginal: null,
            });
          } else {
            set({ shuffleCount: newCount });
          }
          return;
        }

        // First shuffle of a new cycle → capture original positions
        const savedOriginal =
          shuffleOriginal ?? elements.map(({ x, y }) => ({ x, y }));

        const scattered = randomPositions(elements.length);

        set({
          elements: elements.map((e, i) => ({
            ...e,
            x: scattered[i].x,
            y: scattered[i].y,
          })),
          shuffleCount: newCount,
          shuffleOriginal: savedOriginal,
        });
      },

      // ── Bulk ───────────────────────────────────────────────

      clearAll() {
        get().saveHistory();
        set({
          elements: [],
          note: null,
          selectedId: null,
          shuffleOriginal: null,
          shuffleCount: 0,
        });
      },

      reset() {
        set({ ...INITIAL_STATE });
      },
    }),
    {
      name: "bloomcraft-bouquet",
      // Only persist the canvas payload — skip transient/derived state
      partialize: (s) => ({
        wrapStyle: s.wrapStyle,
        wrapColor: s.wrapColor,
        elements: s.elements,
        note: s.note,
        _nextId: s._nextId,
      }),
    }
  )
);
