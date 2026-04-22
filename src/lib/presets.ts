import type { WrapColor } from "@/store/bouquetStore";

export interface BouquetPreset {
  id: string;
  name: string;
  occasion: string;
  flowerIds: string[];
  wrapStyle: number;
  wrapColor: WrapColor;
  elements: {
    flowerId: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }[];
}

export const PRESETS: BouquetPreset[] = [
  {
    id: "spring-joy",
    name: "Spring Joy",
    occasion: "Birthday",
    flowerIds: ["rose", "sunflower", "daisy"],
    wrapStyle: 1,
    wrapColor: "brown",
    elements: [
      { flowerId: "rose",      x: 40, y: 22, scale: 1.0, rotation: -10 },
      { flowerId: "sunflower", x: 58, y: 30, scale: 1.1, rotation: 8 },
      { flowerId: "daisy",     x: 32, y: 38, scale: 0.85, rotation: 5 },
      { flowerId: "rose",      x: 55, y: 18, scale: 0.8, rotation: -5 },
      { flowerId: "daisy",     x: 48, y: 42, scale: 0.9, rotation: 12 },
    ],
  },
  {
    id: "ivory-grace",
    name: "Ivory Grace",
    occasion: "Wedding",
    flowerIds: ["lily", "daisy", "peony"],
    wrapStyle: 3,
    wrapColor: "brown",
    elements: [
      { flowerId: "lily",  x: 45, y: 20, scale: 1.05, rotation: 0 },
      { flowerId: "peony", x: 36, y: 32, scale: 1.0,  rotation: -8 },
      { flowerId: "daisy", x: 58, y: 28, scale: 0.85, rotation: 10 },
      { flowerId: "lily",  x: 52, y: 40, scale: 0.9,  rotation: 6 },
      { flowerId: "peony", x: 30, y: 45, scale: 0.8,  rotation: -3 },
    ],
  },
  {
    id: "midnight",
    name: "Midnight",
    occasion: "Anniversary",
    flowerIds: ["orchid", "hydrangea", "peony"],
    wrapStyle: 2,
    wrapColor: "pink",
    elements: [
      { flowerId: "orchid",    x: 44, y: 22, scale: 1.0, rotation: -6 },
      { flowerId: "hydrangea", x: 56, y: 30, scale: 1.1, rotation: 10 },
      { flowerId: "peony",     x: 34, y: 36, scale: 0.95, rotation: 4 },
      { flowerId: "orchid",    x: 60, y: 20, scale: 0.8,  rotation: -12 },
    ],
  },
  {
    id: "wild-garden",
    name: "Wild Garden",
    occasion: "Just Because",
    flowerIds: ["sunflower", "tulip", "carnation"],
    wrapStyle: 4,
    wrapColor: "brown",
    elements: [
      { flowerId: "sunflower", x: 42, y: 20, scale: 1.1, rotation: 5 },
      { flowerId: "tulip",     x: 58, y: 28, scale: 0.9, rotation: -8 },
      { flowerId: "carnation", x: 33, y: 34, scale: 0.85, rotation: 14 },
      { flowerId: "tulip",     x: 52, y: 38, scale: 0.95, rotation: 3 },
      { flowerId: "carnation", x: 62, y: 40, scale: 0.8,  rotation: -5 },
    ],
  },
  {
    id: "serenity",
    name: "Serenity",
    occasion: "Get Well",
    flowerIds: ["lily", "hydrangea", "daisy"],
    wrapStyle: 1,
    wrapColor: "lilac",
    elements: [
      { flowerId: "lily",      x: 46, y: 20, scale: 1.0, rotation: -4 },
      { flowerId: "hydrangea", x: 36, y: 30, scale: 1.05, rotation: 8 },
      { flowerId: "daisy",     x: 58, y: 26, scale: 0.85, rotation: -10 },
      { flowerId: "lily",      x: 52, y: 40, scale: 0.8,  rotation: 5 },
    ],
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    occasion: "Graduation",
    flowerIds: ["sunflower", "carnation", "rose"],
    wrapStyle: 3,
    wrapColor: "brown",
    elements: [
      { flowerId: "sunflower", x: 44, y: 18, scale: 1.15, rotation: 0 },
      { flowerId: "carnation", x: 32, y: 32, scale: 0.9, rotation: -12 },
      { flowerId: "rose",      x: 60, y: 26, scale: 1.0, rotation: 8 },
      { flowerId: "carnation", x: 55, y: 38, scale: 0.85, rotation: -4 },
      { flowerId: "rose",      x: 38, y: 44, scale: 0.8,  rotation: 10 },
    ],
  },
];

export const OCCASIONS = ["All", "Birthday", "Wedding", "Anniversary", "Just Because", "Graduation", "Get Well"] as const;
export type Occasion = (typeof OCCASIONS)[number];
