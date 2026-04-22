"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "@/components/shared/Icon";

// ─── Action Card Data ─────────────────────────────────────────

const CARDS = [
  {
    symbol:   "✿",
    title:    "Create Bouquet",
    desc:     "Design your own arrangement, bloom by bloom.",
    cardBg:   "#F8EEF0",
    pillBg:   "#F2D5D9",
    pillColor:"#9A3A52",
    border:   "rgba(210,160,170,0.35)",
    hoverShadow: "0 8px 28px rgba(154,58,82,0.12)",
    href:     "/editor",
  },
  {
    symbol:   "◈",
    title:    "View Library",
    desc:     "Browse seasonal flowers and curated palettes.",
    cardBg:   "#EEF4EA",
    pillBg:   "#C4D4B6",
    pillColor:"#3A6430",
    border:   "rgba(150,175,136,0.35)",
    hoverShadow: "0 8px 28px rgba(58,100,48,0.10)",
    href:     "/library",
  },
  {
    symbol:   "✦",
    title:    "Surprise Me",
    desc:     "Let us craft something unexpectedly lovely.",
    cardBg:   "#F2EEF6",
    pillBg:   "#D4C4E0",
    pillColor:"#6B4A8A",
    border:   "rgba(184,160,200,0.35)",
    hoverShadow: "0 8px 28px rgba(107,74,138,0.10)",
    href:     "/editor?mode=surprise",
  },
];

// ─── Animation Variants ───────────────────────────────────────

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE } },
};

// ─── Botanical Line Art ───────────────────────────────────────
// Stroke-based SVG etchings placed at page corners, 10% opacity.
// Two distinct plant forms for visual variety.

function BotanicalLeft() {
  return (
    <svg
      width="240"
      height="340"
      viewBox="0 0 240 340"
      fill="none"
      aria-hidden="true"
    >
      {/* Main stem — long S-curve from top, flows down-right */}
      <path
        d="M 38 0 C 36 32 30 64 26 98 C 22 132 18 168 26 198 C 32 220 44 234 52 258"
        stroke="#2C1A0E" strokeWidth="1.6" strokeLinecap="round"
      />

      {/* Branch 1 — sweeps upper-right from mid-stem */}
      <path
        d="M 26 98 C 48 90 72 78 92 62 C 106 50 112 30 104 12"
        stroke="#2C1A0E" strokeWidth="1.2" strokeLinecap="round"
      />

      {/* Leaf A — on branch 1 (upper) */}
      <path
        d="M 70 74 C 78 56 94 44 110 42 C 106 58 90 70 70 74"
        stroke="#2C1A0E" strokeWidth="1" strokeLinecap="round"
      />
      {/* Leaf A midrib */}
      <path
        d="M 70 74 C 88 58 104 44 110 42"
        stroke="#2C1A0E" strokeWidth="0.65" strokeLinecap="round"
      />

      {/* Rose bud at branch tip */}
      <path
        d="M 104 12 C 100 5 93 3 89 8 C 85 13 87 21 93 23 C 99 25 106 19 104 12"
        stroke="#2C1A0E" strokeWidth="1.1" strokeLinecap="round"
      />
      {/* Outer rose petal */}
      <path
        d="M 93 23 C 89 30 88 38 91 42 C 97 40 104 30 104 12"
        stroke="#2C1A0E" strokeWidth="0.9" strokeLinecap="round"
      />
      {/* Small sepal/leaf at bud base */}
      <path
        d="M 96 24 C 92 28 86 28 84 24"
        stroke="#2C1A0E" strokeWidth="0.8" strokeLinecap="round"
      />

      {/* Branch 2 — left side mid-lower */}
      <path
        d="M 23 155 C 8 144 0 128 4 112"
        stroke="#2C1A0E" strokeWidth="1" strokeLinecap="round"
      />
      {/* Leaf B — on branch 2 */}
      <path
        d="M 4 112 C -8 104 -12 88 -8 74 C 4 72 12 86 4 112"
        stroke="#2C1A0E" strokeWidth="0.9" strokeLinecap="round"
      />
      <path
        d="M 4 112 C -4 94 -6 78 -8 66"
        stroke="#2C1A0E" strokeWidth="0.6" strokeLinecap="round"
      />

      {/* Leaf C — left of lower main stem */}
      <path
        d="M 26 198 C 6 190 -4 170 -2 150 C 12 146 26 166 26 198"
        stroke="#2C1A0E" strokeWidth="1" strokeLinecap="round"
      />
      <path
        d="M 26 198 C 10 176 0 156 -2 140"
        stroke="#2C1A0E" strokeWidth="0.65" strokeLinecap="round"
      />

      {/* Small tendril off main stem */}
      <path
        d="M 40 236 C 52 244 62 256 58 268"
        stroke="#2C1A0E" strokeWidth="0.8" strokeLinecap="round"
      />
    </svg>
  );
}

function BotanicalRight() {
  return (
    <svg
      width="230"
      height="320"
      viewBox="0 0 230 320"
      fill="none"
      aria-hidden="true"
    >
      {/* Main stem — flows from upper-right diagonally down-left */}
      <path
        d="M 192 0 C 184 30 168 54 150 76 C 132 98 110 116 96 144 C 84 168 80 196 84 222"
        stroke="#2C1A0E" strokeWidth="1.6" strokeLinecap="round"
      />

      {/* Branch 1 — sweeps upper-left from stem */}
      <path
        d="M 150 76 C 166 66 180 50 186 32 C 190 20 188 6 178 2"
        stroke="#2C1A0E" strokeWidth="1.2" strokeLinecap="round"
      />

      {/* Daisy/flower head at branch tip */}
      <circle cx="178" cy="4" r="5.5" stroke="#2C1A0E" strokeWidth="1"/>
      <circle cx="178" cy="4" r="2.2" stroke="#2C1A0E" strokeWidth="0.75"/>
      {/* Petals */}
      <path d="M 178 -3 C 180 -7 183 -4 181 0"  stroke="#2C1A0E" strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M 185 4  C 189 2  189 7  185 7"  stroke="#2C1A0E" strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M 178 11 C 180 15  177 16 175 11" stroke="#2C1A0E" strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M 171 4  C 167 2  167 7  171 7"  stroke="#2C1A0E" strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M 182 -2 C 186 -4  188 0  185 3" stroke="#2C1A0E" strokeWidth="0.7" strokeLinecap="round"/>
      <path d="M 174 -2 C 170 -4  168 0  171 3" stroke="#2C1A0E" strokeWidth="0.7" strokeLinecap="round"/>

      {/* Leaf A — on branch 1 */}
      <path
        d="M 164 48 C 170 32 182 22 192 22 C 188 36 176 46 164 48"
        stroke="#2C1A0E" strokeWidth="1" strokeLinecap="round"
      />
      <path
        d="M 164 48 C 176 34 188 24 192 22"
        stroke="#2C1A0E" strokeWidth="0.65" strokeLinecap="round"
      />

      {/* Leaf B — right side of main stem */}
      <path
        d="M 106 116 C 126 108 142 92 144 74 C 132 68 118 82 106 116"
        stroke="#2C1A0E" strokeWidth="1" strokeLinecap="round"
      />
      <path
        d="M 106 116 C 122 94 138 76 144 68"
        stroke="#2C1A0E" strokeWidth="0.65" strokeLinecap="round"
      />

      {/* Small side stem with bud */}
      <path
        d="M 92 164 C 104 152 112 138 110 124"
        stroke="#2C1A0E" strokeWidth="0.9" strokeLinecap="round"
      />
      {/* Bud on side stem */}
      <path
        d="M 110 124 C 106 116 104 108 108 104 C 112 108 114 116 110 124"
        stroke="#2C1A0E" strokeWidth="0.85" strokeLinecap="round"
      />

      {/* Leaf C — lower-left of main stem */}
      <path
        d="M 84 222 C 66 214 54 196 56 178 C 68 172 82 188 84 222"
        stroke="#2C1A0E" strokeWidth="0.95" strokeLinecap="round"
      />
      <path
        d="M 84 222 C 68 202 58 182 56 168"
        stroke="#2C1A0E" strokeWidth="0.62" strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Hero ─────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "calc(100vh - 72px)" }}
    >
      {/* Botanical corner etchings */}
      <div
        className="absolute top-0 left-0 pointer-events-none select-none"
        style={{ opacity: 0.10 }}
      >
        <BotanicalLeft />
      </div>
      <div
        className="absolute top-0 right-0 pointer-events-none select-none"
        style={{ opacity: 0.10 }}
      >
        <BotanicalRight />
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-8 lg:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-20 min-h-[calc(100vh-72px)]">

        {/* ═══ Left Column ════════════════════════════════ */}
        <motion.div
          className="flex-1 max-w-[540px]"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.p
            variants={fadeUp}
            className="font-sans text-[11px] font-medium tracking-[0.24em] uppercase mb-5"
            style={{ color: "var(--rust)" }}
          >
            more than flowers
          </motion.p>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-serif leading-[1.06] mb-6"
            style={{ fontSize: "clamp(40px, 4.2vw, 52px)", color: "var(--ink)" }}
          >
            A bouquet where
            <br />
            every petal is a{" "}
            <em style={{ color: "var(--rust)", fontStyle: "italic" }}>
              little&nbsp;pleasure
            </em>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="font-sans text-[14px] font-light leading-[1.85] max-w-[360px] mb-10"
            style={{ color: "rgba(44, 26, 14, 0.52)" }}
          >
            Choose your blooms, arrange them just so, and let every stem
            tell its own quiet story. A ritual of beauty — entirely yours.
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-7"
          >
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-7 py-[13px] rounded-full font-sans text-[13.5px] font-medium text-white tracking-[0.03em] transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
              style={{
                backgroundColor: "var(--brown-dark)",
                boxShadow: "0 4px 18px rgba(44,26,14,0.28)",
              }}
            >
              Start Building
            </Link>
            <Link
              href="/library"
              className="font-sans text-[13.5px] font-medium underline underline-offset-[5px] decoration-1 transition-opacity hover:opacity-40"
              style={{ color: "var(--ink)" }}
            >
              Browse blooms
            </Link>
          </motion.div>
        </motion.div>

        {/* ═══ Right Column — Action Cards ════════════════ */}
        <motion.div
          className="w-full lg:w-[370px] shrink-0 flex flex-col gap-[10px]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.32, ease: EASE }}
        >
          {CARDS.map((card) => (
            <ActionCard key={card.title} card={card} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}

// ─── Action Card ──────────────────────────────────────────────

type CardData = (typeof CARDS)[number];

function ActionCard({ card }: { card: CardData }) {
  return (
    <Link
      href={card.href}
      className="group flex items-center gap-4 px-5 py-[15px] rounded-2xl border transition-all duration-300 ease-out hover:-translate-y-1"
      style={{
        backgroundColor: card.cardBg,
        borderColor: card.border,
        boxShadow: "0 2px 12px rgba(44,26,14,0.055)",
        // hover shadow applied via onMouseEnter to stay in sync with translate
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = card.hoverShadow;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 2px 12px rgba(44,26,14,0.055)";
      }}
    >
      {/* Icon pill */}
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center text-[16px] shrink-0 select-none"
        style={{
          backgroundColor: card.pillBg,
          color: card.pillColor,
        }}
      >
        {card.symbol}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="font-serif text-[17px] leading-tight"
          style={{ color: "var(--ink)" }}
        >
          {card.title}
        </p>
        <p
          className="font-sans text-[12px] font-light leading-relaxed mt-[3px]"
          style={{ color: "rgba(44,26,14,0.5)" }}
        >
          {card.desc}
        </p>
      </div>

      {/* Arrow */}
      <span
        className="shrink-0 transition-transform duration-200 group-hover:translate-x-[3px]"
        style={{ color: "rgba(44,26,14,0.30)" }}
      >
        <Icon name="arrow" size={14} strokeWidth={1.6} />
      </span>
    </Link>
  );
}
