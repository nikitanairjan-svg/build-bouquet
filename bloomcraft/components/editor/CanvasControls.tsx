"use client";

import Icon from "@/components/shared/Icon";
import { useBouquetStore } from "@/store/bouquetStore";
import { CANVAS_W } from "./Canvas";

export default function CanvasControls() {
  const { undo, redo, shuffle, clearAll, history, redoStack, elements } =
    useBouquetStore();

  const canUndo = history.length > 0;
  const canRedo = redoStack.length > 0;
  const hasElements = elements.length > 0;

  const BTN_BASE: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: "1px solid rgba(44,26,14,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 150ms, opacity 150ms, transform 100ms",
    background: "rgba(255,255,255,0.55)",
    color: "var(--ink)",
  };

  const BTN_DISABLED: React.CSSProperties = {
    ...BTN_BASE,
    opacity: 0.32,
    cursor: "default",
  };

  return (
    <div
      style={{
        width: CANVAS_W,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginTop: 12,
      }}
    >
      {/* Undo */}
      <button
        title="Undo"
        disabled={!canUndo}
        style={canUndo ? BTN_BASE : BTN_DISABLED}
        onClick={undo}
        onMouseEnter={(e) => canUndo && ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.85)")}
        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.55)"}
      >
        <Icon name="undo" size={16} />
      </button>

      {/* Shuffle — highlighted in rust */}
      <button
        title="Shuffle arrangement"
        disabled={!hasElements}
        style={
          hasElements
            ? {
                ...BTN_BASE,
                background: "rgba(168,86,42,0.08)",
                border: "1px solid rgba(168,86,42,0.18)",
                color: "var(--rust)",
              }
            : { ...BTN_DISABLED, color: "var(--rust)" }
        }
        onClick={shuffle}
        onMouseEnter={(e) =>
          hasElements &&
          ((e.currentTarget as HTMLElement).style.background =
            "rgba(168,86,42,0.15)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "rgba(168,86,42,0.08)")
        }
      >
        <Icon name="shuffle" size={16} />
      </button>

      {/* Clear all */}
      <button
        title="Clear canvas"
        disabled={!hasElements}
        style={hasElements ? BTN_BASE : BTN_DISABLED}
        onClick={clearAll}
        onMouseEnter={(e) =>
          hasElements &&
          ((e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.85)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.55)")
        }
      >
        <Icon name="clear" size={16} />
      </button>

      {/* Redo */}
      <button
        title="Redo"
        disabled={!canRedo}
        style={canRedo ? BTN_BASE : BTN_DISABLED}
        onClick={redo}
        onMouseEnter={(e) =>
          canRedo &&
          ((e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.85)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "rgba(255,255,255,0.55)")
        }
      >
        <Icon name="redo" size={16} />
      </button>
    </div>
  );
}
