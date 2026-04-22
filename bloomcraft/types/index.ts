// ─── Flower Catalogue ─────────────────────────────────────────

export type FlowerCategory =
  | "rose"
  | "wildflower"
  | "foliage"
  | "filler"
  | "seasonal";

export interface FlowerItem {
  id: string;
  name: string;
  category: FlowerCategory;
  colours: string[]; // hex values
  image: string;     // path to /public/images/...
  price: number;     // price per stem in pence
  seasonal?: boolean;
  description?: string;
}

// ─── Builder State ────────────────────────────────────────────

export interface PlacedFlowerItem {
  instanceId: string;       // unique per placement
  flowerId: string;         // references FlowerItem.id
  x: number;                // canvas position %
  y: number;                // canvas position %
  rotation: number;         // degrees
  scale: number;            // 0.5 – 1.5
  zIndex: number;
}

export type WrapStyle = "kraft" | "silk" | "twine" | "florist";

export interface BouquetState {
  name: string;
  placedFlowers: PlacedFlowerItem[];
  wrap: WrapStyle;
  note?: string;             // personal message card
}

// ─── UI State ─────────────────────────────────────────────────

export type ActiveFilter = "all" | FlowerCategory;

export interface UIState {
  activeFilter: ActiveFilter;
  selectedInstanceId: string | null;
  isSummaryOpen: boolean;
  isShareModalOpen: boolean;
}
