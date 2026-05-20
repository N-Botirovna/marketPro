/**
 * Share helper — Web Share API with clipboard fallback.
 *
 * Telegram on Android exposes itself as a Web Share target, so any device
 * with the share sheet (mobile Safari/Chrome) gets a native "Share to
 * Telegram" entry for free. Desktop browsers don't expose Web Share for
 * sharing arbitrary URLs reliably, so we fall back to clipboard + toast.
 *
 * `path` may be absolute (`https://kitobzor.uz/uz/book-details/42`) or
 * relative (`/uz/book-details/42`). For relative paths we resolve against
 * `window.location.origin` so the shared URL always carries the host.
 */

export function buildAbsoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (typeof window === "undefined") return path;
  const origin = window.location.origin;
  if (path.startsWith("/")) return `${origin}${path}`;
  return `${origin}/${path}`;
}

/**
 * Build a Telegram share URL — opens Telegram's "share to chat" dialog
 * pre-populated with the URL and an optional caption. Useful as a
 * desktop-only fallback when Web Share API is unavailable.
 */
export function buildTelegramShareUrl(url, text = "") {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return `https://t.me/share/url?url=${u}&text=${t}`;
}

/**
 * Share or copy a link. Returns:
 *   { method: "share" }   — native share sheet opened (don't toast, OS handles UX)
 *   { method: "copy" }    — URL written to clipboard, caller should toast
 *   { method: "fallback", url } — neither worked; caller should show URL in a prompt
 *   { method: "cancel" }  — user dismissed the share sheet
 */
export async function shareLink({ title, text, url }) {
  const absoluteUrl = buildAbsoluteUrl(url);
  const payload = {
    title,
    text: text || title || "",
    url: absoluteUrl,
  };

  // Web Share API path. We only call it if the browser can actually share
  // URLs — desktop Firefox/Edge sometimes expose navigator.share but reject
  // url-only payloads, which we want to fall back from cleanly.
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    (typeof navigator.canShare !== "function" || navigator.canShare(payload))
  ) {
    try {
      await navigator.share(payload);
      return { method: "share" };
    } catch (err) {
      // AbortError → user dismissed the sheet, don't fall through to copy
      if (err && err.name === "AbortError") {
        return { method: "cancel" };
      }
      // Otherwise fall through to clipboard
    }
  }

  // Clipboard path
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      return { method: "copy" };
    } catch {
      /* clipboard rejected (insecure context, permission) → fallback */
    }
  }

  return { method: "fallback", url: absoluteUrl };
}
