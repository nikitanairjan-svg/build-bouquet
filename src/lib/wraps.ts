import type { WrapColor } from "@/store/bouquetStore";

export interface Wrap {
  id: number;
  name: string;
}

export const WRAPS: Wrap[] = [
  { id: 1, name: "Eucalyptus Cone" },
  { id: 2, name: "Ivy Fold" },
  { id: 3, name: "Herb Ribbon" },
  { id: 4, name: "Garden Pot" },
  { id: 5, name: "Tropical Fan" },
  { id: 6, name: "Grass Cone" },
  { id: 7, name: "Magnolia Wrap" },
  { id: 8, name: "Silver Box" },
  { id: 9, name: "Fern Twist" },
];

export const WRAP_COLORS: { id: WrapColor; label: string; hex: string }[] = [
  { id: "brown", label: "Brown", hex: "#C4A882" },
  { id: "pink",  label: "Pink",  hex: "#E8A0AA" },
  { id: "lilac", label: "Lilac", hex: "#B8A0C8" },
];

export function getWrapImagePath(id: number, color: WrapColor): string {
  return `/wraps/${color}/${id}.png`;
}
