"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Share2 } from "lucide-react";
import { useBouquetStore, setSkipNextReset, type FlowerElement } from "@/store/bouquetStore";
import { getWrapImagePath } from "@/lib/wraps";
import { getFlowerById } from "@/lib/flowers";
import { buildBouquetShareUrl, shareOrCopy } from "@/lib/share";
import PaperGrain from "@/components/landing/PaperGrain";

// ── Confetti burst — plays once on mount ────────────────────────
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

// ── Canvas dimensions (internal resolution) ─────────────────────
const CANVAS_W    = 420;
const CANVAS_H    = 520;
const WRAP_W      = 340;
const WRAP_H      = 460;
const FLOWER_SIZE = 88;

const PREVIEW_W = 380;

// ── Envelope note — exact same design as canvas NoteCard ────────
function EnvelopeNote({ onEdit }: { onEdit: () => void }) {
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
        bottom: 55, right: 22,
        transform: `rotate(4deg) translateY(${hov ? -4 : 0}px)`,
        zIndex: 50, cursor: "pointer",
        filter: hov
          ? "drop-shadow(0 10px 22px rgba(44,31,20,0.38))"
          : "drop-shadow(0 4px 12px rgba(44,31,20,0.28)) drop-shadow(0 1px 3px rgba(44,31,20,0.18))",
        transition: "transform 160ms ease, filter 160ms ease",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }} aria-label="Note">
        <defs>
          <clipPath id="preview-seal-clip">
            <circle cx={MX} cy={MY} r="13" />
          </clipPath>
        </defs>
        <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="2"
          fill="#F5EFE4" stroke="#C4B8A8" strokeWidth="1.5" />
        <polygon points={`0.5,0.5 0.5,${H - 0.5} ${MX},${MY}`}
          fill="#EDE6D8" stroke="#D0C8B8" strokeWidth="0.4" strokeLinejoin="round" />
        <polygon points={`${W - 0.5},0.5 ${W - 0.5},${H - 0.5} ${MX},${MY}`}
          fill="#EDE6D8" stroke="#D0C8B8" strokeWidth="0.4" strokeLinejoin="round" />
        <polygon points={`0.5,${H - 0.5} ${W - 0.5},${H - 0.5} ${MX},${MY}`}
          fill="#EAE2D4" stroke="#D0C8B8" strokeWidth="0.4" strokeLinejoin="round" />
        <polygon points={`0.5,0.5 ${W - 0.5},0.5 ${MX},${MY}`}
          fill="#E3DAC8" stroke="#D0C8B8" strokeWidth="0.4" strokeLinejoin="round" />
        <circle cx={MX} cy={MY} r="13" fill="#963310" />
        <image href="/preloader/logo.svg" x={MX - 13} y={MY - 13}
          width="26" height="26" clipPath="url(#preview-seal-clip)" preserveAspectRatio="xMidYMid meet" />
        <circle cx={MX} cy={MY} r="13" fill="none" stroke="rgba(255,248,240,0.35)" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ── Read-only note — same visual as NoteModal, no inputs/buttons ─
function NoteReadModal({ note, onClose }: { note: { text: string; color: string }; onClose: () => void }) {
  const stampMask = [
    "radial-gradient(circle at 50% 0%,   transparent 7px, black 7.5px) 0 0 / 18px 100% repeat-x",
    "radial-gradient(circle at 50% 100%, transparent 7px, black 7.5px) 0 0 / 18px 100% repeat-x",
    "radial-gradient(circle at 0%  50%,  transparent 7px, black 7.5px) 0 0 / 100% 18px repeat-y",
    "radial-gradient(circle at 100% 50%, transparent 7px, black 7.5px) 0 0 / 100% 18px repeat-y",
  ].join(", ");

  const stampMaskStyle = {
    WebkitMask: stampMask,
    WebkitMaskComposite: "source-in",
    mask: stampMask,
    maskComposite: "intersect",
  } as React.CSSProperties;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(61,43,31,0.40)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", maxWidth: 380, width: "90%" }}
      >
        {/* Layer 1: Kraft envelope */}
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
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 60,
            backgroundColor: "#B89860",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "45%",
            background: "linear-gradient(to top right, #C0A06A 50%, transparent 50%)",
            opacity: 0.4,
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "45%",
            background: "linear-gradient(to top left, #C0A06A 50%, transparent 50%)",
            opacity: 0.4,
          }} />
        </div>

        {/* Layer 2: Stationery letter */}
        <div style={{
          position: "relative", zIndex: 1,
          backgroundColor: "#FAF6F0",
          transform: "rotate(-2deg)",
          transformOrigin: "center bottom",
          padding: "30px 30px 28px",
          ...stampMaskStyle,
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 14, right: 14,
              width: 24, height: 24, borderRadius: "50%",
              border: "none", background: "rgba(61,43,31,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#8B7E72",
              fontSize: 14, lineHeight: 1,
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
            aria-label="Close"
          >
            ×
          </button>

          <p style={{
            fontFamily: "var(--font-cormorant)", fontStyle: "italic",
            fontSize: 17, color: "#3D2B1F",
            textAlign: "center", margin: "0 0 18px",
          }}>
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
            {note.text}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  const { elements, wrapStyle, wrapColor, note, reset } = useBouquetStore();
  const router = useRouter();
  const [toast,        setToast]        = useState<string | null>(null);
  const [showNote,     setShowNote]     = useState(false);
  const [hovBack,      setHovBack]      = useState(false);
  const [viewportW,    setViewportW]    = useState(1024);
  const [isSharing,    setIsSharing]    = useState(false);

  useEffect(() => {
    const update = () => setViewportW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const wrapSrc = getWrapImagePath(wrapStyle, wrapColor);
  const mobile = viewportW <= 640;
  const previewW = Math.min(PREVIEW_W, Math.max(290, viewportW - 32));
  const scale = previewW / CANVAS_W;
  const previewH = Math.round(CANVAS_H * scale);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const handleBack = () => {
    setSkipNextReset(true);
    router.push("/editor");
  };

  const handleGoHome = () => {
    reset();
    router.push("/");
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const url = buildBouquetShareUrl(wrapStyle, wrapColor, elements, note);
      const result = await shareOrCopy(url);
      if (result === "copied") showToast("Link copied!");
      else if (result === "failed") showToast("Could not share");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeInUp 0.55s ease both; }
        .fu-0 { animation-delay: 0s; }
        .fu-1 { animation-delay: 0.18s; }
        .fu-2 { animation-delay: 0.34s; }
        .fu-3 { animation-delay: 0.50s; }
        @media (max-width: 640px) {
          .preview-back-label { display: none; }
        }
      `}</style>

      <Confetti />

      <div style={{
        minHeight: "100vh",
        backgroundColor: "var(--lnd-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflowX: "hidden",
      }}>

        {/* ── Header ── */}
        <header style={{
          width: "100%",
          height: 56, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: mobile ? "0 14px" : "0 24px",
          borderBottom: "0.5px solid #D8D0C4",
          backgroundColor: "var(--lnd-bg)",
          position: "relative", zIndex: 2,
        }}>
          {/* Back button — left */}
          <button
            onClick={handleBack}
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
            <span className="preview-back-label" style={{ fontFamily: "var(--font-cormorant)", fontSize: 14 }}>Back</span>
          </button>

          {/* Logo — center, click goes home */}
          <button
            onClick={handleGoHome}
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
              width={36}
              height={36}
              style={{ objectFit: "contain", display: "block" }}
            />
          </button>

          {/* Actions — right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleShare}
              disabled={isSharing}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: mobile ? "7px 12px" : "7px 16px", borderRadius: 99,
                border: "none", backgroundColor: isSharing ? "#B85A30" : "#963310",
                fontFamily: "var(--font-cormorant)", fontSize: 14,
                color: "#FFF8F0", cursor: isSharing ? "default" : "pointer",
                boxShadow: "0 4px 14px rgba(150,51,16,0.28)",
                transition: "background 150ms, opacity 150ms",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { if (!isSharing) (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              {isSharing ? (
                "Preparing link…"
              ) : (
                <><Share2 size={13} strokeWidth={1.8} />Share</>
              )}
            </button>
          </div>
        </header>

        {/* ── Main content ── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: mobile ? "flex-start" : "center",
          padding: mobile ? "6px 12px 20px" : "40px 24px 60px",
          width: "100%",
          maxWidth: 520,
        }}>

          {/* Headline + subtitle */}
          <div className="fu fu-0" style={{ textAlign: "center", marginBottom: mobile ? 6 : 32 }}>
            <h1 style={{
              fontFamily: "var(--font-cormorant)", fontStyle: "italic",
              fontSize: mobile ? "clamp(22px, 5vw, 28px)" : "clamp(34px, 5vw, 48px)", fontWeight: 400,
              color: "var(--lnd-brown)", lineHeight: 1.15,
              margin: mobile ? "0 0 4px" : "0 0 10px",
            }}>
              Your bouquet is ready
            </h1>
            {!mobile && (
              <p style={{
                fontFamily: "var(--font-jost)",
                fontSize: 15, fontWeight: 400,
                color: "rgba(61,40,23,0.55)",
                lineHeight: 1.6, margin: 0,
              }}>
                Digitally crafted for your loved one.
              </p>
            )}
          </div>

          {/* Bouquet card */}
          <div
            className="fu fu-1"
            style={{
              position: "relative",
              width: previewW,
              height: previewH + 34,
              flexShrink: 0,
              borderRadius: 20,
              backgroundColor: "#F5F0E8",
              border: "0.5px solid rgba(200,188,172,0.45)",
              boxShadow: "0 8px 40px rgba(44,31,20,0.10), 0 1px 4px rgba(44,31,20,0.06)",
              zIndex: 2,
              overflow: "hidden",
            }}
          >
            {/* Inner canvas — full res, scaled down */}
            <div style={{
              position: "absolute", top: 0, left: 0,
              width: CANVAS_W, height: CANVAS_H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              overflow: "hidden",
            }}>
              {/* Wrap */}
              <div style={{
                position: "absolute", bottom: 0, left: "50%",
                transform: "translateX(-50%)",
                width: WRAP_W, height: WRAP_H, zIndex: 10, pointerEvents: "none",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={wrapSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>

              {/* Flowers */}
              {elements.map((elem) => {
                const flower = getFlowerById(elem.flowerId);
                if (!flower) return null;
                return (
                  <div
                    key={elem.id}
                    style={{
                      position: "absolute",
                      left: `${elem.x}%`, top: `${elem.y}%`,
                      width: FLOWER_SIZE, height: FLOWER_SIZE,
                      transform: `translate(-50%, -50%) rotate(${elem.rotation}deg) scale(${elem.scale})`,
                      zIndex: elem.zIndex + 11, pointerEvents: "none",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={flower.imagePath}
                      alt={flower.name}
                      draggable={false}
                      style={{
                        display: "block",
                        width: FLOWER_SIZE, height: FLOWER_SIZE,
                        objectFit: "contain", mixBlendMode: "screen",
                      }}
                    />
                  </div>
                );
              })}

              {/* Envelope */}
              {note?.text.trim() && (
                <EnvelopeNote onEdit={() => setShowNote(true)} />
              )}
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
            backgroundColor: "#3D2B1F", color: "rgba(255,255,255,0.92)",
            fontFamily: "var(--font-cormorant)", fontSize: 14,
            padding: "10px 22px", borderRadius: 99,
            boxShadow: "0 4px 24px rgba(44,31,20,0.30)",
            zIndex: 9999, pointerEvents: "none",
          }}>
            {toast}
          </div>
        )}

        <PaperGrain />
      </div>

      {/* Read-only note modal */}
      {showNote && note && (
        <NoteReadModal note={note} onClose={() => setShowNote(false)} />
      )}

    </>
  );
}
