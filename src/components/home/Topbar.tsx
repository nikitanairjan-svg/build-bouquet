import Link from "next/link";

const NAV_LINKS = [
  { label: "Home",    href: "/" },
  { label: "Library", href: "/library" },
  { label: "About",   href: "#" },
  { label: "Contact", href: "#" },
];

export default function Topbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: "var(--paper)",
        borderBottom: "1px solid rgba(44,31,20,0.10)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-8 lg:px-12 h-[72px] flex items-center">

        {/* Logo */}
        <div className="flex-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
            aria-label="BloomCraft home"
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] select-none transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: "rgba(139,58,28,0.12)", color: "var(--rust)" }}
            >
              ✿
            </span>
            <span
              className="text-[20px] tracking-wide leading-none"
              style={{ fontFamily: "var(--font-cormorant)", color: "var(--ink)" }}
            >
              BloomCraft
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 hidden md:flex items-center justify-center gap-8" aria-label="Primary">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[13px] tracking-[0.07em] transition-opacity hover:opacity-40"
              style={{ fontFamily: "var(--font-jost)", color: "var(--ink)" }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex-1 flex justify-end">
          <Link
            href="/editor"
            className="hidden md:inline-flex items-center px-5 py-[10px] rounded-full text-[13px] font-medium text-white tracking-[0.04em] transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
            style={{
              fontFamily: "var(--font-jost)",
              backgroundColor: "var(--brown-dark)",
              boxShadow: "0 2px 10px rgba(44,31,20,0.20)",
            }}
          >
            Create Bouquet
          </Link>
        </div>
      </div>
    </header>
  );
}
