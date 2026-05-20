/**
 * Event bus for opening the global ShareSheet from anywhere.
 *
 * Telegram-style flow: callers fire `openShareSheet({title, text, url})`
 * and the mount-point in the layout renders the bottom-sheet with a list
 * of share targets (Telegram, WhatsApp, SMS, Facebook, X, email, copy).
 * Keeps the sheet's chunk lazy — bytes ship only after the first share.
 */

const EVENT = "share-sheet:open";

export const SHARE_SHEET_EVENT = EVENT;

export function openShareSheet({ title = "", text = "", url = "" } = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { title, text, url } }));
}
