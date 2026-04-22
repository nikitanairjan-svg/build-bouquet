"use client";

import { useState, useRef, useEffect } from "react";
import { useBouquetStore } from "@/store/bouquetStore";
import { WRAPS, WRAP_COLORS, getWrapImagePath } from "@/lib/wraps";
import FlowerPicker from "./FlowerPicker";

const TABS = [
  { id: "bouquet", label: "Bouquet" },
  { id: "blooms",  label: "Blooms"  },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ── Eyebrow label — matches landing page "WHERE WOULD YOU LIKE TO BEGIN?" ──
function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      margin: "16px 0 12px",
    }}>
      <span style={{ flex: 1, height: "0.5px", backgroundColor: "rgba(139,37,0,0.18)" }} />
      <span style={{
        fontFamily: "var(--font-jost)",
        fontSize: 9.5, fontWeight: 600,
        letterSpacing: "2px", textTransform: "uppercase",
        color: "#8B2500",
        whiteSpace: "nowrap",
      }}>
        {children}
      </span>
      <span style={{ flex: 1, height: "0.5px", backgroundColor: "rgba(139,37,0,0.18)" }} />
    </div>
  );
}

// ── Bouquet tab (wrap + color) ─────────────────────────────────────
function BouquetTab() {
  const { wrapStyle, wrapColor, setWrapStyle, setWrapColor } = useBouquetStore();
  const [hoveredWrap, setHoveredWrap] = useState<number | null>(null);

  return (
    <div style={{ padding: "0 16px 20px" }}>
      <style>{`
        @media (max-width: 640px) {
          .wrap-colors-row {
            justify-content: flex-start !important;
            // overflow-x: auto !important;
            // overflow-y: hidden !important;
            padding-bottom: 4px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
          }
          .wrap-color-btn {
            min-width: 52px;
            flex: 0 0 auto;
          }
          .wraps-row {
            display: flex !important;
            gap: 8px !important;
            overflow-x: auto !important;
            // overflow-y: hidden !important;
            padding-bottom: 4px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
          }
          .wraps-row > .wrap-card {
            width: 104px !important;
            min-width: 104px !important;
            flex: 0 0 104px !important;
          }
        }
      `}</style>

      {/* COLOR section — top, mirrors Bloom Size position in Blooms tab */}
      <EyebrowLabel>Color</EyebrowLabel>
      <div className="wrap-colors-row" style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 4 }}>
        {WRAP_COLORS.map((c) => {
          const active = c.id === wrapColor;
          return (
            <button
              className="wrap-color-btn"
              key={c.id}
              title={c.label}
              onClick={() => setWrapColor(c.id)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                background: "none", border: "none", cursor: "pointer", padding: 0,
              }}
            >
              <span style={{
                width: 32, height: 32, borderRadius: "50%",
                backgroundColor: c.hex, display: "block",
                boxShadow: "0 0 0 1px rgba(44,31,20,0.12)",
                outline: active ? "2px solid #963310" : "none",
                outlineOffset: "3px",
                transition: "outline 150ms",
              }} />
              <span style={{
                fontFamily: "var(--font-cormorant)",
                fontStyle: "italic",
                fontSize: 11,
                color: active ? "#963310" : "#A89E93",
                letterSpacing: "0.02em",
                transition: "color 150ms",
              }}>
                {c.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* WRAP section — 2-column grid, same card size as Blooms */}
      <EyebrowLabel>Wrap</EyebrowLabel>
      <div className="wraps-row" style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 8,
      }}>
        {WRAPS.map((wrap) => {
          const selected = wrap.id === wrapStyle;
          const hov      = hoveredWrap === wrap.id;
          return (
            <div
              className="wrap-card"
              key={wrap.id}
              onClick={() => setWrapStyle(wrap.id)}
              onMouseEnter={() => setHoveredWrap(wrap.id)}
              onMouseLeave={() => setHoveredWrap(null)}
              style={{
                borderRadius: 10,
                border: `${selected ? "1.5px" : "0.5px"} solid ${selected ? "#963310" : "#D8D0C4"}`,
                backgroundColor: "#F5F0E8",
                display: "flex", flexDirection: "column",
                cursor: "pointer", overflow: "hidden",
                transform: hov && !selected ? "translateY(-2px)" : "none",
                boxShadow: hov && !selected ? "0 4px 12px rgba(61,43,31,0.08)" : "none",
                transition: "transform 150ms, box-shadow 150ms, border-color 150ms",
              }}
            >
              {/* Image area — square warm box, matches flower card */}
              <div style={{
                margin: "6px 6px 0",
                borderRadius: 7,
                backgroundColor: "#EDE6DA",
                aspectRatio: "1 / 1",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}>
                <img
                  src={getWrapImagePath(wrap.id, wrapColor)}
                  alt={wrap.name}
                  draggable={false}
                  style={{ width: "72%", height: "72%", objectFit: "contain", display: "block" }}
                />
              </div>

              {/* Footer — name label, matches flower card height */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: 36, flexShrink: 0, padding: "0 6px",
              }}>
                <span style={{
                  fontFamily: "var(--font-cormorant)", fontStyle: "italic",
                  fontSize: 13, color: selected ? "#963310" : "#6B5E53",
                  letterSpacing: "0.2px", textAlign: "center",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  transition: "color 150ms",
                }}>
                  {wrap.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ── Panel ──────────────────────────────────────────────────────────
export default function SidePanel() {
  const [activeTab, setActiveTab] = useState<TabId>("bouquet");
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startYRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Detect if mobile
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const checkMobile = () => setIsMobile(window.innerWidth <= 960);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleDragStart = (e: React.PointerEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
    startYRef.current = e.clientY;
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!isDragging || !isMobile) return;
    e.preventDefault();
    const dy = e.clientY - startYRef.current;
    // Smooth dragging with no limits during drag, limits applied on end
    setDragOffset(dy);
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50; // pixels to trigger toggle
    const velocity = Math.abs(dragOffset) > threshold;
    
    if (velocity) {
      if (dragOffset < 0 && !isExpanded) {
        // Dragged up when collapsed - expand
        setIsExpanded(true);
      } else if (dragOffset > 0 && isExpanded) {
        // Dragged down when expanded - collapse
        setIsExpanded(false);
      }
    }
    
    // Smooth return to position
    setDragOffset(0);
  };

  // Handle outside click to collapse
  useEffect(() => {
    if (!isMobile || !isExpanded) return;

    const handleOutsideClick = (e: Event) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isMobile, isExpanded]);

  // Desktop layout
  if (!hydrated || !isMobile) {
    return (
      <aside style={{
        flex: 1, width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        backgroundColor: "#F0EAE0",
        borderLeft: "1px solid #D8D0C4",
      }}>
        <style>{`
          @media (max-width: 640px) {
            .sidepanel-tabs button {
              padding: 10px 0 9px !important;
              font-size: 13px !important;
            }
          }
        `}</style>

        <div className="sidepanel-tabs" style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid #D8D0C4",
          flexShrink: 0,
        }}>
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            const hov    = hoveredTab === tab.id && !active;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  flex: 1,
                  background: "none", border: "none", cursor: "pointer",
                  padding: "14px 0 12px",
                  fontFamily: "var(--font-cormorant)",
                  fontSize: 15, letterSpacing: "0.5px",
                  textAlign: "center",
                  color: active ? "#3D2B1F" : hov ? "#6B5E53" : "#A89E93",
                  borderBottom: active ? "2px solid #963310" : "2px solid transparent",
                  marginBottom: "-1px",
                  transition: "color 180ms, border-color 180ms",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="sidepanel-content" style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: "#D8D0C4 transparent",
        }}>
          {activeTab === "bouquet" && <BouquetTab />}
          {activeTab === "blooms"  && <FlowerPicker />}
        </div>
      </aside>
    );
  }

  // Mobile bottom sheet layout
  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        maxHeight: isExpanded ? "90vh" : "clamp(180px, 30vh, 230px)",
        backgroundColor: "#F0EAE0",
        borderTop: "1px solid #D8D0C4",
        display: "flex",
        flexDirection: "column",
        transition: !isDragging ? "max-height 300ms ease" : "none",
        transform: `translateY(${dragOffset}px)`,
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
      }}
      onPointerMove={handleDragMove}
      onPointerUp={handleDragEnd}
      onPointerLeave={handleDragEnd}
    >
      {/* Drag handle - mobile notification bar style */}
      <div
        onPointerDown={handleDragStart}
        style={{
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          flexShrink: 0,
          userSelect: "none",
          touchAction: "none",
          padding: "8px 0",
          transition: "transform 150ms",
          transform: isDragging ? "scale(1.05)" : "scale(1)",
        }}
      >
        <div
          style={{
            width: 60,
            height: 4,
            borderRadius: 2,
            backgroundColor: isDragging ? "rgba(139, 37, 0, 0.5)" : "rgba(139, 37, 0, 0.3)",
            transition: "background-color 150ms, transform 150ms, box-shadow 150ms",
            transform: isDragging ? "scaleY(1.2)" : "scaleY(1)",
            boxShadow: isDragging ? "0 2px 8px rgba(139, 37, 0, 0.3)" : "none",
          }}
        />
      </div>

      {/* Tabs */}
      <div className="sidepanel-tabs" style={{
        display: "flex",
        gap: 0,
        borderBottom: "1px solid #D8D0C4",
        flexShrink: 0,
      }}>
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          const hov    = hoveredTab === tab.id && !active;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                flex: 1,
                background: "none", border: "none", cursor: "pointer",
                padding: "10px 0 9px",
                fontFamily: "var(--font-cormorant)",
                fontSize: 13, letterSpacing: "0.5px",
                textAlign: "center",
                color: active ? "#3D2B1F" : hov ? "#6B5E53" : "#A89E93",
                borderBottom: active ? "2px solid #963310" : "2px solid transparent",
                marginBottom: "-1px",
                transition: "color 180ms, border-color 180ms",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="sidepanel-content" style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "thin",
        scrollbarColor: "#D8D0C4 transparent",
      }}>
        {activeTab === "bouquet" && <BouquetTab />}
        {activeTab === "blooms"  && <FlowerPicker />}
      </div>
    </div>
  );
}
