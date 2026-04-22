import Image from "next/image";

export default function Hero() {
  return (
    <section
      aria-label="Hero"
      style={{
        position: "relative",
        padding: "clamp(20px, 3vh, 36px) 0 clamp(8px, 1.5vh, 16px)",
        margin: "0 calc(-1 * clamp(16px, 5vw, 80px))",
      }}
    >
      {/* ── Watermark — foxglove arrangement, right side ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/backgrounds/watermark-hero.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -150,
          top: "50%",
          transform: "translateY(-50%)",
          width: 500,
          height: "auto",
          opacity: 0.09,
          mixBlendMode: "multiply",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}
      />

      {/* ── Text block — max 800px, centered ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 800,
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Centered logo */}
        <Image
          src="/preloader/logo.svg"
          alt="BloomCraft"
          width={120}
          height={120}
          className="hero-logo"
          style={{
            objectFit: "contain",
            marginBottom: 20,
          }}
        />

        {/* Headline — "made by you." shimmers slowly */}
        <h1
          className="hero-headline"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 400,
            lineHeight: 1.1,
            color: "var(--lnd-brown)",
            marginBottom: 14,
          }}
        >
          Beautiful bouquets,{" "}
          <em className="hero-shimmer" style={{ fontStyle: "italic" }}>
            made by you.
          </em>
        </h1>

        {/* Subtitle */}
        <p
          className="hero-subtitle"
          style={{
            fontFamily: "var(--font-jost)",
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.6,
            color: "rgba(61,40,23,0.60)",
            maxWidth: "55ch",
            marginBottom: 20,
          }}
        >
          Pick your flowers, arrange them just so, and send a bouquet that lasts
          longer than a week in a vase.
        </p>
      </div>
    </section>
  );
}
