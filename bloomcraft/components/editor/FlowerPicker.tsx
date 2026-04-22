"use client";

import { useState } from "react";
import { useBouquetStore } from "@/store/bouquetStore";
import { FLOWERS } from "@/lib/flowers";

// ─── Size configuration ───────────────────────────────────────
const SIZES = [
  { label: "S", scale: 0.62 },
  { label: "M", scale: 0.88 },
  { label: "L", scale: 1.15 },
] as const;
type SizeLabel = (typeof SIZES)[number]["label"];

// ─── Bouquet drop zone (% of canvas) ─────────────────────────
// Flowers appear in the upper-centre area where blooms sit above the wrap.
function randomBouquetPosition() {
  return {
    x: 28 + Math.random() * 44,  // 28–72%
    y: 10 + Math.random() * 42,  // 10–52%
  };
}

// ─── Component ───────────────────────────────────────────────
export default function FlowerPicker() {
  const { elements, addFlower } = useBouquetStore();
  const [size, setSize] = useState<SizeLabel>("M");
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const scaleForSize = SIZES.find((s) => s.label === size)!.scale;

  const countForFlower = (flowerId: string) =>
    elements.filter((e) => e.flowerId === flowerId).length;

  const handleAdd = (flowerId: string) => {
    const { x, y } = randomBouquetPosition();
    addFlower(flowerId, x, y, scaleForSize);
    setLastAdded(flowerId);
  };

  return (
    <div style={{ padding: "12px 10px 16px" }}>
      {/* S / M / L size toggle */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 14,
          justifyContent: "center",
        }}
      >
        {SIZES.map(({ label }) => {
          const active = label === size;
          return (
            <button
              key={label}
              onClick={() => setSize(label)}
              style={{
                height: 30,
                width: 44,
                borderRadius: 8,
                border: `1.5px solid ${active ? "var(--rust)" : "rgba(44,26,14,0.12)"}`,
                background: active ? "rgba(168,86,42,0.08)" : "transparent",
                color: active ? "var(--rust)" : "rgba(44,26,14,0.55)",
                fontFamily: "var(--font-jost)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "all 150ms",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 3 × 3 flower grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
        }}
      >
        {FLOWERS.map((flower) => {
          const count = countForFlower(flower.id);
          const isLast = flower.id === lastAdded;

          return (
            <button
              key={flower.id}
              title={`Add ${flower.name}`}
              onClick={() => handleAdd(flower.id)}
              style={{
                background: isLast
                  ? "rgba(168,86,42,0.07)"
                  : "rgba(255,255,255,0.50)",
                border: `2px solid ${isLast ? "var(--rust)" : "rgba(44,26,14,0.10)"}`,
                borderRadius: 10,
                padding: 0,
                cursor: "pointer",
                overflow: "visible",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                transition: "border-color 150ms, background 150ms",
              }}
            >
              {/* Badge counter */}
              {count > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 17,
                    height: 17,
                    borderRadius: "50%",
                    background: "var(--rust)",
                    color: "white",
                    fontFamily: "var(--font-jost)",
                    fontSize: 9.5,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                    border: "1.5px solid var(--paper)",
                  }}
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}

              {/* Flower thumbnail */}
              <div
                style={{
                  width: "100%",
                  height: 68,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  borderRadius: "8px 8px 0 0",
                  background: "rgba(255,255,255,0.4)",
                }}
              >
                <img
                  src={flower.imagePath}
                  alt={flower.name}
                  draggable={false}
                  style={{
                    width: 54,
                    height: 54,
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>

              {/* Name */}
              <span
                style={{
                  fontFamily: "var(--font-jost)",
                  fontSize: 9.5,
                  fontWeight: 500,
                  color: isLast ? "var(--rust)" : "rgba(44,26,14,0.55)",
                  padding: "4px 4px 5px",
                  textAlign: "center",
                  lineHeight: 1.2,
                  width: "100%",
                  letterSpacing: "0.02em",
                }}
              >
                {flower.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
