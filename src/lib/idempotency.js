/**
 * Idempotency-Key helper. Sent on every mutating request so the backend can
 * dedupe duplicate POST/PATCH/DELETE submissions (e.g. double-click or
 * network retry by the user).
 *
 * GATED behind NEXT_PUBLIC_ENABLE_IDEMPOTENCY because the backend must list
 * `Idempotency-Key` in CORS_ALLOW_HEADERS first — otherwise browsers reject
 * the preflight and the actual request is never sent. Enable this flag the
 * same day the backend deploys the CORS + dedup middleware.
 */

function isIdempotencyEnabled() {
  const raw = process.env.NEXT_PUBLIC_ENABLE_IDEMPOTENCY;
  return raw === "1" || raw === "true";
}

const FALLBACK_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

function fallbackUuid() {
  let out = "";
  for (let i = 0; i < 32; i += 1) {
    out += FALLBACK_ALPHABET[Math.floor(Math.random() * FALLBACK_ALPHABET.length)];
  }
  return `${out.slice(0, 8)}-${out.slice(8, 12)}-${out.slice(12, 16)}-${out.slice(16, 20)}-${out.slice(20)}`;
}

export function newIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return fallbackUuid();
}

/**
 * withIdempotency — merge an Idempotency-Key header into an axios config.
 * No-op when NEXT_PUBLIC_ENABLE_IDEMPOTENCY is unset (default) so that CORS
 * preflights don't fail against a backend that hasn't allowlisted the header.
 */
export function withIdempotency(config = {}, key) {
  if (!isIdempotencyEnabled()) return config;
  const headers = { ...(config.headers || {}) };
  if (!headers["Idempotency-Key"]) {
    headers["Idempotency-Key"] = key || newIdempotencyKey();
  }
  return { ...config, headers };
}
