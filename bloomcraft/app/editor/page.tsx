import Link from "next/link";
import Canvas from "@/components/editor/Canvas";
import CanvasControls from "@/components/editor/CanvasControls";
import SidePanel from "@/components/editor/SidePanel";
import Icon from "@/components/shared/Icon";

export const metadata = { title: "Create Bouquet" };

export default function EditorPage() {
  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--paper)",
        overflow: "hidden",
      }}
    >
      {/* ── Top nav ─────────────────────────────────────── */}
      <header
        style={{
          height: 60,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid rgba(44,26,14,0.09)",
          backgroundColor: "var(--paper)",
        }}
      >
        {/* Back */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--ink)",
            textDecoration: "none",
            fontFamily: "var(--font-jost)",
            fontSize: 13,
            fontWeight: 400,
            opacity: 0.7,
            transition: "opacity 150ms",
          }}
          aria-label="Back to home"
        >
          <Icon name="back" size={16} />
          Back
        </Link>

        {/* Title */}
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 20,
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "0.02em",
            margin: 0,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          Create Bouquet
        </h1>

        {/* Preview CTA */}
        <Link
          href="/preview"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 999,
            backgroundColor: "var(--brown-dark)",
            color: "white",
            fontFamily: "var(--font-jost)",
            fontSize: 12.5,
            fontWeight: 500,
            textDecoration: "none",
            letterSpacing: "0.04em",
            boxShadow: "0 2px 10px rgba(44,26,14,0.22)",
            transition: "opacity 150ms",
          }}
        >
          Preview&nbsp;✦
        </Link>
      </header>

      {/* ── Main area ────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Canvas column — centred */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 32px",
            overflow: "auto",
            gap: 0,
          }}
        >
          <Canvas />
          <CanvasControls />
        </div>

        {/* Side panel */}
        <SidePanel />
      </div>
    </div>
  );
}
