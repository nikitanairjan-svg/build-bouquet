export interface Flower {
  id: string;
  name: string;
  imagePath: string;
}

export const FLOWERS: Flower[] = [
  { id: "rose",      name: "Rose",      imagePath: "/flowers/rose.png" },
  { id: "sunflower", name: "Sunflower", imagePath: "/flowers/sunflower.png" },
  { id: "hydrangea", name: "Hydrangea", imagePath: "/flowers/hydrangea.png" },
  { id: "daisy",     name: "Daisy",     imagePath: "/flowers/daisy.png" },
  { id: "peony",     name: "Peony",     imagePath: "/flowers/peony.png" },
  { id: "tulip",     name: "Tulip",     imagePath: "/flowers/tulip.png" },
  { id: "lily",      name: "Lily",      imagePath: "/flowers/lily.png" },
  { id: "carnation", name: "Carnation", imagePath: "/flowers/carnation.png" },
  { id: "orchid",    name: "Orchid",    imagePath: "/flowers/orchid.png" },
];

export function getFlowerById(id: string): Flower | undefined {
  return FLOWERS.find((f) => f.id === id);
}

/** @deprecated Use FLOWERS — kept for backward compatibility */
export const FLOWER_CATALOGUE = FLOWERS;
