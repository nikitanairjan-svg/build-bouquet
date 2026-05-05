import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(61,40,23,0.10)",
        backgroundColor: "var(--lnd-bg)",
        position: "relative",
      }}
    >
      {/* Main footer content */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(28px, 4.5vh, 52px) clamp(24px, 5vw, 80px)",
        }}
      >
        {/* Top row — BloomCraft logo/name + social icons aligned on same line */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
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
              width={28}
              height={28}
              style={{ borderRadius: 5, objectFit: "contain" }}
            />
            <span
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: 20,
                fontWeight: 500,
                color: "var(--lnd-brown)",
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}
            >
              BloomCraft
            </span>
          </Link>

          {/* Social icons — right-aligned, same row as BloomCraft */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=nikitanair.design@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Email Nikita"
              className="lnd-footer-link"
              style={{ color: "var(--lnd-brown)", display: "inline-flex", alignItems: "center" }}
            >
              <Mail size={22} strokeWidth={1.9} />
            </a>
            <a
              href="https://www.linkedin.com/in/nikita-nair-4a9696214/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nikita LinkedIn profile"
              className="lnd-footer-link"
              style={{ color: "var(--lnd-brown)", display: "inline-flex", alignItems: "center" }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M6.94 8.5H3.56V20h3.38V8.5Zm-1.69-5.5A1.97 1.97 0 0 0 3.28 5a1.97 1.97 0 0 0 1.97 2A1.97 1.97 0 0 0 7.22 5a1.97 1.97 0 0 0-1.97-2ZM20.72 13.4c0-3.42-1.82-5-4.26-5-1.96 0-2.84 1.08-3.33 1.84V8.5H9.75V20h3.38v-6.2c0-1.63.31-3.2 2.34-3.2 2 0 2.03 1.87 2.03 3.31V20h3.38l-.16-6.6Z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "var(--font-jost)",
            fontSize: 14,
            color: "rgba(61,40,23,0.50)",
            lineHeight: 1.55,
            maxWidth: 260,
          }}
        >
          Digitally crafted, personally chosen.
        </p>
      </div>

      {/* Copyright bar */}
      <div
        style={{
          borderTop: "1px solid rgba(61,40,23,0.07)",
          padding: "14px clamp(24px, 5vw, 80px)",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-jost)",
            fontSize: 13,
            color: "rgba(61,40,23,0.38)",
            letterSpacing: "0.02em",
          }}
        >
          © {new Date().getFullYear()} BloomCraft. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
