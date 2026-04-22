import Link from "next/link";

const NAV_LINKS = [
  { label: "Home",    href: "/" },
  { label: "Library", href: "/library" },
  { label: "About",   href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Topbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: "var(--paper)",
        borderBottom: "1px solid rgba(44, 26, 14, 0.10)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-8 lg:px-12 h-[72px] flex items-center">

        {/* ── Logo ─────────────────────────────────────── */}
        <div className="flex-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
            aria-label="BloomCraft home"
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] select-none transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundColor: "var(--blush-light)",
                color: "var(--rust)",
              }}
            >
              ✿
            </span>
            <span
              className="font-serif text-[20px] tracking-wide leading-none"
              style={{ color: "var(--ink)" }}
            >
              BloomCraft
            </span>
          </Link>
        </div>

        {/* ── Nav ──────────────────────────────────────── */}
        <nav
          className="flex-1 hidden md:flex items-center justify-center gap-8"
          aria-label="Primary"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="font-sans text-[13px] tracking-[0.07em] transition-opacity hover:opacity-40"
              style={{ color: "var(--charcoal)" }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── CTA ──────────────────────────────────────── */}
        <div className="flex-1 flex justify-end">
          <Link
            href="/editor"
            className="hidden md:inline-flex items-center px-5 py-[10px] rounded-full font-sans text-[13px] font-medium text-white tracking-[0.04em] transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
            style={{
              backgroundColor: "var(--brown-dark)",
              boxShadow: "0 2px 10px rgba(44,26,14,0.20)",
            }}
          >
            Create Bouquet
          </Link>

          {/* Mobile hamburger placeholder */}
          <button
            className="md:hidden p-2 rounded-md"
            style={{ color: "var(--ink)" }}
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="2" y1="4.5" x2="16" y2="4.5" />
              <line x1="2" y1="9"   x2="16" y2="9" />
              <line x1="2" y1="13.5" x2="16" y2="13.5" />
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
}
