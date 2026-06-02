/**
 * Post-login redirect (`?next=`) helpers.
 *
 * The app's router is locale-aware (next-intl) — it ALWAYS prepends the active
 * locale. So any `next` value we hand it must be locale-LESS, otherwise a
 * value like "/uz" becomes "/uz/uz" and 404s. The 401 interceptor captures
 * `window.location.pathname` (which includes the locale), so stripping is
 * required on the way in (when building the URL) and defensively on the way
 * out (when consuming it on the login page).
 */

// Mirror of routing.js `locales`. Kept inline so this stays a dependency-free
// util usable from both React components and the plain-JS http layer.
const LOCALES = ["uz", "en", "ru", "kaa"];

const LOCALE_PREFIX_RE = new RegExp(`^/(${LOCALES.join("|")})(?=[/?]|$)`);

/** "/uz/account" → "/account", "/uz" → "/", "/account" → "/account". */
export function stripLocalePrefix(path) {
  if (typeof path !== "string" || !path.startsWith("/")) return path;
  return path.replace(LOCALE_PREFIX_RE, "") || "/";
}

/**
 * Validate + normalize a `next` target for the locale-aware router.
 * Returns a same-origin, locale-less path, or null if it's unusable
 * (off-origin, or an auth page we'd loop back into).
 */
export function sanitizeNextPath(raw) {
  if (typeof raw !== "string") return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null; // same-origin only
  const path = stripLocalePrefix(raw);
  // Never bounce back into the auth pages — that just loops.
  if (path === "/login" || path.startsWith("/login/") || path.startsWith("/login?")) {
    return null;
  }
  if (path === "/register" || path.startsWith("/register/") || path.startsWith("/register?")) {
    return null;
  }
  return path;
}
