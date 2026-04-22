/**
 * Deterministic bouquet generation.
 *
 * Uses a seeded Park-Miller RNG (seed = 42) so the same 14 bouquets are
 * produced on every page visit — no localStorage, no server state needed.
 *
 * Generated once at module-load time and frozen as a module-level constant.
 */

import type { WrapColor } from "@/store/bouquetStore";

// ── Public types ───────────────────────────────────────────────────

export interface BouquetElement {
  flowerId: string;
  x: number;        // 0–100 (% of canvas width 420px)
  y: number;        // 0–100 (% of canvas height 520px)
  scale: number;
  rotation: number; // degrees
}

export interface GeneratedBouquet {
  id: string;
  name: string;
  description: string;
  wrapStyle: number;
  wrapColor: WrapColor;
  // Sorted ascending by y: back flowers first → loadPreset assigns them lower zIndex
  elements: BouquetElement[];
}

// ── Fixed data ─────────────────────────────────────────────────────

const FLOWER_IDS = [
  "rose", "sunflower", "hydrangea", "daisy", "peony",
  "tulip", "lily", "carnation", "orchid",
];

const NAMES = [
  "Spring Joy",     "Wild Garden",    "Ivory Grace",  "Serenity",
  "Golden Hour",    "Blushing Bloom", "Meadow Walk",  "Sunday Morning",
  "Secret Garden",  "Rustic Charm",   "First Dance",  "Sunset Glow",
  "Morning Dew",    "Velvet Petals",
];

const DESCRIPTIONS = [
  "Sunshine in a wrap — guaranteed smiles",
  "Wildflowers picked just for you",
  "Elegant whites for life's big moments",
  "A little calm wrapped in petals",
  "Like a golden afternoon, bottled up",
  "Soft pinks that whisper sweet things",
  "Fresh from an imaginary meadow",
  "Lazy mornings deserve pretty things",
  "Where butterflies would shop",
  "Perfectly imperfect, like all good things",
  "For twirling and swooning",
  "Warm tones for warm hearts",
  "Dewdrops and daydreams",
  "Luxe petals, zero drama",
];

// Flower counts — fixed order satisfying distribution requirements:
//   3-4 range: indices 0(3), 1(4), 13(4)        → 3 bouquets  (≥2 ✓)
//   5-6 range: indices 2(5), 3(5), 4(6), 5(6)   → 4 bouquets  (≥3 ✓)
//   7-8 range: indices 6(7), 7(7), 8(8), 9(8)   → 4 bouquets  (≥3 ✓)
//   9-10 range: indices 10(9), 11(9), 12(10)     → 3 bouquets  (≥2 ✓)
//   Total: 14 ✓
const FLOWER_COUNTS = [3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 4];

// Balanced color pool — 5 brown, 5 pink, 4 lilac (14 total).
// Shuffled with the seeded RNG so order is randomized but counts are guaranteed.
const COLOR_POOL: WrapColor[] = [
  "brown", "brown", "brown", "brown", "brown",
  "pink",  "pink",  "pink",  "pink",  "pink",
  "lilac", "lilac", "lilac", "lilac",
];

// Wrap style pool — style 5 (Tropical Fan) excluded per design.
// Styles 1-4, 6-9 used; styles 1-4, 6, 7 repeat to fill 14 slots.
// Shuffled so variety is guaranteed.
const STYLE_POOL = [1, 2, 3, 4, 6, 7, 8, 9, 1, 2, 3, 4, 6, 7];

// ── Seeded RNG (Park-Miller / Lehmer) ─────────────────────────────
// Period: 2^31 − 2. Same sequence for a given seed every time.
function makeRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function shuffleWithRng<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Flower placement slots ────────────────────────────────────────
//
// Canvas: 420 × 520 px.  Wrap: 340 × 460 px, bottom:0, centred.
//   → wrap top edge at y = 520 − 460 = 60 px (= 11.54 % of canvas height)
//   → wrap centre-x   at x = 210 px          (= 50 % of canvas width)
//
// All offsets below are in CANVAS pixels from the wrap anchor (210, 60).
// Slots are ordered front → back.  After sort-by-y-ascending the highest-y
// element becomes the last array entry and receives the highest zIndex. ✓
//
//   yOff > 0 → flower sits just inside the wrap opening  (front, high zIndex)
//   yOff < 0 → flower peeks above the wrap top edge      (back,  low  zIndex)
//
const WRAP_CX_PX  = 210;  // canvas px
const WRAP_TOP_PX =  60;  // canvas px

const FLOWER_SLOTS: Array<{ xOff: number; yOff: number; scale: number; rotation: number }> = [
  // yOff is relative to WRAP_TOP_PX (60px). Positive = deeper inside the wrap opening.
  // At card scale 0.4231, every +10px canvas ≈ +4.2px in the card preview.
  // ── front layer ──────────────────────────────────────────────────
  // yOff from WRAP_TOP_PX (60px). Higher = deeper inside wrap = higher y% = higher zIndex.
  // ── front layer (deepest in wrap, renders in front) ──────────────
  { xOff:   0, yOff: 175, scale: 1.00, rotation:   0 }, // 0  front center
  { xOff: -28, yOff: 162, scale: 0.95, rotation: -10 }, // 1  front left
  { xOff:  28, yOff: 162, scale: 0.95, rotation:  10 }, // 2  front right
  // ── mid layer ────────────────────────────────────────────────────
  { xOff:  -8, yOff: 150, scale: 0.92, rotation:  -4 }, // 3  mid left
  { xOff:   8, yOff: 150, scale: 0.92, rotation:   4 }, // 4  mid right
  // ── back layer ───────────────────────────────────────────────────
  { xOff:   0, yOff: 138, scale: 0.87, rotation:   2 }, // 5  back center
  { xOff: -22, yOff: 134, scale: 0.86, rotation:  -7 }, // 6  back left
  { xOff:  22, yOff: 134, scale: 0.86, rotation:   7 }, // 7  back right
  // ── far-back layer (shallowest in wrap, renders behind) ──────────
  { xOff: -12, yOff: 122, scale: 0.83, rotation:  -5 }, // 8  far-back left
  { xOff:  12, yOff: 122, scale: 0.83, rotation:   5 }, // 9  far-back right
  { xOff:   0, yOff: 118, scale: 0.81, rotation:   2 }, // 10 far-back center
];

// ── Single bouquet generator ───────────────────────────────────────
function generateBouquet(
  index: number,
  rng: () => number,
  wrapStyle: number,
  wrapColor: WrapColor,
): GeneratedBouquet {
  const flowerCount = FLOWER_COUNTS[index];

  // Pick 2–4 unique flower types by shuffling the full pool
  const typeCount = 2 + Math.floor(rng() * 3); // 2, 3, or 4
  const pool = [...FLOWER_IDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const types = pool.slice(0, typeCount);

  // Distribute flowerCount across types — first type is dominant (~45–55%)
  const flowerIds: string[] = [];
  for (let i = 0; i < flowerCount; i++) {
    const r = rng();
    let idx: number;
    if (types.length === 2)      idx = r < 0.55 ? 0 : 1;
    else if (types.length === 3) idx = r < 0.45 ? 0 : r < 0.75 ? 1 : 2;
    else                         idx = r < 0.40 ? 0 : r < 0.65 ? 1 : r < 0.85 ? 2 : 3;
    flowerIds.push(types[idx]);
  }

  // ── Structured slot placement ──────────────────────────────────
  //
  // Each flower is assigned a pre-defined slot (xOff, yOff from wrap anchor,
  // scale, rotation).  Small per-bouquet jitter keeps the 14 bouquets from
  // looking identical while preserving the tight dome composition.
  //
  // Canvas pixel → percentage conversion:
  //   x% = px / 420 * 100,   y% = py / 520 * 100
  //
  // After sort-by-y-ascending: back flowers (yOff < 0, lower canvas y) become
  // the first array entries → lowest zIndex (behind).
  // Front flowers (yOff > 0, higher canvas y) become last entries → highest zIndex. ✓

  const raw: BouquetElement[] = flowerIds.map((flowerId, i) => {
    const slot = FLOWER_SLOTS[i] ?? FLOWER_SLOTS[FLOWER_SLOTS.length - 1];

    // Small jitter (canvas px) so bouquets with the same count don't look identical
    const xPx = WRAP_CX_PX  + slot.xOff + (rng() - 0.5) * 6;  // ±3 px
    const yPx = WRAP_TOP_PX + slot.yOff + (rng() - 0.5) * 4;  // ±2 px

    return {
      flowerId,
      x:        clamp(xPx / 420 * 100, 22, 78),
      y:        clamp(yPx / 520 * 100,  5, 55),
      scale:    clamp(slot.scale    + (rng() - 0.5) * 0.04, 0.78, 1.15),
      rotation: clamp(slot.rotation + (rng() - 0.5) * 3,   -20,   20),
    };
  });

  // Sort ascending by y: back flowers (small y, top) come first.
  // loadPreset assigns zIndex = array index → index 0 = behind, last = in front. ✓
  raw.sort((a, b) => a.y - b.y);

  return {
    id: `bouquet_${index + 1}`,
    name: NAMES[index],
    description: DESCRIPTIONS[index],
    wrapStyle,
    wrapColor,
    elements: raw,
  };
}

// ── Module-level constant — evaluated once, cached for the lifetime of the module
export const GENERATED_BOUQUETS: GeneratedBouquet[] = (() => {
  const rng = makeRng(42);

  // Shuffle balanced pools first so order is varied but counts are guaranteed.
  // These shuffles consume RNG state before bouquet generation begins — deterministic. ✓
  const colors = shuffleWithRng([...COLOR_POOL], rng);
  const styles = shuffleWithRng([...STYLE_POOL], rng);

  return Array.from({ length: 14 }, (_, i) =>
    generateBouquet(i, rng, styles[i], colors[i])
  );
})();
