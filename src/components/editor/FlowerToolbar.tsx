"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, RotateCw, Maximize2, Trash2 } from "lucide-react";
import { useBouquetStore, type FlowerElement } from "@/store/bouquetStore";

const CANVAS_W    = 420;
const CANVAS_H    = 520;
const TOOLBAR_W   = 224;
const TOOLBAR_H   = 40;
const FLOWER_BASE = 88;

// Palette
const BG        = "#F0EAE0";
const BORDER    = "#D8D0C4";
const ICON_CLR  = "#4A3F35";
const HOV_BG    = "rgba(150,51,16,0.14)";
const DIM_CLR   = "#C8BDB5";

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ── Slider popover ───────────────────────────────────────────────
function SliderPopover({
  label, value, min, max, step, onChange, format,
}: {
  label: string; value: number; min: number; max: number;
  step: number; onChange: (v: number) => void; format: (v: number) => string;
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: BG,
        border: `0.5px solid ${BORDER}`,
        borderRadius: 10,
        padding: "10px 14px",
        width: 160,
        boxShadow: "0 4px 16px rgba(61,43,31,0.10)",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{
          fontFamily: "var(--font-jost)", fontSize: 9.5, fontWeight: 600,
          letterSpacing: "1.5px", textTransform: "uppercase", color: "#8B2500",
        }}>
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: 12, color: "#3D2B1F" }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#963310", cursor: "pointer" }}
      />
    </div>
  );
}

// ── Toolbar button ───────────────────────────────────────────────
function TBtn({
  children, title, onClick, active, danger, disabled,
}: {
  children: React.ReactNode; title: string;
  onClick: () => void; active?: boolean; danger?: boolean; disabled?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 38, height: TOOLBAR_H,
        border: "none",
        background: disabled ? "transparent"
          : hov ? HOV_BG
          : active ? "rgba(150,51,16,0.10)"
          : "transparent",
        color: disabled ? DIM_CLR
          : danger ? "#8B2500"
          : active ? "#3D2B1F"
          : ICON_CLR,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        transition: "background 150ms, color 150ms",
        borderRadius: 6, flexShrink: 0,
        padding: "4px 8px",
      }}
    >
      {children}
    </button>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function FlowerToolbar({ elem }: { elem: FlowerElement }) {
  const { elements, updateFlower, updateFlowerLive, removeFlower } = useBouquetStore();
  const [openSlider, setOpenSlider] = useState<"rotate" | "resize" | null>(null);

  const xPx = (elem.x / 100) * CANVAS_W;
  const yPx = (elem.y / 100) * CANVAS_H;
  const flowerHalfH = (FLOWER_BASE * elem.scale) / 2;

  const left = clamp(xPx - TOOLBAR_W / 2, 4, CANVAS_W - TOOLBAR_W - 4);
  const arrowX = clamp(xPx - left, 14, TOOLBAR_W - 14);

  // Clear rotation handle (10px) + stem line (15px) + box pad (8px) + gap (8px) = 41px above flower top
  const idealTop  = yPx - flowerHalfH - TOOLBAR_H - 41;
  const isFlipped = idealTop < 4; // flip below the flower when too close to top edge
  const top       = isFlipped
    ? Math.min(yPx + flowerHalfH + 20, CANVAS_H - TOOLBAR_H - 4)
    : Math.max(4, idealTop);

  // ── Bring forward / Send backward — one step at a time ────────
  const maxZ        = elements.length - 1;
  const canBringFwd = elem.zIndex < maxZ;
  const canSendBack = elem.zIndex > 0;

  const bringToFront = () => {
    if (!canBringFwd) return;
    const above = elements.find((e) => e.id !== elem.id && e.zIndex === elem.zIndex + 1);
    useBouquetStore.getState().saveHistory();
    if (above) useBouquetStore.getState().updateFlowerLive(above.id, { zIndex: elem.zIndex });
    useBouquetStore.getState().updateFlowerLive(elem.id, { zIndex: elem.zIndex + 1 });
  };

  const sendToBack = () => {
    if (!canSendBack) return;
    const below = elements.find((e) => e.id !== elem.id && e.zIndex === elem.zIndex - 1);
    useBouquetStore.getState().saveHistory();
    if (below) useBouquetStore.getState().updateFlowerLive(below.id, { zIndex: elem.zIndex });
    useBouquetStore.getState().updateFlowerLive(elem.id, { zIndex: elem.zIndex - 1 });
  };

  const toggleSlider = (which: "rotate" | "resize") => {
    setOpenSlider((prev) => {
      if (prev !== which) useBouquetStore.getState().saveHistory();
      return prev === which ? null : which;
    });
  };

  const Sep = () => (
    <span style={{ width: "0.5px", height: 16, background: BORDER, flexShrink: 0, margin: "0 1px" }} />
  );

  return (
    <motion.div
      key="flower-toolbar"
      initial={{ opacity: 0, scale: 0.90, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.90, y: 4 }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute", left, top,
        width: TOOLBAR_W, height: TOOLBAR_H,
        zIndex: 200, display: "flex", alignItems: "center",
        gap: 0, padding: "0 4px",
        borderRadius: 10,
        backgroundColor: BG,
        border: `0.5px solid ${BORDER}`,
        boxShadow: "0 2px 8px rgba(61,43,31,0.08)",
      }}
    >
      {/* Arrow tip — points toward the flower (down when above, up when below) */}
      {isFlipped ? (
        <svg
          width="14" height="7" viewBox="0 0 14 7"
          style={{ position: "absolute", top: -7, left: arrowX - 7, pointerEvents: "none", overflow: "visible" }}
          aria-hidden="true"
        >
          <path d="M0 7 L7 0 L14 7" fill={BG} stroke={BORDER} strokeWidth="0.5" strokeLinejoin="round" />
          <line x1="0" y1="6.5" x2="14" y2="6.5" stroke={BG} strokeWidth="1.5" />
        </svg>
      ) : (
        <svg
          width="14" height="7" viewBox="0 0 14 7"
          style={{ position: "absolute", bottom: -7, left: arrowX - 7, pointerEvents: "none", overflow: "visible" }}
          aria-hidden="true"
        >
          <path d="M0 0 L7 7 L14 0" fill={BG} stroke={BORDER} strokeWidth="0.5" strokeLinejoin="round" />
          <line x1="0" y1="0.5" x2="14" y2="0.5" stroke={BG} strokeWidth="1.5" />
        </svg>
      )}

      <TBtn title="Bring to front" onClick={bringToFront} disabled={!canBringFwd}>
        <ArrowUp size={18} strokeWidth={1.8} />
      </TBtn>
      <TBtn title="Send to back" onClick={sendToBack} disabled={!canSendBack}>
        <ArrowDown size={18} strokeWidth={1.8} />
      </TBtn>

      <Sep />

      <div style={{ position: "relative" }}>
        <TBtn title="Rotate" onClick={() => toggleSlider("rotate")} active={openSlider === "rotate"}>
          <RotateCw size={18} strokeWidth={1.8} />
        </TBtn>
        {openSlider === "rotate" && (
          <SliderPopover
            label="Rotation"
            value={elem.rotation}
            min={0} max={360} step={1}
            onChange={(v) => updateFlowerLive(elem.id, { rotation: v })}
            format={(v) => `${Math.round(v)}°`}
          />
        )}
      </div>

      <div style={{ position: "relative" }}>
        <TBtn title="Resize" onClick={() => toggleSlider("resize")} active={openSlider === "resize"}>
          <Maximize2 size={17} strokeWidth={1.8} />
        </TBtn>
        {openSlider === "resize" && (
          <SliderPopover
            label="Scale"
            value={Math.round(elem.scale * 100)}
            min={30} max={200} step={1}
            onChange={(v) => updateFlowerLive(elem.id, { scale: v / 100 })}
            format={(v) => `${v}%`}
          />
        )}
      </div>

      <Sep />

      <TBtn title="Remove flower" onClick={() => removeFlower(elem.id)} danger>
        <Trash2 size={17} strokeWidth={1.8} />
      </TBtn>
    </motion.div>
  );
}
