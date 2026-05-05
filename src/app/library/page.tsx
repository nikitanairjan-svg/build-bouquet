"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Pencil, Share2 } from "lucide-react";
import { useBouquetStore } from "@/store/bouquetStore";
import { setSkipNextReset } from "@/store/bouquetStore";
import { getWrapImagePath } from "@/lib/wraps";
import { getFlowerById } from "@/lib/flowers";
import { GENERATED_BOUQUETS } from "@/lib/generatedBouquets";
import { buildBouquetShareUrl, shareOrCopy } from "@/lib/share";
import PaperGrain from "@/components/landing/PaperGrain";

// Scaled inner-canvas constants — mirrors editor canvas proportions exactly.
const CANVAS_W    = 420;
const CANVAS_H    = 520;
const WRAP_W      = 340;
const WRAP_H      = 460;
const FLOWER_SIZE = 88;
const CARD_IMG_H  = 220;
const CARD_SCALE  = CARD_IMG_H / CANVAS_H; // ≈ 0.4231 — fits full canvas in card height

export default function LibraryPage() {
  const router     = useRouter();
  const loadPreset = useBouquetStore((s) => s.loadPreset);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [hovBack,  setHovBack]  = useState(false);

  const handleBack = () => router.push("/");

  const handleEdit = (bouquetIndex: number) => {
    const bouquet = GENERATED_BOUQUETS[bouquetIndex];
    if (!bouquet) return;
    // Load preset into shared store
    loadPreset({
      wrapStyle: bouquet.wrapStyle,
      wrapColor: bouquet.wrapColor,
      elements:  bouquet.elements,
    });
    // Skip Canvas's mount reset so the loaded flowers are preserved
    setSkipNextReset(true);
    router.push("/editor");
  };

  const handleShare = async (bouquetIndex: number) => {
    const bouquet = GENERATED_BOUQUETS[bouquetIndex];
    if (!bouquet) return;
    const url = buildBouquetShareUrl(
      bouquet.wrapStyle,
      bouquet.wrapColor,
      bouquet.elements.map((el, zIndex) => ({ ...el, zIndex })),
      null,
    );
    const result = await shareOrCopy(url);
    if (result === "copied") { setToastMsg("Link copied!"); setTimeout(() => setToastMsg(null), 2500); }
    else if (result === "failed") { setToastMsg("Could not share"); setTimeout(() => setToastMsg(null), 2500); }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--lnd-bg)", position: "relative" }}>

      {/* ── Responsive grid + card hover ── */}
      <style>{`
        .lib-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) { .lib-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width:  768px) { .lib-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width:  480px) { .lib-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

        .lib-card {
          background: #F5F0E8;
          border: 0.5px solid #D8D0C4;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .lib-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(61,43,31,0.15);
        }

        .lib-edit-btn {
          flex: 1; padding: 7px 0; border-radius: 6px;
          border: 1px solid #D8D0C4; background: transparent; cursor: pointer;
          font-family: var(--font-cormorant); font-size: 12px; color: #3D2B1F;
          display: inline-flex; align-items: center; justify-content: center; gap: 4px;
          transition: background 150ms;
        }
        .lib-edit-btn:hover { background: #EDE6DA; }

        .lib-share-btn {
          flex: 1; padding: 7px 0; border-radius: 6px;
          border: none; background: #963310; cursor: pointer;
          font-family: var(--font-cormorant); font-size: 12px; color: #FFF8F0;
          display: inline-flex; align-items: center; justify-content: center; gap: 4px;
          transition: background 150ms;
        }
        .lib-share-btn:hover { background: #7A2A0D; }
        @media (max-width: 640px) {
          .lib-header { padding: 0 14px !important; }
          .lib-back-label { display: none; }
          .lib-title-wrap { padding: 28px 14px 0 !important; }
          .lib-grid-wrap { padding: 0 14px 36px !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header className="lib-header" style={{
        width: "100%", height: 56, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 24px",
        borderBottom: "0.5px solid #D8D0C4",
        backgroundColor: "var(--lnd-bg)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        {/* Back — left */}
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
          <span className="lib-back-label" style={{ fontFamily: "var(--font-cormorant)", fontSize: 14 }}>Back</span>
        </button>

        {/* Logo — center */}
        <button
          onClick={handleBack}
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
      </header>

      {/* ── Page title ── */}
      <div className="lib-title-wrap" style={{ textAlign: "center", padding: "48px 24px 0", position: "relative", zIndex: 1 }}>
        <h1 style={{
          fontFamily: "var(--font-cormorant)", fontStyle: "italic",
          fontSize: "clamp(30px, 7vw, 36px)", fontWeight: 400, color: "#3D2B1F",
          margin: "0 0 10px",
        }}>
          Bouquet Library
        </h1>
        <p style={{
          fontFamily: "var(--font-cormorant)", fontStyle: "italic",
          fontSize: 17, color: "#6B5E53", margin: "0 0 36px",
        }}>
          Browse our curated collection of handcrafted arrangements
        </p>
      </div>

      {/* ── Grid ── */}
      <div className="lib-grid-wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 60px", position: "relative", zIndex: 1 }}>
        <div className="lib-grid">
          {GENERATED_BOUQUETS.map((bouquet, index) => {
            const wrapSrc = getWrapImagePath(bouquet.wrapStyle, bouquet.wrapColor);

            return (
              <div key={bouquet.id} className="lib-card">

                {/* ── Image area — scaled inner canvas ── */}
                <div style={{
                  position: "relative", height: CARD_IMG_H,
                  backgroundColor: "#EDE6DA",
                  overflow: "hidden",
                }}>
                  {/* Inner canvas: full 420×520 coordinate space, scaled by CARD_SCALE.
                      left: calc(50% - 210px) places the element so its layout center aligns
                      with the card center. transformOrigin "top center" then scales from that
                      same center point, keeping the bouquet horizontally centred at any card width.
                      overflow:hidden on parent clips to CARD_IMG_H, showing only Y_SHOW canvas px. */}
                  <div style={{
                    position: "absolute", top: 0,
                    left: `calc(50% - ${CANVAS_W / 2}px)`,
                    width: CANVAS_W, height: CANVAS_H,
                    transform: `scale(${CARD_SCALE})`,
                    transformOrigin: "top center",
                    pointerEvents: "none",
                  }}>
                    {/* Wrap — same as editor canvas */}
                    <div style={{
                      position: "absolute", bottom: 0,
                      left: "50%", transform: "translateX(-50%)",
                      width: WRAP_W, height: WRAP_H,
                      zIndex: 1,
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={wrapSrc}
                        alt=""
                        draggable={false}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </div>

                    {/* Flowers — exact same rendering as editor canvas */}
                    {bouquet.elements.map((elem, i) => {
                      const flower = getFlowerById(elem.flowerId);
                      if (!flower) return null;
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={flower.imagePath}
                          alt=""
                          draggable={false}
                          style={{
                            position: "absolute",
                            left: `${elem.x}%`,
                            top:  `${elem.y}%`,
                            width:  FLOWER_SIZE,
                            height: FLOWER_SIZE,
                            objectFit: "contain",
                            // No mixBlendMode — PNGs have RGBA alpha channels,
                            // transparent backgrounds render correctly on their own.
                            // screen blend on a light background washes out petal colors.
                            transform: `translate(-50%, -50%) rotate(${elem.rotation}deg) scale(${elem.scale})`,
                            zIndex: i + 2,
                            pointerEvents: "none",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* ── Content area ── */}
                <div style={{ padding: "14px 16px 16px" }}>
                  <p style={{
                    fontFamily: "var(--font-cormorant)", fontWeight: 500,
                    fontSize: 15, color: "#3D2B1F",
                    margin: "0 0 4px",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {bouquet.name}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-cormorant)", fontStyle: "italic",
                    fontSize: 12, color: "#6B5E53",
                    margin: 0,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {bouquet.description}
                  </p>

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button className="lib-edit-btn" onClick={() => handleEdit(index)}>
                      <Pencil size={12} strokeWidth={1.8} />
                      Edit
                    </button>
                    <button className="lib-share-btn" onClick={() => handleShare(index)}>
                      <Share2 size={12} strokeWidth={1.8} />
                      Share
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ── Toast ── */}
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

      {/* Paper grain — background only; header (z:50) and grid (z:1) paint above it */}
      <PaperGrain />

    </div>
  );
}
