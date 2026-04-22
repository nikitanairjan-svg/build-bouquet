"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBouquetStore, type FlowerElement } from "@/store/bouquetStore";
import { getWrapImagePath } from "@/lib/wraps";
import { getFlowerById } from "@/lib/flowers";
import FlowerToolbar from "./FlowerToolbar";

// ─── Constants ────────────────────────────────────────────────
export const CANVAS_W = 420;
export const CANVAS_H = 520;
const WRAP_W = 340;
const WRAP_H = 460;
const FLOWER_SIZE = 88; // base px for flower images

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// ─── Drag state (ref, never triggers re-render) ───────────────
interface DragState {
  id: number;
  startClientX: number;
  startClientY: number;
  startElemX: number;
  startElemY: number;
  savedHistory: boolean;
}

// ─── Individual placed flower ─────────────────────────────────
function PlacedFlower({
  elem,
  isSelected,
  onPointerDown,
}: {
  elem: FlowerElement;
  isSelected: boolean;
  onPointerDown: (e: React.MouseEvent, id: number) => void;
}) {
  const flower = getFlowerById(elem.flowerId);
  if (!flower) return null;

  return (
    <motion.div
      key={elem.id}
      // Only opacity animates — transforms are in style (instant)
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeIn" }}
      style={{
        position: "absolute",
        left: `${elem.x}%`,
        top: `${elem.y}%`,
        // translate(-50%,-50%) centres the flower on its x/y coordinate
        transform: `translate(-50%, -50%) rotate(${elem.rotation}deg) scale(${elem.scale})`,
        zIndex: isSelected ? 100 : elem.zIndex + 1,
        // No pointer events on the wrapper — only the img gets hit-tested
        pointerEvents: "none",
      }}
    >
      {/* Selection ring */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            border: "2px solid var(--rust)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Flower image — tight hit area */}
      <img
        src={flower.imagePath}
        alt={flower.name}
        draggable={false}
        width={FLOWER_SIZE}
        height={FLOWER_SIZE}
        style={{
          display: "block",
          width: FLOWER_SIZE,
          height: FLOWER_SIZE,
          objectFit: "contain",
          mixBlendMode: "multiply",
          pointerEvents: "auto",
          cursor: "grab",
          userSelect: "none",
        }}
        onMouseDown={(e) => onPointerDown(e, elem.id)}
      />
    </motion.div>
  );
}

// ─── Canvas ───────────────────────────────────────────────────
export default function Canvas() {
  const {
    elements,
    selectedId,
    wrapStyle,
    wrapColor,
    deselect,
    note,
  } = useBouquetStore();

  const dragRef = useRef<DragState | null>(null);

  // ── Global mouse handlers — attached once on mount ───────────
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;

      const dx = e.clientX - d.startClientX;
      const dy = e.clientY - d.startClientY;

      // Save history exactly once at the start of a drag
      if (!d.savedHistory && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        useBouquetStore.getState().saveHistory();
        d.savedHistory = true;
      }

      if (d.savedHistory) {
        const newX = clamp(d.startElemX + (dx / CANVAS_W) * 100, 4, 96);
        const newY = clamp(d.startElemY + (dy / CANVAS_H) * 100, 4, 96);
        useBouquetStore.getState().moveFlower(d.id, newX, newY);
      }
    };

    const onMouseUp = () => {
      const d = dragRef.current;
      if (d && !d.savedHistory) {
        // No movement → was a click → select the flower
        useBouquetStore.getState().selectFlower(d.id);
      }
      dragRef.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleFlowerMouseDown = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const elem = useBouquetStore.getState().elements.find((el) => el.id === id);
    if (!elem) return;
    dragRef.current = {
      id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startElemX: elem.x,
      startElemY: elem.y,
      savedHistory: false,
    };
  };

  const selectedElem = elements.find((e) => e.id === selectedId) ?? null;
  const wrapSrc = getWrapImagePath(wrapStyle, wrapColor);

  return (
    /*
     * Outer wrapper: overflow VISIBLE so FlowerToolbar can peek above the
     * canvas boundary when a flower is near the top edge.
     */
    <div
      className="relative select-none"
      style={{ width: CANVAS_W, height: CANVAS_H }}
    >
      {/* ── Visual canvas (overflow hidden keeps wrap + blooms clipped) ── */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--paper)",
          backgroundImage:
            "radial-gradient(circle, rgba(44,26,14,0.11) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          boxShadow:
            "0 2px 0 rgba(255,255,255,0.6) inset, 0 6px 40px rgba(44,26,14,0.14)",
        }}
        onClick={() => deselect()}
      >
        {/* Wrap image — bottom-center, pointer-events none */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: WRAP_W, height: WRAP_H }}
        >
          <img
            src={wrapSrc}
            alt=""
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* Placed flowers */}
        {elements.map((elem) => (
          <PlacedFlower
            key={elem.id}
            elem={elem}
            isSelected={elem.id === selectedId}
            onPointerDown={handleFlowerMouseDown}
          />
        ))}

        {/* Live note overlay */}
        <AnimatePresence>
          {note && note.text.trim() && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                position: "absolute",
                bottom: 22,
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: "var(--font-petit-formal)",
                fontSize: 17,
                lineHeight: 1.5,
                color: note.color,
                padding: "0 28px",
                pointerEvents: "none",
              }}
            >
              {note.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FlowerToolbar — outside overflow:hidden so it can go above canvas ── */}
      <AnimatePresence>
        {selectedElem && <FlowerToolbar elem={selectedElem} />}
      </AnimatePresence>
    </div>
  );
}
