"use client";

import { useBouquetStore } from "@/store/bouquetStore";

export default function EditorHint() {
  const isEmpty = useBouquetStore((s) => s.elements.length === 0);
  if (!isEmpty) return null;
  return (
    <p style={{
      fontFamily: "var(--font-cormorant)",
      fontStyle: "italic",
      fontSize: 15,
      color: "#A89E93",
      textAlign: "center",
      marginTop: 14,
      userSelect: "none",
      pointerEvents: "none",
      letterSpacing: "0.01em",
    }}>
      Tap a bloom to begin arranging
    </p>
  );
}
