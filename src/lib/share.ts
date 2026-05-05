import type { FlowerElement } from "@/store/bouquetStore";

export type ShareResult = "shared" | "copied" | "failed";

async function shortenURL(longURL: string): Promise<string> {
  try {
    const res = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longURL)}`
    );
    if (res.ok) return await res.text();
    return longURL;
  } catch {
    return longURL; // silently fall back to long URL
  }
}

export async function shareOrCopy(url: string): Promise<ShareResult> {
  if (typeof navigator === "undefined") return "failed";

  const shortUrl = await shortenURL(url);

  const TITLE = "A digital bouquet for you 💐";
  const TEXT  = "Someone made you a special digital bouquet 💐";

  // Native share: url is a separate field — no raw URL in the message body.
  if (navigator.share) {
    try {
      await navigator.share({ title: TITLE, text: TEXT, url: shortUrl });
      return "shared";
    } catch (err) {
      if ((err as Error).name === "AbortError") return "shared";
      // fall through to clipboard
    }
  }

  // Clipboard: HTML so "Click Here To View" is a real hyperlink in rich-text
  // apps; plain-text destinations get a readable fallback.
  try {
    const html  = `${TEXT}<br><br><a href="${shortUrl}">Click Here To View</a>`;
    const plain = `${TEXT}\n\nClick Here To View: ${shortUrl}`;
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html":  new Blob([html],  { type: "text/html" }),
        "text/plain": new Blob([plain], { type: "text/plain" }),
      }),
    ]);
    return "copied";
  } catch {
    try {
      await navigator.clipboard.writeText(
        `${TEXT}\n\nClick Here To View: ${shortUrl}`
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

  // base64url: +→- /→_ strip = padding — no percent-encoding needed, survives TinyURL redirects
  const b64url = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${window.location.origin}/bouquet?data=${b64url}`;
}
