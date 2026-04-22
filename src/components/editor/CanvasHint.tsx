"use client";

import { useBouquetStore } from "@/store/bouquetStore";

export default function CanvasHint() {
  const count = useBouquetStore((s) => s.elements.length);
  const text =
    count === 0 ? "Tap a bloom to begin arranging" :
    count === 1 ? "Add more blooms to your bouquet" :
    count < 5   ? "Keep adding blooms to fill it out" :
                  "Looking beautiful — keep going";

  return (
    <p
      style={{
        position: "absolute",
        top: 24,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "var(--font-cormorant)",
        fontStyle: "italic",
        fontSize: 17,
        color: count === 0 ? "#7A6E66" : "#9E9088",
        letterSpacing: "0.01em",
        userSelect: "none",
        pointerEvents: "none",
        margin: 0,
        transition: "color 400ms",
        zIndex: 2,
      }}
    >
      {text}
    </p>
  );
}
