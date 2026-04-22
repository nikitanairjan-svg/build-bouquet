import type { FlowerElement } from "@/store/bouquetStore";

type ShareNote = { text: string; color: string } | null | undefined;

export function buildBouquetShareUrl(
  wrapStyle: number,
  wrapColor: string,
  elements: FlowerElement[],
  note?: ShareNote,
): string {
  const payload = {
    s: wrapStyle,
    c: wrapColor,
    e: elements.map((el) => ({
      f: el.flowerId,
      x: Math.round(el.x * 10) / 10,
      y: Math.round(el.y * 10) / 10,
      sc: Math.round(el.scale * 1000) / 1000,
      r: Math.round(el.rotation),
      z: el.zIndex,
    })),
    n: note?.text?.trim() ? { t: note.text, c: note.color } : null,
  };

  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });

  const encoded = btoa(binary);
  return `${window.location.origin}/bouquet?data=${encodeURIComponent(encoded)}`;
}
