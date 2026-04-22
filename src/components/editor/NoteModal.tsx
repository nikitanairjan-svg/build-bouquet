"use client";

import { useState } from "react";
import { useBouquetStore } from "@/store/bouquetStore";

export default function NoteModal({
  existing,
  onClose,
}: {
  existing: { text: string; color: string } | null;
  onClose: () => void;
}) {
  const { setNote, removeNote } = useBouquetStore();
  const [text, setText]           = useState(existing?.text ?? "");
  const [cancelHov, setCancelHov] = useState(false);
  const [saveHov,   setSaveHov]   = useState(false);
  const [removeHov, setRemoveHov] = useState(false);

  const handleSave   = () => { if (text.trim()) setNote(text.trim(), "#2C1F14"); onClose(); };
  const handleRemove = () => { removeNote(); onClose(); };

  // Stamp / perforated-edge mask — 7px-radius semicircles punched from all 4 sides every 18px
  const stampMask = [
    "radial-gradient(circle at 50% 0%,   transparent 7px, black 7.5px) 0 0 / 18px 100% repeat-x",
    "radial-gradient(circle at 50% 100%, transparent 7px, black 7.5px) 0 0 / 18px 100% repeat-x",
    "radial-gradient(circle at 0%  50%,  transparent 7px, black 7.5px) 0 0 / 100% 18px repeat-y",
    "radial-gradient(circle at 100% 50%, transparent 7px, black 7.5px) 0 0 / 100% 18px repeat-y",
  ].join(", ");

  // Cast needed because maskComposite / WebkitMaskComposite values are non-standard string literals
  const stampMaskStyle = {
    WebkitMask: stampMask,
    WebkitMaskComposite: "source-in",
    mask: stampMask,
    maskComposite: "intersect",
  } as React.CSSProperties;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(61,43,31,0.40)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* ── Stacking wrapper — both layers are sized relative to this ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", maxWidth: 380, width: "90%" }}
      >

        {/* ── Layer 1: Kraft envelope (behind, tilted right) ── */}
        <div
          style={{
            position: "absolute",
            // Peek out on all sides; more on top so the flap is visible above the letter
            top: -28, left: -14, right: -14, bottom: -8,
            backgroundColor: "#C4A872",
            borderRadius: 2,
            transform: "rotate(3deg)",
            transformOrigin: "center bottom",
            boxShadow: "0 4px 16px rgba(61,43,31,0.22)",
            overflow: "hidden",
          }}
        >
          {/* V-shaped flap — closed, pointing down from top edge */}
          <div
            style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: 60,
              backgroundColor: "#B89860",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            }}
          />
          {/* Subtle bottom-left / bottom-right corner triangles (envelope sides) */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "45%",
            background: "linear-gradient(to top right, #C0A06A 50%, transparent 50%)",
            opacity: 0.4,
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "45%",
            background: "linear-gradient(to top left, #C0A06A 50%, transparent 50%)",
            opacity: 0.4,
          }} />
        </div>

        {/* ── Layer 2: Stationery letter card (front, tilted left) ── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            backgroundColor: "#FAF6F0",
            transform: "rotate(-2deg)",
            transformOrigin: "center bottom",
            padding: "30px 30px 26px",
            // Perforated stamp edges
            ...stampMaskStyle,
          }}
        >
          {/* Title */}
          <p style={{
            fontFamily: "var(--font-cormorant)", fontStyle: "italic",
            fontSize: 17, color: "#3D2B1F",
            textAlign: "center", margin: "0 0 16px",
          }}>
            A note for you
          </p>

          {/* Ruled textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write something heartfelt…"
            maxLength={500}
            autoFocus
            style={{
              width: "100%", boxSizing: "border-box", resize: "none",
              fontFamily: "var(--font-cormorant)", fontStyle: "italic",
              fontSize: 14, lineHeight: "26px", color: "#6B5E53",
              backgroundColor: "transparent",
              backgroundImage: "repeating-linear-gradient(transparent, transparent 25px, rgba(61,43,31,0.07) 25px, rgba(61,43,31,0.07) 26px)",
              backgroundPosition: "0 2px",
              border: "none", outline: "none",
              padding: "2px 0",
              display: "block",
              minHeight: 104,
            }}
          />

          {/* Char count */}
          <div style={{
            textAlign: "right",
            fontFamily: "var(--font-cormorant)", fontStyle: "italic",
            fontSize: 11, color: "#8B7E72",
            marginTop: 8,
          }}>
            {text.length} / 500
          </div>

          {/* Button row */}
          <div style={{
            borderTop: "0.5px solid #E0D6CA",
            paddingTop: 12, marginTop: 14,
            display: "flex", justifyContent: "flex-end",
            alignItems: "center", gap: 12,
          }}>
            {existing && (
              <button
                onClick={handleRemove}
                onMouseEnter={() => setRemoveHov(true)}
                onMouseLeave={() => setRemoveHov(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "var(--font-cormorant)", fontSize: 13,
                  color: removeHov ? "#8B2500" : "#C4B8AC",
                  transition: "color 150ms",
                  marginRight: "auto", padding: 0,
                }}
              >
                Remove
              </button>
            )}
            <button
              onClick={onClose}
              onMouseEnter={() => setCancelHov(true)}
              onMouseLeave={() => setCancelHov(false)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-cormorant)", fontSize: 13,
                color: cancelHov ? "#6B5E53" : "#A89E93",
                transition: "color 150ms", padding: 0,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!text.trim()}
              onMouseEnter={() => setSaveHov(true)}
              onMouseLeave={() => setSaveHov(false)}
              style={{
                padding: "8px 20px", borderRadius: 20, border: "none",
                background: !text.trim() ? "#D8CFC0" : saveHov ? "#7A2A0D" : "#963310",
                cursor: text.trim() ? "pointer" : "default",
                fontFamily: "var(--font-cormorant)", fontSize: 13,
                color: text.trim() ? "#FFF8F0" : "#A89E93",
                transition: "background 150ms",
              }}
            >
              Add to bouquet
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
