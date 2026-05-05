import Image from "next/image";
import Link from "next/link";
import Canvas from "@/components/editor/Canvas";
import CanvasControls from "@/components/editor/CanvasControls";
import CanvasHint from "@/components/editor/CanvasHint";
import PreviewButton from "@/components/editor/PreviewButton";
import EditorBackButton from "@/components/editor/EditorBackButton";
import SidePanel from "@/components/editor/SidePanel";

export const metadata = { title: "Create Bouquet" };

export default function EditorPage() {
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", backgroundColor: "var(--paper)", overflow: "hidden", position: "relative" }}>
      <style>{`
        .editor-main {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }
        .editor-workspace {
          flex: 0 0 80%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: var(--lnd-bg);
          background-image: linear-gradient(rgba(61,43,31,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(61,43,31,0.06) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .editor-sidepanel {
          flex: 0 0 20%;
          overflow: hidden;
          display: flex;
        }
        @media (max-width: 1200px) {
          .editor-workspace { flex-basis: 74%; }
          .editor-sidepanel { flex-basis: 26%; }
        }
        @media (max-width: 960px) {
          .editor-header { padding: 0 14px !important; }
          .editor-back-label { display: none; }
          .editor-main {
            flex-direction: column;
            height: calc(100dvh - 56px);
          }
          .editor-workspace {
            flex: 1;
            min-height: 0;
          }
          .editor-sidepanel {
            flex: 0 0 260px;
            width: 100%;
            border-left: none;
            overflow: hidden;
          }
        }
        @media (max-width: 430px) {
          .editor-workspace {
            justify-content: center;
            overflow: visible;
            padding: 8px 8px 6px 8px;
          }
          .editor-canvas-stack {
            transform: scale(0.92);
            transform-origin: center center;
          }
          .editor-header .editor-preview-btn {
            padding: 6px 12px !important;
            font-size: 13px !important;
          }
        }
        @media (max-width: 360px) {
          .editor-canvas-stack { transform: scale(0.76); }
        }
        /* Short phones (e.g. iPhone SE): cap so canvas doesn't overflow too far */
        @media (max-height: 780px) and (max-width: 640px) {
          .editor-canvas-stack { transform: scale(0.80); }
        }
        @media (max-height: 720px) and (max-width: 640px) {
          .editor-canvas-stack { transform: scale(0.72); }
          .editor-sidepanel { flex: 0 0 clamp(146px, 24vh, 180px); }
        }
      `}</style>

      {/* ── Botanical watermark decorations (behind everything) ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/backgrounds/watermark-hero.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute", right: "18%", top: "50%",
          transform: "translateY(-50%)",
          width: 520, height: "auto",
          opacity: 0.07,
          mixBlendMode: "multiply",
          pointerEvents: "none", userSelect: "none", zIndex: 0,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/backgrounds/watermark-footer.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute", left: -40, bottom: -40,
          width: 380, height: "auto",
          opacity: 0.07,
          mixBlendMode: "multiply",
          pointerEvents: "none", userSelect: "none", zIndex: 0,
        }}
      />

      {/* ── Header ── */}
      <header className="editor-header" style={{
        flexShrink: 0,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        backgroundColor: "var(--paper)",
        borderBottom: "0.5px solid #D8D0C4",
        position: "relative", zIndex: 10,
      }}>
        <EditorBackButton />

        {/* Logo — center */}
        <Link href="/" aria-label="Go to home" style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center",
        }}>
          <Image
            src="/preloader/logo.svg"
            alt="BloomCraft"
            width={36}
            height={36}
            style={{ objectFit: "contain", display: "block" }}
          />
        </Link>

        <PreviewButton />
      </header>

      {/* ── Main area ── */}
      <div className="editor-main">

        {/* Canvas workspace */}
        <div className="editor-workspace">
          <CanvasHint />
          {/* Only Canvas in the scaled stack — CanvasControls must NOT be here
              because transform:scale creates a new containing block that breaks
              position:fixed on mobile */}
          <div className="editor-canvas-stack" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Canvas />
            <div style={{ height: 14 }} />
          </div>
          {/* CanvasControls sits inside the workspace (not the transformed canvas-stack)
              so desktop absolute-positioning works, and mobile position:fixed still
              escapes to the viewport (workspace has no transform/filter/will-change) */}
          <CanvasControls />
        </div>

        {/* Side panel — 20% */}
        <div className="editor-sidepanel">
          <SidePanel />
        </div>
      </div>
    </div>
  );
}
