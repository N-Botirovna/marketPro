import http, { clearHttpCache } from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse, normalizeItem } from "@/utils/normalizeResponse";
import { withIdempotency } from "@/lib/idempotency";

/**
 * Collection writes can change which books are "bundled" (and thus hidden from
 * the standalone feed), so drop both collection AND book caches.
 */
function invalidateCollectionCaches() {
  try {
    clearHttpCache("/collections");
    clearHttpCache("/book/");
  } catch {
    /* best effort */
  }
}

export async function getCollections(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined),
  );
  const { data } = await http.get(API_ENDPOINTS.COLLECTIONS.LIST, { params: clean });
  const { result: collections, count, next, previous, raw } = normalizeListResponse(data);
  return { collections, count, next, previous, raw };
}

export async function getCollectionsByShop(shopId, limit = 12) {
  return getCollections({ shop: shopId, is_active: true, limit });
}

export async function getCollectionsByUser(userId, limit = 12) {
  return getCollections({ posted_by: userId, owner_type: "user", is_active: true, limit });
}

export async function getHomePageCollections(limit = 8) {
  return getCollections({ for_home_page: true, is_active: true, limit });
}

export async function searchCollections(query, params = {}) {
  return getCollections({ q: query, ...params });
}

export async function getCollectionById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.COLLECTIONS.DETAIL}/${id}/`);
  return { collection: normalizeItem(data) };
}

export async function createCollection({ book_ids, bundle_price, shop }) {
  const payload = { book_ids };
  if (bundle_price !== undefined && bundle_price !== null && bundle_price !== "")
    payload.bundle_price = bundle_price;
  if (shop) payload.shop = Number(shop);
  const { data } = await http.post(API_ENDPOINTS.COLLECTIONS.CREATE, payload, withIdempotency());
  invalidateCollectionCaches();
  return { collection: normalizeItem(data), success: data?.success === true, raw: data };
}

export async function patchCollection(id, body) {
  const { data } = await http.patch(
    `${API_ENDPOINTS.COLLECTIONS.UPDATE}/${id}/`,
    body,
    withIdempotency(),
  );
  invalidateCollectionCaches();
  return { collection: normalizeItem(data), success: data?.success === true, raw: data };
}

export async function deleteCollection(id) {
  const { data } = await http.delete(`${API_ENDPOINTS.COLLECTIONS.DELETE}/${id}/`, {
    skipAuthRefresh: false,
  });
  invalidateCollectionCaches();
  return { success: data?.success === true, raw: data };
}

export async function addBookToCollection(id, bookId) {
  const { data } = await http.post(
    `${API_ENDPOINTS.COLLECTIONS.ADD_BOOK}/${id}/books/add/`,
    { book_id: bookId },
    withIdempotency(),
  );
  invalidateCollectionCaches();
  return { collection: normalizeItem(data), success: data?.success === true, raw: data };
}

export async function detachBookFromCollection(id, bookId) {
  const { data } = await http.delete(`${API_ENDPOINTS.COLLECTIONS.BOOK}/${id}/books/${bookId}/`);
  invalidateCollectionCaches();
  return { collection: normalizeItem(data), success: data?.success === true, raw: data };
}

export async function moveBookToCollection(id, bookId, targetCollectionId) {
  const { data } = await http.post(
    `${API_ENDPOINTS.COLLECTIONS.BOOK}/${id}/books/${bookId}/move/`,
    { target_collection_id: targetCollectionId },
    withIdempotency(),
  );
  invalidateCollectionCaches();
  return { collection: normalizeItem(data), success: data?.success === true, raw: data };
}
