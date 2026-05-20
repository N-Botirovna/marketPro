import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { withIdempotency } from "@/lib/idempotency";
import { clearHttpCache } from "@/lib/http";

/**
 * Shop detail (public). Wraps DRF envelope so callers receive `{shop, raw}`.
 */
export async function getShopDetails(id) {
  if (!id) throw new Error("shop id is required");
  const { data } = await http.get(`${API_ENDPOINTS.SHOPS.DETAIL}/${id}/`);
  return data;
}

/**
 * Build a FormData payload that ignores empty / null fields and treats
 * File instances as binary parts (so multipart upload works). Strings,
 * numbers, booleans pass through; everything else falls back to String().
 */
function shopFormData(payload = {}) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined || value === "") continue;
    if (value instanceof File || value instanceof Blob) {
      fd.append(key, value);
    } else if (typeof value === "boolean") {
      // Django REST framework parses "true"/"false" reliably from multipart.
      fd.append(key, value ? "true" : "false");
    } else {
      fd.append(key, value);
    }
  }
  return fd;
}

/**
 * PATCH a shop. `picture` may be a File (replace) or omitted (keep). Other
 * fields are partial — only changed keys need to be supplied.
 *
 * Invalidates the shop detail HTTP cache on success so subsequent reads
 * pick up the new fields without a hard refresh.
 */
export async function updateShop(id, payload) {
  if (!id) throw new Error("shop id is required");
  const fd = shopFormData(payload);
  const { data } = await http.patch(`${API_ENDPOINTS.SHOPS.UPDATE}/${id}/`, fd, withIdempotency());
  try {
    clearHttpCache("/api/v1/shop/");
  } catch {
    /* cache helper may not be present in all builds — best effort */
  }
  return data?.result ?? data;
}

/**
 * Create a new banner under a shop. `payload` must include shop (id),
 * picture (File), and at least one of title/description. Backend
 * validates ownership via the auth token, so callers don't pre-check.
 */
export async function createShopBanner(payload) {
  const fd = shopFormData(payload);
  const { data } = await http.post(API_ENDPOINTS.SHOPS.BANNER_CREATE, fd, withIdempotency());
  try {
    clearHttpCache("/api/v1/shop/");
  } catch {
    /* no-op */
  }
  return data?.result ?? data;
}

/**
 * PATCH an existing banner by id. Pass `picture` to replace; omit to
 * keep. Pass `is_active: false` to hide without deleting.
 */
export async function updateShopBanner(bannerId, payload) {
  if (!bannerId) throw new Error("banner id is required");
  const fd = shopFormData(payload);
  const { data } = await http.patch(
    `${API_ENDPOINTS.SHOPS.BANNER_UPDATE}/${bannerId}/banners/`,
    fd,
    withIdempotency(),
  );
  try {
    clearHttpCache("/api/v1/shop/");
  } catch {
    /* no-op */
  }
  return data?.result ?? data;
}
