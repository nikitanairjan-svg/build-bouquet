"use client";

import { useBouquetStore } from "@/store/bouquetStore";
import { getFlowerById } from "@/lib/flowers";
import { CANVAS_W } from "./Canvas";

export default function BouquetSummary() {
  const { elements, selectedId, selectFlower } = useBouquetStore();

  if (elements.length === 0) return null;

  // Build a map of flowerId → { count, firstId }
  const counts = new Map<string, { count: number; firstId: number }>();
  for (const el of elements) {
    const existing = counts.get(el.flowerId);
    if (existing) {
      existing.count++;
    } else {
      counts.set(el.flowerId, { count: 1, firstId: el.id });
    }
  }

  const chips = Array.from(counts.entries()).map(([flowerId, { count, firstId }]) => ({
    flowerId,
    count,
    firstId,
    flower: getFlowerById(flowerId),
  })).filter((c) => c.flower !== undefined);

  return (
    <div style={{ width: CANVAS_W }}>
      {/* Label */}
      <p style={{
        fontFamily: "var(--font-jost)",
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: "0.13em",
        textTransform: "uppercase",
        color: "rgba(44,31,20,0.35)",
        marginBottom: 5,
        paddingLeft: 2,
      }}>
        In your bouquet
      </p>

      {/* Chips row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          overflowX: "auto",
          scrollbarWidth: "none",
          flexShrink: 0,
        }}
      >
        {chips.map(({ flowerId, count, firstId, flower }) => {
          const isActive = elements.find((e) => e.id === selectedId)?.flowerId === flowerId;
          return (
            <button
              key={flowerId}
              title={`Select ${flower!.name}`}
              onClick={() => selectFlower(firstId)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 9px 4px 5px",
                borderRadius: 999,
                border: `1px solid ${isActive ? "rgba(196,117,107,0.55)" : "rgba(44,31,20,0.10)"}`,
                backgroundColor: isActive ? "rgba(196,117,107,0.14)" : "rgba(210,195,182,0.45)",
                cursor: "pointer",
                flexShrink: 0,
                transition: "border-color 150ms, background 150ms",
              }}
            >
              <img
                src={flower!.imagePath}
                alt={flower!.name}
                draggable={false}
                style={{ width: 18, height: 18, objectFit: "contain", display: "block" }}
              />
              <span style={{
                fontFamily: "var(--font-jost)",
                fontSize: 10,
                fontWeight: 500,
                color: isActive ? "#A05C54" : "rgba(44,31,20,0.55)",
                whiteSpace: "nowrap",
                letterSpacing: "0.02em",
              }}>
                {flower!.name} × {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
