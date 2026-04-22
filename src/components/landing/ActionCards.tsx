"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Card Data ────────────────────────────────────────────────

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

// ─── Eyebrow with decorative lines ───────────────────────────

function EyebrowWithLines({ text, id }: { text: string; id?: string }) {
  return (
    <p
      id={id}
      style={{
        fontFamily: "var(--font-jost)",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "var(--lnd-rust)",
        marginBottom: 28,
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
      }}
    >
      <span style={{ flex: 1, height: 1, backgroundColor: "var(--lnd-rust)", opacity: 0.35, display: "block" }} />
      <span style={{ whiteSpace: "nowrap" }}>{text}</span>
      <span style={{ flex: 1, height: 1, backgroundColor: "var(--lnd-rust)", opacity: 0.35, display: "block" }} />
    </p>
  );
}

// ─── Individual Card ──────────────────────────────────────────

type CardData = (typeof CARDS)[number];

function Card({
  card,
  visible,
  reducedMotion,
}: {
  card: CardData;
  visible: boolean;
  reducedMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const opacity = reducedMotion || visible ? 1 : 0;
  const transform = reducedMotion
    ? hovered ? "translateY(-6px)" : "none"
    : visible
    ? hovered ? "translateY(-6px)" : "translateY(0px)"
    : "translateY(24px)";

  return (
    <Link
      href={card.href}
      className="lnd-card"
      style={{
        opacity,
        transform,
        boxShadow: hovered
          ? "0 16px 40px rgba(61,40,23,0.10)"
          : "0 2px 12px rgba(61,40,23,0.06)",
      }}
      aria-label={card.title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Content ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 20,
        }}
      >
        {/* Illustration — top 68% */}
        <div
          style={{
            flex: "0 0 68%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: card.imagePadding,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.image}
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* Text — bottom 32% */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            paddingBottom: 8,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 22,
              fontWeight: 600,
              color: "#3D2817",
              lineHeight: 1.2,
              marginBottom: 10,
            }}
          >
            {card.title}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: 14,
              color: "rgba(61,40,23,0.50)",
              lineHeight: 1.5,
              maxWidth: "85%",
            }}
          >
            {card.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─── Section ──────────────────────────────────────────────────

export default function ActionCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
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
        position: "relative",
        overflow: "hidden",
        paddingBottom: "clamp(20px, 3vh, 36px)",
        margin: "0 calc(-1 * clamp(16px, 5vw, 80px))",
      }}
    >
      {/* Watermark — botanical, bottom-left */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/backgrounds/watermark-footer.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -400,
          bottom: -40,
          width: 1000,
          height: "auto",
          opacity: 0.09,
          mixBlendMode: "multiply",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 clamp(16px, 5vw, 80px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Section eyebrow */}
        <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
          <EyebrowWithLines
            id="cards-heading"
            text="WHERE WOULD YOU LIKE TO BEGIN?"
          />
        </div>

        {/* Cards */}
        <div className="lnd-cards-grid">
          {CARDS.map((card, i) => (
            <Card
              key={card.id}
              card={card}
              visible={revealed[i]}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
