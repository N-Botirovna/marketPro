import { API_BASE_URL } from "@/config";

/**
 * Resolve a media URL returned by the Django backend.
 *
 * The API stores uploaded files (book covers, shop logos, avatars) as
 * absolute paths like `/media/books/pictures/photo.jpeg`. When the
 * frontend uses these directly as `<img src>`, the browser resolves them
 * against the *frontend* origin (localhost:3000 in dev, kitobzor.uz in
 * prod) instead of the API origin — every cover 404s.
 *
 * This helper normalises:
 *   - `null` / `undefined` / `""` → returns the passed fallback
 *   - already-absolute URLs (`http://…` or `//cdn…`) → returned unchanged
 *   - data: / blob: URLs → returned unchanged (preview uploads)
 *   - leading-slash paths (`/media/…`) → prefixed with API origin
 *   - bare paths (`media/…`) → prefixed with API origin
 *
 * @param {string} value - the raw URL from the API
 * @param {string} [fallback] - returned when value is empty
 * @returns {string} a URL safe to drop into `<img src>`
 */
export function resolveMediaUrl(value, fallback = "") {
  if (!value) return fallback;
  const v = String(value);
  if (
    /^https?:\/\//i.test(v) ||
    v.startsWith("//") ||
    v.startsWith("data:") ||
    v.startsWith("blob:")
  ) {
    return v;
  }
  const base = (API_BASE_URL || "").replace(/\/$/, "");
  const path = v.startsWith("/") ? v : `/${v}`;
  return `${base}${path}`;
}
