/**
 * Thin, vendor-agnostic product-analytics layer.
 *
 * The goal is to instrument call sites *now* (search, contact, gift share,
 * …) without committing to a vendor yet. `trackEvent` fans out to whatever
 * is present on `window` at runtime — GA4/GTM (`dataLayer`/`gtag`) or
 * PostHog (`posthog.capture`) — and is a safe no-op when none are wired.
 * When Horizon 0 picks a vendor, only the provider script changes; these
 * call sites stay put.
 *
 * Contract:
 *   - SSR-safe: does nothing (and never throws) when `window` is undefined.
 *   - Never throws: a broken/absent analytics SDK must never break a click.
 *   - No PII: pass identifiers (ids, enums), not names/phones/emails.
 */

/**
 * @param {string} name   - snake_case event name, e.g. "book_gift_share".
 * @param {object} [props] - flat, non-PII properties (ids, enums, counts).
 */
export function trackEvent(name, props = {}) {
  if (!name || typeof window === "undefined") return;

  const payload = { ...props };

  try {
    // GA4 / Google Tag Manager.
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...payload });
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", name, payload);
    }
    // PostHog.
    if (window.posthog && typeof window.posthog.capture === "function") {
      window.posthog.capture(name, payload);
    }
  } catch {
    /* analytics must never break the UX — swallow transport errors */
  }

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console -- dev-only, stripped in prod build
    console.debug("📊 track", name, payload);
  }
}

export default trackEvent;
