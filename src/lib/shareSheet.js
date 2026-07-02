/**
 * Event bus for opening the global ShareSheet from anywhere.
 *
 * Telegram-style flow: callers fire `openShareSheet({title, text, url})`
 * and the mount-point in the layout renders the bottom-sheet with a list
 * of share targets (Telegram, WhatsApp, SMS, Facebook, X, email, copy).
 * Keeps the sheet's chunk lazy — bytes ship only after the first share.
 *
 * `telegramUrl` (optional): overrides the Telegram target's destination. We
 * pass a bot deep-link (`t.me/<bot>?start=share_...`) here so the Telegram
 * tile opens the bot, which then hands the user a fully HTML-formatted,
 * ready-to-forward card (bold + quote + link) — something the plain-text
 * `t.me/share/url` deep-link can never render. Other targets (WhatsApp,
 * native share, …) keep using `text`/`url` as before.
 */

const EVENT = "share-sheet:open";

export const SHARE_SHEET_EVENT = EVENT;

export function openShareSheet({ title = "", text = "", url = "", telegramUrl = "" } = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { title, text, url, telegramUrl } }));
}
