const DEV_FALLBACK_API_BASE = "http://localhost:8000/";
const DEV_FALLBACK_HINT =
  "NEXT_PUBLIC_API_BASE_URL is unset; using http://localhost:8000/ for dev. Set it in .env.local.";

let warnedAboutDevFallback = false;

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

function trimTrailingSlash(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

export function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (raw && raw.trim()) {
    return trimTrailingSlash(raw.trim());
  }

  if (isProductionRuntime()) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is required in production. " +
        "Set it in .env.production or your deployment env (e.g. https://api.kitobzor.uz/).",
    );
  }

  if (!warnedAboutDevFallback && typeof window === "undefined") {
    // eslint-disable-next-line no-console
    console.warn(`[config/env] ${DEV_FALLBACK_HINT}`);
    warnedAboutDevFallback = true;
  }

  return DEV_FALLBACK_API_BASE;
}

export function getSupportPhone() {
  return process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+998 93 834 01 03";
}

/**
 * Public site origin (e.g. https://kitobzor.uz) — used as `metadataBase`
 * for OpenGraph absolute URLs so Telegram/WhatsApp link previews resolve
 * correctly. Falls back to localhost in dev so previews still resolve.
 */
export function getSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    return "https://kitobzor.uz";
  }
  return "http://localhost:3000";
}

export function getSentryDsn() {
  return (process.env.NEXT_PUBLIC_SENTRY_DSN || "").trim();
}

export function getSentryEnvironment() {
  return (
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
    process.env.NODE_ENV ||
    "development"
  ).trim();
}

export function getSentryRelease() {
  return (process.env.NEXT_PUBLIC_SENTRY_RELEASE || "").trim();
}

const DEFAULT_BOT_USERNAME = "kitobzoruz_bot";

/**
 * Telegram bot handle (no leading @). Default kept so a forgotten env
 * variable in local dev doesn't break the login page outright; staging
 * and production should set NEXT_PUBLIC_BOT_USERNAME explicitly so they
 * point at the right bot for their environment.
 */
export function getBotUsername() {
  const raw = (process.env.NEXT_PUBLIC_BOT_USERNAME || "").trim();
  // Strip "@" or "https://t.me/" if the operator pasted a URL instead.
  const cleaned = raw.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "");
  return cleaned || DEFAULT_BOT_USERNAME;
}

/**
 * Full t.me URL for the active bot. Optional `start` parameter for
 * deep-link payloads (e.g. `?start=login`).
 */
export function getBotUrl({ start } = {}) {
  const base = `https://t.me/${getBotUsername()}`;
  return start ? `${base}?start=${encodeURIComponent(start)}` : base;
}

// ── Social channels ────────────────────────────────────────────────────
// Defaults match the production accounts; both can be overridden via
// env so dev/staging point at test channels.

const DEFAULT_TG_CHANNEL = "kitobzor";
const DEFAULT_IG_HANDLE = "kitobzor.uz";

function cleanHandle(raw, fallback) {
  const v = (raw || "")
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/t\.me\//, "")
    .replace(/^https?:\/\/(?:www\.)?instagram\.com\//, "")
    .replace(/\/+$/, "");
  return v || fallback;
}

export function getTelegramChannelHandle() {
  return cleanHandle(process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL, DEFAULT_TG_CHANNEL);
}

export function getTelegramChannelUrl() {
  return `https://t.me/${getTelegramChannelHandle()}`;
}

export function getInstagramHandle() {
  return cleanHandle(process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE, DEFAULT_IG_HANDLE);
}

export function getInstagramUrl() {
  return `https://instagram.com/${getInstagramHandle()}`;
}
