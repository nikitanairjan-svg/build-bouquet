"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { getWrapImagePath } from "@/lib/wraps";
import { getFlowerById } from "@/lib/flowers";
import PaperGrain from "@/components/landing/PaperGrain";

// ── Confetti burst ────────────────────────────────────────────────
const CONFETTI_COLORS = [
  "#963310", "#C4756B", "#E8A0A8", "#C8B0E8",
  "#6A9850", "#C4A882", "#F5C4A0", "#D4B8E0",
];

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 110 }, (_, i) => ({
      x:    Math.random() * canvas.width,
      y:    -16 - Math.random() * 120,
      vx:   (Math.random() - 0.5) * 3,
      vy:   1.8 + Math.random() * 3.2,
      rot:  Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.18,
      w:    5 + Math.random() * 7,
      h:    2.5 + Math.random() * 3,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    }));

    const DURATION = 3200;
    let start: number | null = null;
    let raf: number;

    const draw = (t: number) => {
      if (!start) start = t;
      const elapsed  = t - start;
      const progress = Math.min(elapsed / DURATION, 1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alpha = progress > 0.65 ? 1 - (progress - 0.65) / 0.35 : 1;
      for (const p of particles) {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.06;
        p.vx += Math.sin(t * 0.0008 + p.y * 0.012) * 0.04;
        p.rot += p.vrot;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (progress < 1) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 150 }}
    />
  );
}

// ── Canvas constants (match editor) ──────────────────────────────
const CANVAS_W    = 420;
const CANVAS_H    = 520;
const WRAP_W      = 340;
const WRAP_H      = 460;
const FLOWER_SIZE = 88;

const DISPLAY_W_DESKTOP = 410;

// ── Stamp / perforated-edge mask ──────────────────────────────────
const STAMP_MASK = [
  "radial-gradient(circle at 50% 0%,   transparent 7px, black 7.5px) 0 0 / 18px 100% repeat-x",
  "radial-gradient(circle at 50% 100%, transparent 7px, black 7.5px) 0 0 / 18px 100% repeat-x",
  "radial-gradient(circle at 0%  50%,  transparent 7px, black 7.5px) 0 0 / 100% 18px repeat-y",
  "radial-gradient(circle at 100% 50%, transparent 7px, black 7.5px) 0 0 / 100% 18px repeat-y",
].join(", ");

const STAMP_MASK_STYLE = {
  WebkitMask: STAMP_MASK,
  WebkitMaskComposite: "source-in",
  mask: STAMP_MASK,
  maskComposite: "intersect",
} as React.CSSProperties;

// ── Payload types ─────────────────────────────────────────────────
interface FlowerEl { f: string; x: number; y: number; sc: number; r: number; z: number; }
interface NoteData  { t: string; c: string; }
interface BouquetPayload { s: number; c: string; e: FlowerEl[]; n?: NoteData | null; }

// ── URL decoding ──────────────────────────────────────────────────
function decodeBouquet(search: string): BouquetPayload | null {
  try {
    const params = new URLSearchParams(search);
    const raw = params.get("data");
    if (!raw) return null;
    const binary = atob(decodeURIComponent(raw));
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json    = new TextDecoder().decode(bytes);
    const payload = JSON.parse(json) as BouquetPayload;
    if (!Array.isArray(payload.e) || payload.e.length === 0) return null;
    return payload;
  } catch { return null; }
}

// ── Decorative petals ─────────────────────────────────────────────
const PETALS = [
  { left: "6%",  top: "18%", w: 22, h: 13, color: "#C4756B", opacity: 0.09, rotate: -20, delay: 1.0 },
  { left: "86%", top: "30%", w: 18, h: 11, color: "#E8A0AA", opacity: 0.10, rotate:  15, delay: 1.2 },
  { left: "78%", top: "70%", w: 20, h: 12, color: "#C4756B", opacity: 0.08, rotate: -30, delay: 1.4 },
  { left: "12%", top: "62%", w: 16, h: 10, color: "#E8B8BC", opacity: 0.09, rotate:  10, delay: 1.1 },
  { left: "48%", top: "92%", w: 19, h: 11, color: "#D4B0A0", opacity: 0.09, rotate: -12, delay: 1.3 },
  { left: "92%", top: "12%", w: 17, h: 10, color: "#E8A0AA", opacity: 0.08, rotate:  25, delay: 1.5 },
];

// ── Note modal popup (same design as canvas preview) ─────────────
function NoteModal({ note, onClose }: { note: NoteData; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(61,43,31,0.40)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", maxWidth: 380, width: "90%" }}>

        {/* Kraft envelope */}
        <div style={{
          position: "absolute",
          top: -28, left: -14, right: -14, bottom: -8,
          backgroundColor: "#C4A872",
          borderRadius: 2,
          transform: "rotate(3deg)",
          transformOrigin: "center bottom",
          boxShadow: "0 4px 16px rgba(61,43,31,0.22)",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60,
            backgroundColor: "#B89860", clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%",
            background: "linear-gradient(to top right, #C0A06A 50%, transparent 50%)", opacity: 0.4 }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%",
            background: "linear-gradient(to top left, #C0A06A 50%, transparent 50%)", opacity: 0.4 }} />
        </div>

        {/* Scalloped letter paper */}
        <div style={{
          position: "relative", zIndex: 1,
          backgroundColor: "#FAF6F0",
          transform: "rotate(-2deg)",
          transformOrigin: "center bottom",
          padding: "30px 30px 28px",
          ...STAMP_MASK_STYLE,
        }}>
          {/* Close */}
          <button onClick={onClose}
            style={{
              position: "absolute", top: 14, right: 14,
              width: 24, height: 24, borderRadius: "50%",
              border: "none", background: "rgba(61,43,31,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#8B7E72", fontSize: 14, lineHeight: 1,
              transition: "background 150ms, color 150ms",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(61,43,31,0.16)";
              (e.currentTarget as HTMLElement).style.color = "#3D2B1F";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(61,43,31,0.08)";
              (e.currentTarget as HTMLElement).style.color = "#8B7E72";
            }}
            aria-label="Close">
            ×
          </button>

          <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic",
            fontSize: 17, color: "#3D2B1F", textAlign: "center", margin: "0 0 18px" }}>
            A note for you
          </p>
          <p style={{
            fontFamily: "var(--font-cormorant)", fontStyle: "italic",
            fontSize: 14, lineHeight: "26px", color: "#6B5E53",
            margin: 0,
            backgroundImage: "repeating-linear-gradient(transparent, transparent 25px, rgba(61,43,31,0.07) 25px, rgba(61,43,31,0.07) 26px)",
            backgroundPosition: "0 2px",
            whiteSpace: "pre-wrap",
          }}>
            {note.t}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────
function ErrorState() {
  const router = useRouter();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", padding: "40px 24px",
      textAlign: "center", backgroundColor: "var(--lnd-bg)" }}>
      <Image src="/preloader/logo.svg" alt="BloomCraft" width={40} height={40}
        style={{ objectFit: "contain", marginBottom: 28 }} />
      <h1 style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic",
        fontSize: 22, fontWeight: 400, color: "#3D2B1F", margin: "0 0 10px" }}>
        This bouquet couldn&apos;t be found
      </h1>
      <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic",
        fontSize: 14, color: "#A89E93", margin: "0 0 32px", maxWidth: 280 }}>
        The link may have expired or been entered incorrectly
      </p>
      <button onClick={() => router.push("/")}
        style={{ display: "inline-flex", alignItems: "center", gap: 6,
          padding: "12px 32px", borderRadius: 8, border: "none", background: "#963310",
          fontFamily: "var(--font-cormorant)", fontSize: 14, color: "#FFF8F0",
          cursor: "pointer", transition: "opacity 150ms" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
        Create your own bouquet →
      </button>
    </div>
  );
}

// ── Main receiver ─────────────────────────────────────────────────
export default function BouquetReceiver() {
  const router = useRouter();
  const [bouquet,  setBouquet]  = useState<BouquetPayload | null | "error">(null);
  const [mounted,  setMounted]  = useState(false);
  const [noteOpen,      setNoteOpen]      = useState(false);
  const [noteEverOpened, setNoteEverOpened] = useState(false);
  const [viewportW, setViewportW] = useState(1024);

  useEffect(() => {
    setMounted(true);
    const decoded = decodeBouquet(window.location.search);
    setBouquet(decoded ?? "error");
    const update = () => setViewportW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!mounted)            return null;
  if (bouquet === "error") return <ErrorState />;
  if (!bouquet)            return null;

  const mobile = viewportW <= 640;

  // On mobile, shrink the bouquet so it fits alongside logo + text + button
  const displayW     = mobile ? Math.min(300, viewportW - 50) : DISPLAY_W_DESKTOP;
  const displayScale = displayW / CANVAS_W;
  const displayH     = Math.round(CANVAS_H * displayScale);

  const wrapColor = bouquet.c as "brown" | "pink" | "lilac";
  const wrapSrc   = getWrapImagePath(bouquet.s, wrapColor);
  const sorted    = [...bouquet.e].sort((a, b) => a.z - b.z);
  const hasNote   = !!bouquet.n?.t?.trim();

  return (
    <>
      <Confetti />
      <div style={{
        minHeight: "100vh",
        backgroundColor: "var(--lnd-bg)",
        display: "flex", flexDirection: "column",
        alignItems: "center",
        position: "relative", overflowX: "hidden",
      }}>

        {/* ── Botanical watermarks ── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/backgrounds/watermark-hero.png" alt="" aria-hidden="true"
          style={{ position: "absolute", right: "-5%", top: "10%", width: 280, height: "auto",
            opacity: 0.07, mixBlendMode: "multiply", pointerEvents: "none", userSelect: "none", zIndex: 0 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/backgrounds/watermark-footer.png" alt="" aria-hidden="true"
          style={{ position: "absolute", left: -20, bottom: -20, width: 240, height: "auto",
            opacity: 0.07, mixBlendMode: "multiply", pointerEvents: "none", userSelect: "none", zIndex: 0 }} />

        {/* ── Floating petals ── */}
        {PETALS.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: p.opacity, scale: 1 }}
            transition={{ delay: p.delay, duration: 0.8, ease: "easeOut" }}
            style={{ position: "fixed", left: p.left, top: p.top, width: p.w, height: p.h,
              borderRadius: "50%", backgroundColor: p.color, transform: `rotate(${p.rotate}deg)`,
              pointerEvents: "none", zIndex: 0 }} />
        ))}

        {/* ── Content ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          padding: mobile ? "8px 24px 12px" : "12px 24px 12px", position: "relative", zIndex: 1, width: "100%" }}>

          {/* A. Logo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }} style={{ marginBottom: mobile ? 2 : 6 }}>
            <button onClick={() => router.push("/")} aria-label="Go to home"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              <Image src="/preloader/logo.svg" alt="BloomCraft"
                width={mobile ? 52 : 80} height={mobile ? 52 : 80}
                style={{ objectFit: "contain", display: "block" }} />
            </button>
          </motion.div>

          {/* B. Greeting */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            style={{ textAlign: "center", marginBottom: mobile ? 4 : 14 }}>
            <h1 style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic",
              fontSize: mobile ? 22 : 26, fontWeight: 400, color: "#3D2B1F", lineHeight: 1.2, margin: "0 0 3px" }}>
              This one&apos;s for you
            </h1>
            <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic",
              fontSize: mobile ? 14 : 16, color: "#4A3B30", margin: 0 }}>
              A digital bouquet, handcrafted with care
            </p>
          </motion.div>

          {/* C. Bouquet — centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.6 }}
            style={{ position: "relative", marginBottom: mobile ? 6 : 14 }}
          >
            {/* Elliptical shadow */}
            <div style={{
              position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)",
              width: Math.round(displayW * 0.55), height: 16,
              background: "radial-gradient(ellipse at center, rgba(61,43,31,0.16) 0%, transparent 70%)",
              borderRadius: "50%", zIndex: 0,
            }} />

            {/* Scaled canvas */}
            <div style={{ position: "relative", width: displayW, height: displayH, zIndex: 1 }}>
              <div style={{
                position: "absolute", top: 0,
                left: `calc(50% - ${CANVAS_W / 2}px)`,
                width: CANVAS_W, height: CANVAS_H,
                transform: `scale(${displayScale})`,
                transformOrigin: "top center",
                pointerEvents: "none",
              }}>
                {sorted.map((el, i) => {
                  const flower = getFlowerById(el.f);
                  if (!flower) return null;
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={flower.imagePath} alt="" draggable={false}
                      style={{
                        position: "absolute", left: `${el.x}%`, top: `${el.y}%`,
                        width: FLOWER_SIZE, height: FLOWER_SIZE, objectFit: "contain",
                        transform: `translate(-50%, -50%) rotate(${el.r}deg) scale(${el.sc})`,
                        zIndex: el.z + 2, pointerEvents: "none",
                      }} />
                  );
                })}
                <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                  width: WRAP_W, height: WRAP_H, zIndex: 1 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={wrapSrc} alt="" draggable={false}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              </div>

              {/* Envelope button — bottom-right of bouquet, bounces until opened */}
              {hasNote && (
                <motion.div
                  style={{ position: "absolute", bottom: 52, right: 18, zIndex: 20 }}
                  animate={noteEverOpened ? { y: 0 } : { y: [0, -9, 0] }}
                  transition={noteEverOpened ? {} : {
                    repeat: Infinity,
                    duration: 0.7,
                    ease: "easeInOut",
                    repeatDelay: 0.9,
                  }}
                >
                <button
                  onClick={() => { setNoteOpen(true); setNoteEverOpened(true); }}
                  aria-label="Open note"
                  style={{
                    background: "none", border: "none", padding: 0, cursor: "pointer",
                    filter: "drop-shadow(0 4px 12px rgba(44,31,20,0.28))",
                    transition: "filter 150ms",
                    display: "block",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.filter = "drop-shadow(0 8px 18px rgba(44,31,20,0.36))";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.filter = "drop-shadow(0 4px 12px rgba(44,31,20,0.28))";
                  }}
                >
                  <svg viewBox="0 0 100 66" width={110} height={73} style={{ display: "block" }}>
                    <rect x="0.5" y="0.5" width="99" height="65" rx="3" fill="#F5EFE4" stroke="#C4B8A8" strokeWidth="1.5" />
                    <polygon points="0.5,65.5 99.5,65.5 50,38" fill="#EAE2D4" stroke="#D0C8B8" strokeWidth="0.5" />
                    <polygon points="0.5,0.5 0.5,65.5 50,38"  fill="#EDE6D8" stroke="#D0C8B8" strokeWidth="0.5" />
                    <polygon points="99.5,0.5 99.5,65.5 50,38" fill="#EDE6D8" stroke="#D0C8B8" strokeWidth="0.5" />
                    <polygon points="0.5,0.5 99.5,0.5 50,32" fill="#E3DAC8" stroke="#D0C8B8" strokeWidth="0.5" />
                    <circle cx="50" cy="38" r="11" fill="#963310" />
                    <image href="/preloader/logo.svg" x="37" y="25" width="26" height="26"
                      clipPath="url(#rcv-seal-clip)" preserveAspectRatio="xMidYMid meet" />
                    <defs><clipPath id="rcv-seal-clip"><circle cx="50" cy="38" r="11" /></clipPath></defs>
                    <circle cx="50" cy="38" r="11" fill="none" stroke="rgba(255,248,240,0.35)" strokeWidth="1" />
                  </svg>
                </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* D. CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 1.5 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <button onClick={() => router.push("/")}
              style={{ display: "inline-flex", alignItems: "center",
                padding: "10px 28px", borderRadius: 8, border: "none", background: "#963310",
                fontFamily: "var(--font-cormorant)", fontSize: 14, color: "#FFF8F0",
                cursor: "pointer", transition: "opacity 150ms",
                boxShadow: "0 4px 14px rgba(150,51,16,0.28)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
              Create your own bouquet
            </button>
            <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic",
              fontSize: 11, color: "#8B7E72", margin: 0 }}>
              Powered by BloomCraft
            </p>
          </motion.div>
        </div>

        <PaperGrain />
      </div>

      {/* Note modal — renders outside the main div so it sits above everything */}
      {hasNote && noteOpen && (
        <NoteModal note={bouquet.n!} onClose={() => setNoteOpen(false)} />
      )}
    </>
  );
}
