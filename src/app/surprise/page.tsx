"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shuffle, Pencil, Share2 } from "lucide-react";
import Image from "next/image";
import { useBouquetStore, setSkipNextReset } from "@/store/bouquetStore";
import { FLOWERS, getFlowerById } from "@/lib/flowers";
import { WRAPS, WRAP_COLORS, getWrapImagePath } from "@/lib/wraps";
import type { WrapColor } from "@/store/bouquetStore";
import { buildBouquetShareUrl, shareOrCopy } from "@/lib/share";
import PaperGrain from "@/components/landing/PaperGrain";

// Canvas dimensions (matches editor)
const CANVAS_W    = 420;
const CANVAS_H    = 520;
const WRAP_W      = 340;
const WRAP_H      = 460;
const FLOWER_SIZE = 88;

// Stage display dimensions
const STAGE_DISPLAY_W = 400;

// Compact staggered dome — every nearest-neighbour is ≥50px apart so each
// flower stays at least 50% unobscured (88px flower, ~44px radius).
// Rows offset horizontally so no flower sits directly above another.
//   Row 1 (front): x=137, 192, 250  — canvas y=188 (36%)
//   Row 2 (mid):   x=165, 228        — canvas y=130 (25%), staggered between R1
//   Row 3 (back):  x=142, 192, 245  — canvas y=80  (15%), staggered between R2
// All within clamp [22%,78%] × [5%,55%].
const WRAP_CX_PX  = 210;
const WRAP_TOP_PX =  60;

const FLOWER_SLOTS = [
  { xOff: -33, yOff: 128, scale: 1.00, rotation:   0 }, // R1-center (177, 188)
  { xOff: -88, yOff: 118, scale: 0.96, rotation: -10 }, // R1-left   (122, 178)
  { xOff:  25, yOff: 118, scale: 0.96, rotation:  10 }, // R1-right  (235, 178)
  { xOff: -60, yOff:  70, scale: 0.92, rotation:  -6 }, // R2-left   (150, 130)
  { xOff:   3, yOff:  70, scale: 0.92, rotation:   5 }, // R2-right  (213, 130)
  { xOff: -33, yOff:  28, scale: 0.88, rotation:   2 }, // R3-center (177, 88)
  { xOff: -83, yOff:  20, scale: 0.86, rotation:  -7 }, // R3-left   (127, 80)
  { xOff:  20, yOff:  20, scale: 0.86, rotation:   8 }, // R3-right  (230, 80)
];

// Decorative floating petals
const PETALS = [
  { left: "8%",  top: "22%", w: 22, h: 13, color: "#C4756B", opacity: 0.10, rotate: -20, delay: 0.8 },
  { left: "84%", top: "35%", w: 18, h: 11, color: "#E8A0AA", opacity: 0.11, rotate:  15, delay: 1.0 },
  { left: "76%", top: "72%", w: 20, h: 12, color: "#C4756B", opacity: 0.09, rotate: -30, delay: 1.2 },
  { left: "14%", top: "65%", w: 16, h: 10, color: "#E8B8BC", opacity: 0.10, rotate:  10, delay: 0.9 },
  { left: "50%", top: "90%", w: 19, h: 11, color: "#D4B0A0", opacity: 0.10, rotate: -12, delay: 1.1 },
  { left: "91%", top: "14%", w: 17, h: 10, color: "#E8A0AA", opacity: 0.09, rotate:  25, delay: 1.3 },
];

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

interface FlowerPos {
  x: number; y: number; scale: number; rotation: number;
}

interface SurpriseState {
  wrapStyle: number;
  wrapColor: WrapColor;
  flowerIds: string[];
  positions: FlowerPos[];
}

function buildSurprise(): SurpriseState {
  // Exclude style 5 (Tropical Fan)
  const validWraps = WRAPS.filter(w => w.id !== 5);
  const wrapStyle = validWraps[Math.floor(Math.random() * validWraps.length)].id;
  const wrapColor = WRAP_COLORS[Math.floor(Math.random() * WRAP_COLORS.length)].id;
  const count = 4 + Math.floor(Math.random() * 4); // 4–7 flowers

  const rawFlowerIds = Array.from({ length: count }, () =>
    FLOWERS[Math.floor(Math.random() * FLOWERS.length)].id
  );

  const combined = rawFlowerIds.map((id, i) => {
    const slot = FLOWER_SLOTS[i] ?? FLOWER_SLOTS[FLOWER_SLOTS.length - 1];
    const xPx = WRAP_CX_PX + slot.xOff + (Math.random() - 0.5) * 6;
    const yPx = WRAP_TOP_PX + slot.yOff + (Math.random() - 0.5) * 4;
    return {
      id,
      pos: {
        x:        clamp(xPx / 420 * 100, 22, 78),
        y:        clamp(yPx / 520 * 100,  5, 55),
        scale:    clamp(slot.scale    + (Math.random() - 0.5) * 0.04, 0.78, 1.15),
        rotation: clamp(slot.rotation + (Math.random() - 0.5) * 3,   -20,   20),
      },
    };
  });
  // Sort ascending by y: back flowers (smaller y) first → lower zIndex = behind
  combined.sort((a, b) => a.pos.y - b.pos.y);

  return {
    wrapStyle,
    wrapColor,
    flowerIds: combined.map(c => c.id),
    positions: combined.map(c => c.pos),
  };
}

function formatSubtitle(flowerIds: string[], wrapColor: WrapColor, wrapStyle: number): string {
  const seenIds = new Set<string>();
  const uniqueNames: string[] = [];
  for (const id of flowerIds) {
    if (!seenIds.has(id)) {
      seenIds.add(id);
      const f = getFlowerById(id);
      if (f) uniqueNames.push(f.name);
    }
  }
  const flowerPart =
    uniqueNames.length === 0 ? "beautiful flowers"
    : uniqueNames.length === 1 ? uniqueNames[0]
    : uniqueNames.length === 2 ? `${uniqueNames[0]} & ${uniqueNames[1]}`
    : `${uniqueNames.slice(0, -1).join(", ")} & ${uniqueNames[uniqueNames.length - 1]}`;

  const colorLabel = WRAP_COLORS.find(c => c.id === wrapColor)?.label.toLowerCase() ?? wrapColor;
  const wrapName   = WRAPS.find(w => w.id === wrapStyle)?.name ?? "";
  return `${flowerPart}, wrapped in ${colorLabel} ${wrapName}`;
}

export default function SurprisePage() {
  const router     = useRouter();
  const loadPreset = useBouquetStore(s => s.loadPreset);

  const [rollKey,   setRollKey]   = useState(0);
  const [surprise,  setSurprise]  = useState<SurpriseState | null>(null);
  const [toastMsg,  setToastMsg]  = useState<string | null>(null);
  const [hovBack,   setHovBack]   = useState(false);
  const [viewportW, setViewportW] = useState(1024);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const update = () => setViewportW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const mobile = viewportW <= 640;
  const stageDisplayW = mobile
    ? Math.min(280, Math.max(240, viewportW - 64))
    : Math.min(STAGE_DISPLAY_W, Math.max(290, viewportW - 32));
  const stageScale = stageDisplayW / CANVAS_W;
  const stageH = Math.round(CANVAS_H * stageScale);

  const roll = useCallback(() => {
    setSurprise(buildSurprise());
    setRollKey(k => k + 1);
  }, []);

  useEffect(() => { roll(); }, [roll]);

  const handleEdit = () => {
    if (!surprise) return;
    loadPreset({
      wrapStyle: surprise.wrapStyle,
      wrapColor: surprise.wrapColor,
      elements: surprise.flowerIds.map((flowerId, i) => ({
        flowerId,
        x:        surprise.positions[i]?.x        ?? 50,
        y:        surprise.positions[i]?.y        ?? 40,
        scale:    surprise.positions[i]?.scale    ?? 0.9,
        rotation: surprise.positions[i]?.rotation ?? 0,
      })),
    });
    setSkipNextReset(true);
    router.push("/editor");
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleShare = async () => {
    if (!surprise) return;
    setIsSharing(true);
    try {
      const url = buildBouquetShareUrl(
        surprise.wrapStyle,
        surprise.wrapColor,
        surprise.flowerIds.map((flowerId, zIndex) => {
          const pos = surprise.positions[zIndex];
          return { flowerId, x: pos?.x ?? 50, y: pos?.y ?? 40, scale: pos?.scale ?? 0.9, rotation: pos?.rotation ?? 0, zIndex };
        }),
        null,
      );
      const result = await shareOrCopy(url);
      if (result === "copied") showToast("Link copied!");
      else if (result === "failed") showToast("Could not share");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--lnd-bg)",
      display: "flex", flexDirection: "column",
      overflow: "hidden", position: "relative",
    }}>

      {/* ── Shared styles ── */}
      <style>{`
        .sp-btn-outlined {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 22px; border-radius: 8px;
          border: 1px solid #C8BFB4; background: #EDE6DA;
          font-family: var(--font-cormorant); font-size: 15px; color: #3D2B1F;
          cursor: pointer; transition: background 150ms;
        }
        .sp-btn-outlined:hover { background: #E0D8CE; }
        .sp-btn-filled {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 22px; border-radius: 8px;
          border: none; background: #963310;
          font-family: var(--font-cormorant); font-size: 15px; color: #FFF8F0;
          cursor: pointer; transition: background 150ms;
        }
        .sp-btn-filled:hover { background: #7A2A0D; }
        @media (max-width: 640px) {
          .sp-btn-outlined, .sp-btn-filled {
            padding: 8px 16px; font-size: 14px; gap: 5px;
          }
        }
        .sp-up-0 { animation: spFadeUp 0.6s ease both 0s; }
        .sp-up-1 { animation: spFadeUp 0.6s ease both 0.5s; }
        @keyframes spFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .sp-back-label { display: none; }
        }
      `}</style>

      {/* ── Botanical watermark decorations (behind everything) ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/backgrounds/watermark-hero.png"
        alt="" aria-hidden="true"
        style={{
          position: "absolute", right: "-5%", top: "15%",
          width: 300, height: "auto",
          opacity: 0.07, mixBlendMode: "multiply",
          pointerEvents: "none", userSelect: "none", zIndex: 0,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/backgrounds/watermark-footer.png"
        alt="" aria-hidden="true"
        style={{
          position: "absolute", left: -30, bottom: -30,
          width: 260, height: "auto",
          opacity: 0.07, mixBlendMode: "multiply",
          pointerEvents: "none", userSelect: "none", zIndex: 0,
        }}
      />

      {/* ── Floating botanical petals ── */}
      {PETALS.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: p.opacity, scale: 1 }}
          transition={{ delay: p.delay, duration: 0.8, ease: "easeOut" }}
          style={{
            position: "fixed",
            left: p.left, top: p.top,
            width: p.w, height: p.h,
            borderRadius: "50%",
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      {/* ── Header ── */}
      <header style={{
        flexShrink: 0, height: 56,
        display: "flex", alignItems: "center",
        padding: mobile ? "0 14px" : "0 24px",
        borderBottom: "0.5px solid #D8D0C4",
        backgroundColor: "var(--lnd-bg)",
        position: "relative", zIndex: 10,
      }}>
        <button
          onClick={() => router.push("/")}
          onMouseEnter={() => setHovBack(true)}
          onMouseLeave={() => setHovBack(false)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "none", border: "none", padding: 0, cursor: "pointer",
            color: hovBack ? "#6B5E53" : "#3D2B1F",
            transition: "color 150ms",
          }}
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
          <span className="sp-back-label" style={{ fontFamily: "var(--font-cormorant)", fontSize: 14 }}>Back</span>
        </button>

        {/* Logo — centered */}
        <button
          onClick={() => router.push("/")}
          aria-label="Go to home"
          style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center",
          }}
        >
          <Image
            src="/preloader/logo.svg"
            alt="BloomCraft"
            width={36} height={36}
            style={{ objectFit: "contain", display: "block" }}
          />
        </button>
      </header>

      {/* ── Main content ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: mobile ? "flex-start" : "center",
        padding: mobile ? "10px 12px 12px" : "8px 24px 32px",
        position: "relative", zIndex: 1,
      }}>

        {/* Title block */}
        <div className="sp-up-0" style={{ textAlign: "center", marginBottom: mobile ? 6 : 7 }}>
          <p style={{
            fontFamily: "var(--font-cormorant)", fontStyle: "italic",
            fontSize: mobile ? 16 : 16, color: "#C4756B", margin: mobile ? "0 0 4px" : "0 0 8px",
          }}>
            just for you
          </p>
          <h1 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: mobile ? "clamp(28px, 7vw, 36px)" : "clamp(36px, 5vw, 52px)",
            fontWeight: 400, color: "#3D2B1F",
            lineHeight: 1.1, margin: mobile ? "0 0 6px" : "0 0 12px",
          }}>
            A little <em style={{ fontStyle: "italic" }}>surprise</em>
          </h1>
          {surprise && (
            <p style={{
              fontFamily: "var(--font-cormorant)", fontStyle: "italic",
              fontSize: mobile ? 13 : 15, color: "#6B5E53", margin: 0,
            }}>
              {formatSubtitle(surprise.flowerIds, surprise.wrapColor, surprise.wrapStyle)}
            </p>
          )}
        </div>

        {/* Bouquet stage */}
        <div style={{ position: "relative", marginBottom: mobile ? 42 : 36 }}>
          {/* Elliptical shadow */}
          <div style={{
            position: "absolute", bottom: 6,
            left: "50%", transform: "translateX(-50%)",
            width: Math.round(STAGE_DISPLAY_W * 0.65),
            height: 16,
            background: "radial-gradient(ellipse at center, rgba(61,43,31,0.16) 0%, transparent 70%)",
            borderRadius: "50%",
            zIndex: 0,
          }} />

          <AnimatePresence mode="wait">
            {surprise && (
              <motion.div
                key={rollKey}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                style={{ position: "relative", width: stageDisplayW, height: stageH, zIndex: 1 }}
              >
                {/* Inner canvas — full 420×520 coordinate space scaled to stage size */}
                <div style={{
                  position: "absolute", top: 0,
                  left: `calc(50% - ${CANVAS_W / 2}px)`,
                  width: CANVAS_W, height: CANVAS_H,
                  transform: `scale(${stageScale})`,
                  transformOrigin: "top center",
                  pointerEvents: "none",
                }}>
                  {/* Flowers — staggered spring entrance */}
                  {surprise.flowerIds.map((flowerId, i) => {
                    const flower = getFlowerById(flowerId);
                    if (!flower) return null;
                    const pos = surprise.positions[i];
                    if (!pos) return null;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: -18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.25 + i * 0.08 }}
                        style={{
                          position: "absolute",
                          left: `${pos.x}%`,
                          top:  `${pos.y}%`,
                          transform: "translate(-50%, -50%)",
                          zIndex: i + 2,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={flower.imagePath}
                          alt=""
                          draggable={false}
                          style={{
                            width:  FLOWER_SIZE,
                            height: FLOWER_SIZE,
                            objectFit: "contain",
                            transform: `rotate(${pos.rotation}deg) scale(${pos.scale})`,
                            display: "block",
                          }}
                        />
                      </motion.div>
                    );
                  })}

                  {/* Wrap — sits above flowers in z-order to overlap their stems */}
                  <div style={{
                    position: "absolute", bottom: 0,
                    left: "50%", transform: "translateX(-50%)",
                    width: WRAP_W, height: WRAP_H,
                    zIndex: 1,
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getWrapImagePath(surprise.wrapStyle, surprise.wrapColor)}
                      alt=""
                      draggable={false}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="sp-up-1" style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="sp-btn-outlined" onClick={roll}>
            <Shuffle size={14} strokeWidth={1.8} />
            Re-roll
          </button>
          <button className="sp-btn-outlined" onClick={handleEdit}>
            <Pencil size={14} strokeWidth={1.8} />
            Edit this
          </button>
          <button className="sp-btn-filled" onClick={handleShare} disabled={isSharing}
            style={{ opacity: isSharing ? 0.75 : undefined, cursor: isSharing ? "default" : undefined, whiteSpace: "nowrap" }}>
            {isSharing ? "Preparing link…" : <><Share2 size={14} strokeWidth={1.8} />Share</>}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          backgroundColor: "#3D2B1F", color: "rgba(255,255,255,0.92)",
          fontFamily: "var(--font-cormorant)", fontSize: 14,
          padding: "10px 22px", borderRadius: 99,
          boxShadow: "0 4px 24px rgba(44,31,20,0.30)",
          zIndex: 9999, pointerEvents: "none",
        }}>
          {toastMsg}
        </div>
      )}

      <PaperGrain />
    </div>
  );
}
