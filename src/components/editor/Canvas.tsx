"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBouquetStore, consumeSkipNextReset, type FlowerElement } from "@/store/bouquetStore";
import { getWrapImagePath } from "@/lib/wraps";
import { getFlowerById } from "@/lib/flowers";
import FlowerToolbar from "./FlowerToolbar";
import NoteModal from "./NoteModal";

export const CANVAS_W = 420;
export const CANVAS_H = 520;

const WRAP_W      = 340;
const WRAP_H      = 460;
const FLOWER_SIZE = 88;
const HANDLE_SIZE = 10;
const ROTATE_OFFSET = 28; // center of rotation handle above flower top; keeps 15px stem line with 8px box pad

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ── Envelope note card ─────────────────────────────────────────
// Renders as a closed envelope — text is hidden inside.
// Click to edit, × on hover to remove.
function NoteCard({
  onRemove, onEdit,
}: {
  note: { text: string; color: string };
  onRemove: () => void;
  onEdit: () => void;
}) {
  const [hov, setHov] = useState(false);
  const W = 130, H = 82;
  const MX = W / 2, MY = Math.round(H * 0.50);

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); onEdit(); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "absolute",
        bottom: 55,
        right: 22,
        transform: `rotate(4deg) translateY(${hov ? -4 : 0}px)`,
        zIndex: 50,
        cursor: "pointer",
        filter: hov
          ? "drop-shadow(0 10px 22px rgba(44,31,20,0.38))"
          : "drop-shadow(0 4px 12px rgba(44,31,20,0.28)) drop-shadow(0 1px 3px rgba(44,31,20,0.18))",
        transition: "transform 160ms ease, filter 160ms ease",
      }}
    >
      {/* Remove × — top-right, only on hover */}
      {hov && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{
            position: "absolute", top: -8, right: -8, zIndex: 10,
            width: 20, height: 20, borderRadius: "50%",
            backgroundColor: "#963310", border: "none",
            color: "#FFF8F0", fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", lineHeight: 1,
            boxShadow: "0 2px 6px rgba(44,31,20,0.20)",
          }}
        >
          ×
        </button>
      )}

      {/* Envelope SVG */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ display: "block" }}
        aria-label="Note (click to edit)"
      >
        <defs>
          <clipPath id="envelope-seal-clip">
            <circle cx={MX} cy={MY} r="13" />
          </clipPath>
        </defs>

        {/* Body */}
        <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="2"
          fill="#F5EFE4" stroke="#C4B8A8" strokeWidth="1.5" />

        {/* Left fold */}
        <polygon points={`0.5,0.5 0.5,${H - 0.5} ${MX},${MY}`}
          fill="#EDE6D8" stroke="#D0C8B8" strokeWidth="0.4" strokeLinejoin="round" />

        {/* Right fold */}
        <polygon points={`${W - 0.5},0.5 ${W - 0.5},${H - 0.5} ${MX},${MY}`}
          fill="#EDE6D8" stroke="#D0C8B8" strokeWidth="0.4" strokeLinejoin="round" />

        {/* Bottom fold */}
        <polygon points={`0.5,${H - 0.5} ${W - 0.5},${H - 0.5} ${MX},${MY}`}
          fill="#EAE2D4" stroke="#D0C8B8" strokeWidth="0.4" strokeLinejoin="round" />

        {/* Top flap — closed, pointing down */}
        <polygon points={`0.5,0.5 ${W - 0.5},0.5 ${MX},${MY}`}
          fill="#E3DAC8" stroke="#D0C8B8" strokeWidth="0.4" strokeLinejoin="round" />

        {/* Seal background — red circle */}
        <circle cx={MX} cy={MY} r="13" fill="#963310" />

        {/* Logo clipped to seal circle */}
        <image
          href="/preloader/logo.svg"
          x={MX - 13} y={MY - 13}
          width="26" height="26"
          clipPath="url(#envelope-seal-clip)"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Thin ring around seal */}
        <circle cx={MX} cy={MY} r="13" fill="none"
          stroke="rgba(255,248,240,0.35)" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ── Handle drag state ──────────────────────────────────────────
interface HandleDrag {
  type: "resize" | "rotate";
  startScale: number;
  startRotation: number;
  startDist: number;
  startAngle: number;
  centerX: number;
  centerY: number;
}

// ── Individual placed flower ───────────────────────────────────
// NOTE: All transforms live in style.transform only.
// Framer Motion is used ONLY for opacity enter/exit — never for scale/rotate/translate.
// Mixing Framer Motion animate.scale with a CSS scale() transform causes hit-box drift.
function PlacedFlower({
  elem,
  isSelected,
  onPointerDown,
}: {
  elem: FlowerElement;
  isSelected: boolean;
  // onPointerDown must call e.stopPropagation() so the canvas's deselect handler is skipped
  onPointerDown: (e: React.PointerEvent, id: number) => void;
}) {
  const { updateFlowerLive, saveHistory } = useBouquetStore();
  const flower   = getFlowerById(elem.flowerId);
  const imgRef   = useRef<HTMLImageElement>(null);
  const hDragRef = useRef<HandleDrag | null>(null);
  const [rotHov, setRotHov] = useState(false);

  // Global handlers for resize / rotate handle drags
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const h = hDragRef.current;
      if (!h) return;
      if (h.type === "resize") {
        const dist = Math.hypot(e.clientX - h.centerX, e.clientY - h.centerY);
        updateFlowerLive(elem.id, { scale: clamp(h.startScale * (dist / h.startDist), 0.25, 2.5) });
      } else {
        const angle = Math.atan2(e.clientY - h.centerY, e.clientX - h.centerX) * (180 / Math.PI);
        const newRot = ((h.startRotation + (angle - h.startAngle)) % 360 + 360) % 360;
        updateFlowerLive(elem.id, { rotation: newRot });
      }
    };
    const onUp = () => { hDragRef.current = null; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
  }, [elem.id, updateFlowerLive]);

  const getCenter = () => {
    const r = imgRef.current?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 0, y: 0 };
  };

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    const c = getCenter();
    saveHistory();
    hDragRef.current = {
      type: "resize", startScale: elem.scale, startRotation: elem.rotation,
      startDist: Math.hypot(e.clientX - c.x, e.clientY - c.y) || 1,
      startAngle: 0, centerX: c.x, centerY: c.y,
    };
  };

  const startRotate = (e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    const c = getCenter();
    saveHistory();
    hDragRef.current = {
      type: "rotate", startScale: elem.scale, startRotation: elem.rotation,
      startDist: 1, startAngle: Math.atan2(e.clientY - c.y, e.clientX - c.x) * (180 / Math.PI),
      centerX: c.x, centerY: c.y,
    };
  };

  if (!flower) return null;

  const hdl = (extra: React.CSSProperties): React.CSSProperties => ({
    position: "absolute", width: HANDLE_SIZE, height: HANDLE_SIZE,
    borderRadius: "50%", backgroundColor: "#C4756B",
    border: "1.5px solid white", boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
    pointerEvents: "auto", zIndex: 10, ...extra,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "absolute",
        left: `${elem.x}%`,
        top:  `${elem.y}%`,
        width:  FLOWER_SIZE,
        height: FLOWER_SIZE,
        // ALL positional transforms here — Framer Motion never touches these
        transform: `translate(-50%, -50%) rotate(${elem.rotation}deg) scale(${elem.scale})`,
        zIndex: elem.zIndex + 1,
        pointerEvents: "none", // container is pass-through; children opt-in below
      }}
    >
      {/* Selection ring */}
      {isSelected && (
        <div style={{
          position: "absolute", inset: -8,
          borderRadius: "50%",
          border: "1.5px solid #C4756B",
          boxShadow: "0 0 0 3px rgba(196,117,107,0.25)",
          pointerEvents: "none",
        }} />
      )}

      {/* Flower image — the interactive drag target.
          mix-blend-mode: screen makes the black backgrounds of the PNGs
          transparent (black × screen = destination), revealing the canvas
          behind while the coloured petals render normally. */}
      <img
        ref={imgRef}
        src={flower.imagePath}
        alt={flower.name}
        draggable={false}
        style={{
          display: "block",
          width:  FLOWER_SIZE,
          height: FLOWER_SIZE,
          objectFit: "contain",
          mixBlendMode: "screen",
          pointerEvents: "auto",
          cursor: "grab",
          userSelect: "none",
        }}
        onPointerDown={(e) => onPointerDown(e, elem.id)}
      />

      {/* Handles — only when selected */}
      {isSelected && (
        <>
          {/* Rotation stem line — connects handle bottom to selection box top (15px) */}
          <div style={{
            position: "absolute",
            top: -(ROTATE_OFFSET - HANDLE_SIZE / 2),        // = -23 (handle bottom edge)
            left: "50%", transform: "translateX(-50%)",
            width: 1,
            height: ROTATE_OFFSET - HANDLE_SIZE / 2 - 8,   // = 15 (down to box top at -8)
            backgroundColor: "#C4756B", pointerEvents: "none",
          }} />
          {/* Rotation handle — hover: scale + darken */}
          <div
            title="Drag to rotate"
            onMouseEnter={() => setRotHov(true)}
            onMouseLeave={() => setRotHov(false)}
            style={{
              position: "absolute",
              width: HANDLE_SIZE, height: HANDLE_SIZE,
              borderRadius: "50%",
              backgroundColor: rotHov ? "#B8635A" : "#C4756B",
              border: "1.5px solid white",
              boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
              pointerEvents: "auto", zIndex: 10,
              top: -ROTATE_OFFSET - HANDLE_SIZE / 2,        // = -33
              left: "50%",
              transform: `translateX(-50%) scale(${rotHov ? 1.2 : 1})`,
              cursor: "grab",
              transition: "background-color 120ms, transform 120ms",
            }}
            onPointerDown={startRotate}
          />
          {/* Corner resize handles */}
          <div style={hdl({ top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: "nw-resize" })} onPointerDown={startResize} />
          <div style={hdl({ top: -HANDLE_SIZE / 2, left: FLOWER_SIZE - HANDLE_SIZE / 2, cursor: "ne-resize" })} onPointerDown={startResize} />
          <div style={hdl({ top: FLOWER_SIZE - HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: "sw-resize" })} onPointerDown={startResize} />
          <div style={hdl({ top: FLOWER_SIZE - HANDLE_SIZE / 2, left: FLOWER_SIZE - HANDLE_SIZE / 2, cursor: "se-resize" })} onPointerDown={startResize} />
        </>
      )}
    </motion.div>
  );
}

// ── Move drag state ────────────────────────────────────────────
interface MoveDrag {
  id: number;
  startCX: number;
  startCY: number;
  moved: boolean;
  savedHistory: boolean;
}

// ── Canvas ─────────────────────────────────────────────────────
export default function Canvas() {
  const { elements, selectedId, wrapStyle, wrapColor, selectFlower, deselect, note, removeNote, reset } =
    useBouquetStore();

  const canvasRef    = useRef<HTMLDivElement>(null);
  const moveDrag     = useRef<MoveDrag | null>(null);
  const [showNoteEdit, setShowNoteEdit] = useState(false);

  // ── Reset on every mount ───────────────────────────────────
  // The store is an in-memory singleton — navigating away and back preserves
  // state unless we explicitly reset. Always start fresh unless skipNextReset
  // is set (e.g. when navigating back from the preview page).
  useEffect(() => {
    if (consumeSkipNextReset()) return;
    try { localStorage.removeItem("bloomcraft-bouquet"); } catch {}
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Global pointer handlers for flower move drag ───────────
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = moveDrag.current;
      if (!d) return;
      const dx = e.clientX - d.startCX;
      const dy = e.clientY - d.startCY;
      if (!d.moved && Math.hypot(dx, dy) > 4) {
        d.moved = true;
        if (!d.savedHistory) {
          useBouquetStore.getState().saveHistory();
          d.savedHistory = true;
        }
      }
      if (d.moved && canvasRef.current) {
        const r = canvasRef.current.getBoundingClientRect();
        const newX = clamp(((e.clientX - r.left) / r.width)  * 100, 4, 96);
        const newY = clamp(((e.clientY - r.top)  / r.height) * 100, 4, 96);
        useBouquetStore.getState().moveFlower(d.id, newX, newY);
      }
    };

    const onUp = () => {
      const d = moveDrag.current;
      // pointer never moved → treat as a tap/click → select this flower
      if (d && !d.moved) selectFlower(d.id);
      moveDrag.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
  }, [selectFlower]);

  // Called by PlacedFlower's img onPointerDown.
  // stopPropagation prevents the canvas's onPointerDown (deselect) from firing —
  // which is the correct behaviour: pressing on a flower should not deselect it.
  const handleFlowerPointerDown = (e: React.PointerEvent, id: number) => {
    e.stopPropagation();
    e.preventDefault();
    moveDrag.current = {
      id,
      startCX: e.clientX,
      startCY: e.clientY,
      moved: false,
      savedHistory: false,
    };
  };

  const selectedElem = elements.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="relative select-none" style={{ width: CANVAS_W, height: CANVAS_H }}>

      {/* ── Canvas surface ──
          No background set here — the parent column's dotted-grid background
          shows through, making the canvas and the workspace one single surface
          with no nested card or inner box. overflow:hidden clips flowers that
          are dragged beyond the 420×520 boundary. */}
      <div
        ref={canvasRef}
        className="absolute inset-0 overflow-hidden"
        // onPointerDown — not onClick — for deselect.
        // Reason: using onClick caused a race: mouseup → selectFlower, then
        // the subsequent click event bubbled from the flower img up to here
        // and immediately called deselect(), clearing the selection.
        // With onPointerDown, the flower's onPointerDown fires first with
        // stopPropagation(), so this handler is never reached when pressing
        // on a flower — only on truly empty canvas areas.
        onPointerDown={() => deselect()}
      >
        {/* Wrap base layer — always rendered so users can pick a wrap before adding flowers */}
        <div style={{
          position: "absolute", bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: WRAP_W, height: WRAP_H, pointerEvents: "none",
          zIndex: 1,
        }}>
          <img
            src={getWrapImagePath(wrapStyle, wrapColor)}
            alt=""
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>

        {/* Individual flower elements — each independently positioned */}
        <AnimatePresence>
          {elements.map((elem) => (
            <PlacedFlower
              key={elem.id}
              elem={elem}
              isSelected={elem.id === selectedId}
              onPointerDown={handleFlowerPointerDown}
            />
          ))}
        </AnimatePresence>

        {/* Note card */}
        {note?.text.trim() && (
          <NoteCard
            note={note}
            onRemove={removeNote}
            onEdit={() => setShowNoteEdit(true)}
          />
        )}
      </div>

      {/* FlowerToolbar — outside overflow:hidden so it can float above the canvas */}
      <AnimatePresence>
        {selectedElem && <FlowerToolbar elem={selectedElem} />}
      </AnimatePresence>

      {/* Note edit modal — triggered by clicking the note card on canvas */}
      {showNoteEdit && (
        <NoteModal existing={note} onClose={() => setShowNoteEdit(false)} />
      )}
    </div>
  );
}
