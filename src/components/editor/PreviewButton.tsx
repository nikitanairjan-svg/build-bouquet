"use client";

import Link from "next/link";
import { useBouquetStore } from "@/store/bouquetStore";

export default function PreviewButton() {
  const count = useBouquetStore((s) => s.elements.length);
  const visible = count > 0;

  return (
    <Link
      href="/preview"
      className="editor-preview-btn"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "7px 18px", borderRadius: 8,
        backgroundColor: "#963310",
        color: "#FFF8F0",
        fontFamily: "var(--font-cormorant)", fontSize: 15, letterSpacing: "0.3px",
        textDecoration: "none",
        boxShadow: "0 2px 10px rgba(150,51,16,0.28)",
        flexShrink: 0,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 300ms ease",
      }}
    >
      Preview Bouquet →
    </Link>
  );
}
