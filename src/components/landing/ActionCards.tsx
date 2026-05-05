"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const CARDS = [
  {
    id: "create",
    href: "/editor",
    title: "Create Bouquet",
    description: "Design your dream bouquet from a library of blooms.",
    image: "/assets/cards/create-bouquet.svg",
    imagePadding: 20,
  },
  {
    id: "library",
    href: "/library",
    title: "View Library",
    description: "Browse and organize your curated floral collections.",
    image: "/assets/cards/view-library.svg",
    imagePadding: 10,
  },
  {
    id: "surprise",
    href: "/surprise",
    title: "Surprise Me",
    description: "Let BloomCraft generate a unique digital bouquet for you.",
    image: "/assets/cards/surprise-me.svg",
    imagePadding: 8,
  },
] as const;

type CardData = (typeof CARDS)[number];

// ─── Eyebrow ──────────────────────────────────────────────────

function EyebrowWithLines({ text, id }: { text: string; id?: string }) {
  return (
    <p
      id={id}
      style={{
        fontFamily: "var(--font-jost)", fontSize: 12, fontWeight: 500,
        letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--lnd-rust)",
        marginBottom: 28, display: "flex", alignItems: "center", gap: 14, width: "100%",
      }}
    >
      <span style={{ flex: 1, height: 1, backgroundColor: "var(--lnd-rust)", opacity: 0.35, display: "block" }} />
      <span style={{ whiteSpace: "nowrap" }}>{text}</span>
      <span style={{ flex: 1, height: 1, backgroundColor: "var(--lnd-rust)", opacity: 0.35, display: "block" }} />
    </p>
  );
}

// ─── Desktop Card ─────────────────────────────────────────────

function Card({ card, visible, reducedMotion }: { card: CardData; visible: boolean; reducedMotion: boolean }) {
  const [hovered, setHovered] = useState(false);
  const opacity   = reducedMotion || visible ? 1 : 0;
  const transform = reducedMotion ? (hovered ? "translateY(-6px)" : "none")
    : visible ? (hovered ? "translateY(-6px)" : "translateY(0px)") : "translateY(24px)";

  return (
    <Link
      href={card.href} className="lnd-card"
      style={{ opacity, transform, boxShadow: hovered ? "0 16px 40px rgba(61,40,23,0.10)" : "0 2px 12px rgba(61,40,23,0.06)" }}
      aria-label={card.title}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20 }}>
        <div style={{ flex: "0 0 68%", display: "flex", alignItems: "center", justifyContent: "center", padding: card.imagePadding }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.image} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", paddingBottom: 8 }}>
          <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: 22, fontWeight: 600, color: "#3D2817", lineHeight: 1.2, marginBottom: 10 }}>
            {card.title}
          </h3>
          <p style={{ fontFamily: "var(--font-jost)", fontSize: 14, color: "rgba(61,40,23,0.50)", lineHeight: 1.5, maxWidth: "85%" }}>
            {card.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─── Mobile Coverflow Carousel ────────────────────────────────

const AUTO_MS   = 3200;
const CARD_W_VW = 72; // active card width as % of viewport

function CoverflowCarousel({ reducedMotion }: { reducedMotion: boolean }) {
  const [active, setActive]     = useState(0);
  const activeRef               = useRef(0);
  const pausedRef               = useRef(false);
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX             = useRef(0);
  const touchStartY             = useRef(0);
  const draggingRef             = useRef(false);

  const goTo = useCallback((idx: number) => {
    const i = (idx + CARDS.length) % CARDS.length;
    activeRef.current = i;
    setActive(i);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (reducedMotion) return;
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) goTo(activeRef.current + 1);
    }, AUTO_MS);
  }, [goTo, reducedMotion]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  // Swipe handling
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    draggingRef.current = false;
    pausedRef.current   = true;
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 6) draggingRef.current = true;
  }

  function onTouchEnd(e: React.TouchEvent) {
    pausedRef.current = false;
    if (!draggingRef.current) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      goTo(activeRef.current + (delta < 0 ? 1 : -1));
    }
    startTimer();
  }

  // Per-card transform based on distance from active
  function cardStyle(i: number): React.CSSProperties {
    const offset    = i - active;
    const absOffset = Math.abs(offset);

    // Cards more than 1 away are hidden off-screen
    if (absOffset > 1) {
      return {
        transform: `translateX(${offset > 0 ? 130 : -130}%) scale(0.78)`,
        opacity: 0,
        zIndex: 0,
        pointerEvents: "none",
        filter: "blur(4px)",
      };
    }

    if (offset === 0) {
      return {
        transform: "translateX(0) scale(1)",
        opacity: 1,
        zIndex: 2,
        filter: "blur(0px)",
        boxShadow: "0 16px 48px rgba(61,40,23,0.16)",
      };
    }

    // Left (-1) or right (+1) peek card
    return {
      transform: `translateX(${offset * 82}%) scale(0.84)`,
      opacity: 0.48,
      zIndex: 1,
      pointerEvents: "none",
      filter: "blur(1.5px)",
    };
  }

  return (
    <div style={{ width: "100%" }}>
      {/* ── Track ── */}
      <div
        style={{ position: "relative", width: "100%", height: `min(440px, 108vw)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {CARDS.map((card, i) => (
          <div
            key={card.id}
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              width: `${CARD_W_VW}vw`,
              maxWidth: 300,
              height: "100%",
              marginLeft: `calc(-${CARD_W_VW / 2}vw)`,
              borderRadius: 12,
              transition: reducedMotion
                ? "none"
                : "transform 480ms cubic-bezier(0.34, 1.26, 0.64, 1), opacity 380ms ease, filter 380ms ease, box-shadow 380ms ease",
              willChange: "transform, opacity",
              ...cardStyle(i),
            }}
            onClick={() => {
              if (i !== active) { goTo(i); startTimer(); }
            }}
          >
            <Link
              href={card.href}
              aria-label={card.title}
              style={{
                display: "flex", flexDirection: "column",
                width: "100%", height: "100%",
                borderRadius: 12,
                border: "1px solid #D8D0C4",
                backgroundColor: "#EDE5D5",
                overflow: "hidden",
                textDecoration: "none",
              }}
              // Prevent navigation when user is swiping
              onClick={(e) => { if (draggingRef.current) e.preventDefault(); }}
            >
              <div style={{ flex: "0 0 68%", display: "flex", alignItems: "center", justifyContent: "center", padding: card.imagePadding }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.image} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 16px 12px" }}>
                <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: 22, fontWeight: 600, color: "#3D2817", lineHeight: 1.2, marginBottom: 8 }}>
                  {card.title}
                </h3>
                <p style={{ fontFamily: "var(--font-jost)", fontSize: 13, color: "rgba(61,40,23,0.50)", lineHeight: 1.5 }}>
                  {card.description}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* ── Dot indicators ── */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 7, marginTop: 20 }}>
        {CARDS.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => { goTo(i); startTimer(); }}
            style={{
              width: i === active ? 22 : 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: i === active ? "#963310" : "rgba(150,51,16,0.22)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "width 380ms cubic-bezier(0.4,0,0.2,1), background-color 380ms ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────

export default function ActionCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed]   = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const [hydrated, setHydrated]   = useState(false);

  useEffect(() => {
    setHydrated(true);
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mqMotion.matches);
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          CARDS.forEach((_, i) => {
            setTimeout(() => {
              setRevealed((prev) => {
                const next = [...prev] as [boolean, boolean, boolean];
                next[i] = true;
                return next;
              });
            }, i * 120);
          });
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="cards-heading"
      style={{
        position: "relative", overflow: "hidden",
        paddingBottom: "clamp(20px, 3vh, 36px)",
        margin: "0 calc(-1 * clamp(16px, 5vw, 80px))",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/backgrounds/watermark-footer.png" alt="" aria-hidden="true"
        style={{
          position: "absolute", left: -400, bottom: -40, width: 1000, height: "auto",
          opacity: 0.09, mixBlendMode: "multiply", pointerEvents: "none", userSelect: "none",
        }}
      />

      <div
        style={{
          position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto",
          padding: "0 clamp(16px, 5vw, 80px)",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
          <EyebrowWithLines id="cards-heading" text="WHERE WOULD YOU LIKE TO BEGIN?" />
        </div>

        {hydrated && isMobile ? (
          <CoverflowCarousel reducedMotion={reducedMotion} />
        ) : (
          <div className="lnd-cards-grid">
            {CARDS.map((card, i) => (
              <Card key={card.id} card={card} visible={revealed[i]} reducedMotion={reducedMotion} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
