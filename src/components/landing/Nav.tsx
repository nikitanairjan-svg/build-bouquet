import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "var(--lnd-bg)",
        borderBottom: "1px solid rgba(61,40,23,0.10)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "16px clamp(16px, 5vw, 80px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}
          aria-label="BloomCraft home"
        >
          <Image
            src="/preloader/logo.svg"
            alt=""
            width={32}
            height={32}
            style={{ borderRadius: 6, objectFit: "contain" }}
          />
          <span
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 22,
              fontWeight: 500,
              color: "var(--lnd-brown)",
              letterSpacing: "0.02em",
              lineHeight: 1,
            }}
          >
            BloomCraft
          </span>
        </Link>
      </div>
    </header>
  );
}
