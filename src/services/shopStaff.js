import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse } from "@/utils/normalizeResponse";
import { withIdempotency } from "@/lib/idempotency";

/**
 * Backend contract: GET /api/v1/shop/stuff/
 * Returns all active (`is_active=True`) staff entries whose `shop.owner` is
 * the current user. Soft-deactivated rows are filtered out server-side.
 *
 * Response item shape:
 *   { id, shop, shop_name, user, user_name, is_active }
 */
export async function listStaff({ shopId, limit = 100 } = {}) {
  const params = { limit };
  if (shopId) params.shop = shopId;
  const { data } = await http.get(API_ENDPOINTS.SHOPS.STAFF, { params });
  const { result: staff, count, next, previous, raw } = normalizeListResponse(data);
  return { staff, count, next, previous, raw };
}

/**
 * POST /api/v1/shop/stuff/  body: { shop, phone_number }
 * Server resolves the user from phone_number (must already exist).
 */
export async function addStaff({ shopId, phoneNumber }) {
  const { data } = await http.post(
    API_ENDPOINTS.SHOPS.STAFF,
    { shop: shopId, phone_number: phoneNumber },
    withIdempotency(),
  );
  return {
    success: data?.success !== false,
    staff: data?.result || data,
    message: data?.message || null,
  };
}

/**
 * DELETE /api/v1/shop/stuff/<id>/
 * Permanent removal. The list endpoint also hides `is_active=false` rows so
 * a PATCH-based "deactivate" is functionally equivalent if you'd rather
 * keep history; we expose DELETE here because that's what the UI's
 * "Remove" action means to the user.
 */
export async function removeStaff(staffId) {
  await http.delete(`${API_ENDPOINTS.SHOPS.STAFF_DETAIL}/${staffId}/`, withIdempotency());
  return { success: true };
}
