/**
 * Idempotency-Key helper. Sent on every mutating request so the backend can
 * dedupe duplicate POST/PATCH/DELETE submissions (e.g. double-click or
 * network retry by the user).
 *
 * ENABLED BY DEFAULT. The backend now lists `Idempotency-Key` in
 * CORS_ALLOW_HEADERS and runs `utils.middleware.IdempotencyMiddleware`
 * (verified live on prod, 2026-06), so the preflight passes and duplicate
 * mutations are deduped. Sending the key also lets the axios response
 * interceptor safely RETRY a mutation on a network drop / timeout — the
 * retry replays the cached 2xx instead of creating a duplicate. This is the
 * fix for the book-create "saved to DB but the user saw a network error and
 * a retry made a second book" bug (nginx logged ~25% of POSTs as HTTP 499).
 *
 * NEXT_PUBLIC_ENABLE_IDEMPOTENCY is now an ESCAPE HATCH, not an opt-in: set it
 * to `0` / `false` / `off` to disable (e.g. pointing the FE at a legacy
 * backend whose CORS doesn't allowlist the header). Unset → enabled.
 */

function isIdempotencyEnabled() {
  const raw = String(process.env.NEXT_PUBLIC_ENABLE_IDEMPOTENCY ?? "")
    .trim()
    .toLowerCase();
  return !(raw === "0" || raw === "false" || raw === "off");
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
