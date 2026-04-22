"use client";

import { useState } from "react";
import WrapPicker from "./WrapPicker";
import FlowerPicker from "./FlowerPicker";
import NoteEditor from "./NoteEditor";

const TABS = [
  { id: "wrap",   label: "Wrap" },
  { id: "blooms", label: "Blooms" },
  { id: "note",   label: "Note" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function SidePanel() {
  const [activeTab, setActiveTab] = useState<TabId>("blooms");

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(237,228,214,0.65)",
        borderLeft: "1px solid rgba(44,26,14,0.09)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* ── Tab bar ─────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          padding: "10px 8px 0",
          gap: 3,
          borderBottom: "1px solid rgba(44,26,14,0.09)",
          flexShrink: 0,
        }}
      >
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "7px 0 8px",
                borderRadius: "8px 8px 0 0",
                border: "none",
                background: active
                  ? "rgba(44,26,14,0.07)"
                  : "transparent",
                fontFamily: "var(--font-jost)",
                fontSize: 11.5,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--ink)" : "rgba(44,26,14,0.45)",
                letterSpacing: "0.05em",
                cursor: "pointer",
                transition: "all 150ms",
                borderBottom: active
                  ? "2px solid var(--rust)"
                  : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content (scrollable) ─────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          // Custom minimal scrollbar
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(44,26,14,0.18) transparent",
        }}
      >
        {activeTab === "wrap"   && <WrapPicker />}
        {activeTab === "blooms" && <FlowerPicker />}
        {activeTab === "note"   && <NoteEditor />}
      </div>
    </aside>
  );
}
