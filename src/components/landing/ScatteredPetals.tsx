// Static component — no hooks, no client directive needed.
// All petals are hardcoded positions for consistency across renders.

type PetalShape = "teardrop" | "wide" | "narrow" | "leaf" | "round";

interface Petal {
  shape: PetalShape;
  top: string;
  left: string;
  size: number;
  rotation: number;
  opacity: number;
  color: string;
  /** Hide when viewport width is below this px. 0 = always show. */
  hideBelow: 0 | 480 | 768;
}

// ─── Five base shapes (40×40 viewBox, simple bezier paths) ────

const SHAPES: Record<
  PetalShape,
  { viewBox: string; d: string; vein?: string }
> = {
  // Rose petal — wide, asymmetric teardrop: broad shoulders, tapers sharply to base
  teardrop: {
    viewBox: "0 0 48 56",
    d: "M24 0 C38 2, 48 14, 46 28 C44 42, 35 56, 24 56 C13 56, 4 42, 2 28 C0 14, 10 2, 24 0Z",
  },
  // Daisy petal — needle-thin sliver: 1:8 aspect ratio, barely 8px wide
  wide: {
    viewBox: "0 0 8 64",
    d: "M4 0 C7 6, 8 18, 8 32 C8 46, 7 58, 4 64 C1 58, 0 46, 0 32 C0 18, 1 6, 4 0Z",
  },
  // Cherry blossom — very wide heart with deep notch at top
  narrow: {
    viewBox: "0 0 60 50",
    d: "M30 50 C15 38, 0 26, 0 13 C0 5, 7 0, 16 0 C21 0, 25 3, 30 9 C35 3, 39 0, 44 0 C53 0, 60 5, 60 13 C60 26, 45 38, 30 50Z",
  },
  // Leaf — pointed at BOTH ends (lens/eye shape), clearly not round
  leaf: {
    viewBox: "0 0 28 60",
    d: "M14 0 C26 16, 28 30, 14 60 C0 30, 2 16, 14 0Z",
    vein: "M14 4 L14 56",
  },
  // Tulip — wide, flat, landscape orientation: much wider than tall
  round: {
    viewBox: "0 0 60 34",
    d: "M30 0 C14 2, 2 10, 0 20 C0 28, 10 34, 30 34 C50 34, 60 28, 60 20 C58 10, 46 2, 30 0Z",
  },
};

// ─── 11 petals across three zones ────────────────────────────
//
//  Zone 1 — Hero area (upper right)
//  Zone 2 — Between hero and cards (mid-page)
//  Zone 3 — Below cards / near footer (lower page)
//
//  left: "-2%"  → petal #3 partially crops off left edge  (overflow-x:hidden on page)
//  left: "97%"  → petal #11 partially crops off right edge
//
//  Visibility: 4 always | 8 at ≥480px | 11 at ≥768px

const PETALS: Petal[] = [
  // ── Always visible (4) ───────────────────────────────────────
  { shape: "teardrop", top: "6%",  left: "72%", size: 36, rotation: 35,  opacity: 0.28, color: "#C4847A", hideBelow: 0 },
  { shape: "round",    top: "10%", left: "82%", size: 22, rotation: 55,  opacity: 0.32, color: "#A880B0", hideBelow: 0 },
  { shape: "narrow",   top: "68%", left: "-2%", size: 40, rotation: 22,  opacity: 0.26, color: "#B87A5A", hideBelow: 0 },
  { shape: "round",    top: "74%", left: "83%", size: 32, rotation: 258, opacity: 0.28, color: "#B89A60", hideBelow: 0 },

  // ── Show at ≥480px (4 more → 8 total) ───────────────────────
  { shape: "narrow",   top: "18%", left: "77%", size: 44, rotation: 220, opacity: 0.22, color: "#B87A5A", hideBelow: 480 },
  { shape: "leaf",     top: "38%", left: "11%", size: 32, rotation: 78,  opacity: 0.22, color: "#B89A60", hideBelow: 480 },
  { shape: "leaf",     top: "77%", left: "5%",  size: 28, rotation: 167, opacity: 0.20, color: "#A880B0", hideBelow: 480 },
  { shape: "teardrop", top: "83%", left: "91%", size: 24, rotation: 43,  opacity: 0.22, color: "#C4847A", hideBelow: 480 },

  // ── Show at ≥768px only (3 more → 11 total) ─────────────────
  { shape: "wide",     top: "13%", left: "88%", size: 26, rotation: 112, opacity: 0.18, color: "#88A878", hideBelow: 768 },
  { shape: "teardrop", top: "44%", left: "85%", size: 28, rotation: 310, opacity: 0.20, color: "#C4847A", hideBelow: 768 },
  { shape: "wide",     top: "41%", left: "97%", size: 18, rotation: 145, opacity: 0.18, color: "#88A878", hideBelow: 768 },

  // ── Extra scatter (6 more → 17 total) ───────────────────────
  { shape: "narrow",   top: "3%",  left: "55%", size: 30, rotation: 170, opacity: 0.20, color: "#B87A5A", hideBelow: 480 },
  { shape: "wide",     top: "28%", left: "3%",  size: 22, rotation: 55,  opacity: 0.20, color: "#88A878", hideBelow: 480 },
  { shape: "teardrop", top: "55%", left: "78%", size: 20, rotation: 195, opacity: 0.18, color: "#C4847A", hideBelow: 768 },
  { shape: "leaf",     top: "22%", left: "62%", size: 18, rotation: 330, opacity: 0.16, color: "#88A878", hideBelow: 768 },
  { shape: "round",    top: "90%", left: "48%", size: 24, rotation: 80,  opacity: 0.18, color: "#B89A60", hideBelow: 480 },
  { shape: "narrow",   top: "60%", left: "94%", size: 34, rotation: 260, opacity: 0.18, color: "#A880B0", hideBelow: 768 },
];

// ─── Single petal renderer ────────────────────────────────────

const DRIFT_ANIMATIONS = ["petalDrift1", "petalDrift2", "petalDrift3"] as const;
const DRIFT_DURATIONS  = [5, 6, 7, 5.5, 6.5, 4.5, 7.5, 5] as const;

function PetalSvg({ petal, index }: { petal: Petal; index: number }) {
  const shape = SHAPES[petal.shape];

  const hideClass =
    petal.hideBelow === 768
      ? "petal-hide-768"
      : petal.hideBelow === 480
      ? "petal-hide-480"
      : undefined;

  const animationName = DRIFT_ANIMATIONS[index % 3];
  const duration      = DRIFT_DURATIONS[index % DRIFT_DURATIONS.length];

  return (
    <svg
      key={index}
      aria-hidden="true"
      className={hideClass ? `petal-svg ${hideClass}` : "petal-svg"}
      viewBox={shape.viewBox}
      width={petal.size}
      height={petal.size}
      style={{
        position: "absolute",
        top: petal.top,
        left: petal.left,
        opacity: petal.opacity,
        pointerEvents: "none",
        zIndex: 1,
        overflow: "visible",
        flexShrink: 0,
        "--base-rotation": `${petal.rotation}deg`,
        animation: `${animationName} ${duration}s ease-in-out infinite`,
      } as React.CSSProperties}
    >
      <path d={shape.d} fill={petal.color} />
      {shape.vein && (
        <path
          d={shape.vein}
          fill="none"
          stroke={petal.color}
          strokeWidth={0.8}
          strokeOpacity={0.3}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

// ─── Export ───────────────────────────────────────────────────

export default function ScatteredPetals() {
  return (
    <>
      {PETALS.map((petal, i) => (
        <PetalSvg key={i} petal={petal} index={i} />
      ))}
    </>
  );
}
