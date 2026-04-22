"use client";

import { useState } from "react";
import { Undo2, Redo2, Trash2, Shuffle, PenLine } from "lucide-react";
import { useBouquetStore } from "@/store/bouquetStore";
import NoteModal from "./NoteModal";

export const MAX_FLOWERS = 15;

// ── Icon button ───────────────────────────────────────────────────
function IBtn({
  children, title, onClick, disabled, danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      className="icon-btn"
      title={title}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 40, height: 40, borderRadius: 8,
        border: "none", display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        transition: "background 150ms",
        background: hov && !disabled ? "rgba(150,51,16,0.10)" : "transparent",
        color: disabled
          ? "#D8D0C4"
          : danger ? "#8B2500"
          : "#6B5E53",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

// ── Pill button ────────────────────────────────────────────────────
function Pill({
  icon, label, onClick, disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      className="pill-btn"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 14px", borderRadius: 20,
        border: `1px solid ${hov && !disabled ? "#963310" : "#D8D0C4"}`,
        background: hov && !disabled ? "#963310" : "transparent",
        fontFamily: "var(--font-cormorant)",
        fontSize: 13, letterSpacing: "0.3px",
        color: disabled ? "#A89E93" : hov ? "#FFF8F0" : "#4A3F35",
        cursor: disabled ? "default" : "pointer",
        transition: "background 150ms, border-color 150ms, color 150ms",
        flexShrink: 0,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Clear confirmation ─────────────────────────────────────────────
function ClearConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(44,31,20,0.28)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(2px)",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#F5F0E8", borderRadius: 14, border: "1px solid #D8D0C4",
          padding: "28px 32px", maxWidth: 300, width: "88%",
          boxShadow: "0 8px 40px rgba(44,31,20,0.15)", textAlign: "center",
        }}
      >
        <p style={{ fontFamily: "var(--font-cormorant)", fontSize: 22, fontWeight: 500, color: "#3D2B1F", marginBottom: 8 }}>
          Clear your bouquet?
        </p>
        <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: 14, color: "#A89E93", marginBottom: 24, lineHeight: 1.5 }}>
          This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 20,
              border: "1px solid #D8D0C4", background: "transparent",
              fontFamily: "var(--font-cormorant)", fontSize: 14,
              color: "#6B5E53", cursor: "pointer", transition: "background 150ms",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(44,31,20,0.04)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 20,
              border: "none", background: "#963310",
              fontFamily: "var(--font-cormorant)", fontSize: 14,
              color: "#FFF8F0", cursor: "pointer", transition: "opacity 150ms",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.82")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Vertical divider ──────────────────────────────────────────────
function Sep() {
  return (
    <span style={{ width: 1, height: 16, background: "#D8D0C4", margin: "0 6px", flexShrink: 0 }} />
  );
}

// ── Main toolbar ───────────────────────────────────────────────────
export default function CanvasControls() {
  const { undo, redo, rearrange, clearAll, history, redoStack, elements, note } = useBouquetStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNote, setShowNote]       = useState(false);

  const canUndo = history.length > 0;
  const canRedo = redoStack.length > 0;
  const hasEls  = elements.length > 0;

  const handleClear = () => { clearAll(); setShowConfirm(false); };

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .canvas-toolbar {
            height: 40px !important;
            padding: 0 4px !important;
          }
          .canvas-toolbar .icon-btn {
            width: 32px !important;
            height: 32px !important;
          }
          .canvas-toolbar .pill-btn {
            padding: 4px 10px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
      {/* ── Floating toolbar — sits below the bouquet ── */}
      <div className="canvas-toolbar" style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0 6px",
        height: 48,
        borderRadius: 12,
        backgroundColor: "#F0EAE0",
        boxShadow: "0 2px 8px rgba(61,43,31,0.08)",
        border: "0.5px solid #D8D0C4",
      }}>
        {/* Undo / Redo / Clear */}
        <IBtn title="Undo" disabled={!canUndo} onClick={undo}>
          <Undo2 size={20} strokeWidth={1.7} />
        </IBtn>
        <IBtn title="Redo" disabled={!canRedo} onClick={redo}>
          <Redo2 size={20} strokeWidth={1.7} />
        </IBtn>
        <IBtn title="Clear all" disabled={!hasEls} danger onClick={() => hasEls && setShowConfirm(true)}>
          <Trash2 size={18} strokeWidth={1.7} />
        </IBtn>

        <Sep />

        {/* Rearrange / Add Note */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "0 4px" }}>
          <Pill
            icon={<Shuffle size={11} strokeWidth={2} />}
            label="Rearrange"
            disabled={elements.length < 2}
            onClick={rearrange}
          />
          <Pill
            icon={<PenLine size={11} strokeWidth={2} />}
            label={note ? "Edit note" : "Add note"}
            onClick={() => setShowNote(true)}
          />
        </div>
      </div>

      {showConfirm && <ClearConfirm onConfirm={handleClear} onCancel={() => setShowConfirm(false)} />}
      {showNote    && <NoteModal existing={note} onClose={() => setShowNote(false)} />}
    </>
  );
}
