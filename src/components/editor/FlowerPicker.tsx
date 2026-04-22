"use client";

import { useState } from "react";
import { useBouquetStore } from "@/store/bouquetStore";
import { FLOWERS } from "@/lib/flowers";
import { MAX_FLOWERS } from "./CanvasControls";

const SIZES = [
  { label: "S", scale: 0.62 },
  { label: "M", scale: 0.88 },
  { label: "L", scale: 1.15 },
] as const;
type SizeLabel = (typeof SIZES)[number]["label"];

function randomBouquetPosition() {
  return { x: 28 + Math.random() * 44, y: 10 + Math.random() * 42 };
}

// ── Eyebrow label ──────────────────────────────────────────────────
function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 12px" }}>
      <span style={{ flex: 1, height: "0.5px", backgroundColor: "rgba(139,37,0,0.18)" }} />
      <span style={{
        fontFamily: "var(--font-jost)", fontSize: 9.5, fontWeight: 600,
        letterSpacing: "2px", textTransform: "uppercase",
        color: "#8B2500", whiteSpace: "nowrap",
      }}>
        {children}
      </span>
      <span style={{ flex: 1, height: "0.5px", backgroundColor: "rgba(139,37,0,0.18)" }} />
    </div>
  );
}

// ── Stepper button — 26px circle ──────────────────────────────────
function StepBtn({
  children, onClick, disabled, title,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
}) {
  const [hov, setHov] = useState(false);
  const active = hov && !disabled;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 26, height: 26, borderRadius: "50%",
        border: `1px solid ${active ? "#963310" : "#D8D0C4"}`,
        background: active ? "#963310" : "transparent",
        color: active ? "#FFF8F0" : disabled ? "#D8D0C4" : "#6B5E53",
        fontSize: 15, fontFamily: "var(--font-cormorant)", lineHeight: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 130ms, color 130ms, border-color 130ms",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

export default function FlowerPicker() {
  const { elements, addFlower, removeFlower } = useBouquetStore();
  const [size, setSize]           = useState<SizeLabel>("M");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const scaleForSize = SIZES.find((s) => s.label === size)!.scale;
  const total   = elements.length;
  const atLimit = total >= MAX_FLOWERS;

  const countOf = (flowerId: string) =>
    elements.filter((e) => e.flowerId === flowerId).length;

  const addOne = (flowerId: string) => {
    if (atLimit) return;
    const { x, y } = randomBouquetPosition();
    addFlower(flowerId, x, y, scaleForSize);
  };

  const removeOne = (flowerId: string) => {
    const matching = elements.filter((e) => e.flowerId === flowerId);
    if (matching.length === 0) return;
    const last = matching.reduce((a, b) => (b.id > a.id ? b : a));
    removeFlower(last.id);
  };

  return (
    <div style={{ padding: "0 16px 20px" }}>
      <style>{`
        @media (max-width: 640px) {
          .flower-size-row {
            gap: 5px !important;
          }
          .flower-size-btn {
            height: 24px !important;
            font-size: 12px !important;
          }
          .blooms-row {
            display: flex !important;
            gap: 8px !important;
            overflow-x: auto !important;
            // overflow-y: hidden !important;
            padding-bottom: 4px;
            scrollbar-width: thin;
            -webkit-overflow-scrolling: touch;
          }
          .blooms-row > .bloom-card {
            width: 104px !important;
            min-width: 104px !important;
            flex: 0 0 104px !important;
          }
        }
      `}</style>

      {/* BLOOM SIZE */}
      <EyebrowLabel>Bloom Size</EyebrowLabel>
      <div className="flower-size-row" style={{ display: "flex", gap: 6, marginBottom: 4 }}>
        {SIZES.map(({ label }) => {
          const active = label === size;
          return (
            <button
              className="flower-size-btn"
              key={label}
              onClick={() => setSize(label)}
              style={{
                flex: 1, height: 28, borderRadius: 20,
                border: `1px solid ${active ? "#963310" : "#D8D0C4"}`,
                background: active ? "#963310" : "transparent",
                color: active ? "#FFF8F0" : "#6B5E53",
                fontFamily: "var(--font-cormorant)",
                fontSize: 14, letterSpacing: "0.5px",
                cursor: "pointer", transition: "all 150ms",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* BLOOMS grid */}
      <EyebrowLabel>Blooms</EyebrowLabel>
      <div className="blooms-row" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {FLOWERS.map((flower) => {
          const count     = countOf(flower.id);
          const inBouquet = count > 0;
          const isHov     = hoveredId === flower.id;

          return (
            <div
              className="bloom-card"
              key={flower.id}
              onMouseEnter={() => setHoveredId(flower.id)}
              onMouseLeave={() => setHoveredId(null)}
              // Only add on click when card has no flowers yet
              onClick={() => !inBouquet && addOne(flower.id)}
              title={!inBouquet && atLimit ? "Bouquet is full — remove a bloom to add more" : undefined}
              style={{
                borderRadius: 10,
                border: `${inBouquet ? "1.5px" : "0.5px"} solid ${inBouquet ? "#963310" : "#D8D0C4"}`,
                backgroundColor: "#F5F0E8",
                display: "flex",
                flexDirection: "column",
                cursor: inBouquet ? "default" : atLimit ? "not-allowed" : "pointer",
                transform: isHov && !inBouquet && !atLimit ? "translateY(-2px)" : "none",
                boxShadow: isHov && !inBouquet && !atLimit ? "0 4px 12px rgba(61,43,31,0.08)" : "none",
                transition: "transform 150ms, box-shadow 150ms, border-color 150ms",
                overflow: "hidden",
              }}
            >
              {/* ── Image area — square warm box ── */}
              <div style={{
                position: "relative",
                margin: "6px 6px 0",
                borderRadius: 7,
                backgroundColor: "#EDE6DA",
                aspectRatio: "1 / 1",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}>
                {/* "+" badge on hover when not yet in bouquet */}
                {!inBouquet && isHov && !atLimit && (
                  <span style={{
                    position: "absolute", top: 5, right: 5,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#963310", color: "#FFF8F0",
                    fontSize: 11, fontWeight: 700, lineHeight: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 2,
                  }}>
                    +
                  </span>
                )}
                <img
                  src={flower.imagePath}
                  alt={flower.name}
                  draggable={false}
                  style={{
                    width: "72%", height: "72%",
                    objectFit: "contain", display: "block",
                  }}
                />
              </div>

              {/* ── Footer — fixed height, switches between name and qty ── */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 36,
                flexShrink: 0,
                padding: "0 6px",
              }}>
                {count === 0 ? (
                  /* Name — centered, shown only when not in bouquet */
                  <span style={{
                    fontFamily: "var(--font-cormorant)", fontStyle: "italic",
                    fontSize: 13, color: "#6B5E53",
                    letterSpacing: "0.2px", textAlign: "center",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {flower.name}
                  </span>
                ) : (
                  /* Qty control — centered, shown once flower is added */
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StepBtn
                      onClick={(e) => { e.stopPropagation(); removeOne(flower.id); }}
                      title="Remove one"
                    >
                      −
                    </StepBtn>
                    <span style={{
                      minWidth: 16, textAlign: "center",
                      fontFamily: "var(--font-cormorant)",
                      fontSize: 14, fontWeight: 500, color: "#3D2B1F",
                    }}>
                      {count}
                    </span>
                    <StepBtn
                      onClick={(e) => { e.stopPropagation(); addOne(flower.id); }}
                      disabled={atLimit}
                      title={atLimit ? "Bouquet is full — remove a bloom to add more" : "Add one more"}
                    >
                      +
                    </StepBtn>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
