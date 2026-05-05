import type { FlowerElement } from "@/store/bouquetStore";

export const SHARE_MESSAGE = "Here is a digitally crafted bouquet for you 💐.";

export type ShareResult = "shared" | "copied" | "failed";

export async function shareOrCopy(url: string): Promise<ShareResult> {
  if (typeof navigator === "undefined") return "failed";

  // Native share: text + url are separate fields so the raw URL never
  // appears inside the message body — apps render it as a link preview.
  if (navigator.share) {
    try {
      await navigator.share({
        title: "BloomCraft Bouquet",
        text: `${SHARE_MESSAGE}\n\nClick Here To View`,
        url,
      });
      return "shared";
    } catch (err) {
      if ((err as Error).name === "AbortError") return "shared";
      // share failed — fall through to clipboard
    }
  }

  // Clipboard: write HTML so "Click Here To View" is a real hyperlink
  // when pasted into email / rich-text apps; plain-text apps get fallback.
  try {
    const html   = `${SHARE_MESSAGE}<br><br><a href="${url}">Click Here To View</a>`;
    const plain  = `${SHARE_MESSAGE}\n\nClick Here To View: ${url}`;
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html":  new Blob([html],  { type: "text/html" }),
        "text/plain": new Blob([plain], { type: "text/plain" }),
      }),
    ]);
    return "copied";
  } catch {
    // ClipboardItem not supported — plain text fallback
    try {
      await navigator.clipboard.writeText(
        `${SHARE_MESSAGE}\n\nClick Here To View: ${url}`,
      );
      return "copied";
    } catch {
      return "failed";
    }
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
