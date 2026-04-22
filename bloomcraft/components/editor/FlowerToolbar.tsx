"use client";

import { motion } from "framer-motion";
import Icon from "@/components/shared/Icon";
import { useBouquetStore, type FlowerElement } from "@/store/bouquetStore";

const CANVAS_W = 420;
const CANVAS_H = 520;
const TOOLBAR_W = 232;
const TOOLBAR_H = 38;
const FLOWER_BASE_PX = 88; // base rendered height before scale

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

interface Props {
  elem: FlowerElement;
}

export default function FlowerToolbar({ elem }: Props) {
  const { updateFlower, duplicateFlower, removeFlower } = useBouquetStore();

  const xPx = (elem.x / 100) * CANVAS_W;
  const yPx = (elem.y / 100) * CANVAS_H;
  const flowerHalfH = (FLOWER_BASE_PX * elem.scale) / 2;

  const left = clamp(xPx - TOOLBAR_W / 2, 4, CANVAS_W - TOOLBAR_W - 4);
  const top  = yPx - flowerHalfH - TOOLBAR_H - 10;

  const rotate = (delta: number) =>
    updateFlower(elem.id, { rotation: elem.rotation + delta });

  const rescale = (delta: number) =>
    updateFlower(elem.id, { scale: clamp(elem.scale + delta, 0.3, 2.2) });

  const BUTTONS: { icon: Parameters<typeof Icon>[0]["name"]; action: () => void; title: string }[] = [
    { icon: "rotateLeft",  action: () => rotate(-15),       title: "Rotate left" },
    { icon: "rotateRight", action: () => rotate(+15),       title: "Rotate right" },
    { icon: "minus",       action: () => rescale(-0.14),    title: "Shrink" },
    { icon: "plus",        action: () => rescale(+0.14),    title: "Grow" },
    { icon: "copy",        action: () => duplicateFlower(elem.id), title: "Duplicate" },
    { icon: "trash",       action: () => removeFlower(elem.id),    title: "Remove" },
  ];

  return (
    <motion.div
      key="flower-toolbar"
      initial={{ opacity: 0, scale: 0.82, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.82, y: 5 }}
      transition={{ type: "spring", stiffness: 440, damping: 30 }}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        left,
        top,
        width: TOOLBAR_W,
        height: TOOLBAR_H,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderRadius: 999,
        padding: "0 8px",
        backgroundColor: "var(--brown-dark)",
        boxShadow: "0 4px 20px rgba(44,26,14,0.35)",
      }}
    >
      {BUTTONS.map(({ icon, action, title }) => (
        <button
          key={icon}
          title={title}
          onClick={(e) => { e.stopPropagation(); action(); }}
          style={{
            width: 34,
            height: 30,
            borderRadius: 6,
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 120ms",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.12)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "transparent")
          }
        >
          <Icon name={icon} size={14} strokeWidth={1.7} />
        </button>
      ))}
    </motion.div>
  );
}
