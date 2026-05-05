import type { FlowerElement } from "@/store/bouquetStore";

export const SHARE_MESSAGE = "Here is a digitally crafted bouquet for you 💐.";

export type ShareResult = "shared" | "copied" | "failed";

export async function shareOrCopy(url: string): Promise<ShareResult> {
  if (typeof navigator === "undefined") return "failed";

  const shareText = `${SHARE_MESSAGE}\n\nClick Here To View: ${url}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: "BloomCraft Bouquet", text: shareText });
      return "shared";
    } catch (err) {
      if ((err as Error).name === "AbortError") return "shared";
      // share failed — fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    return "copied";
  } catch {
    return "failed";
  }
}

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
