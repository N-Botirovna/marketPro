import http, { clearHttpCache } from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse, normalizeItem } from "@/utils/normalizeResponse";
import { withIdempotency } from "@/lib/idempotency";

/**
 * Drop every cached read that could now be stale after a book write:
 *   - `/book/list/`  — homepage feeds, search, profile own-books, archive
 *   - `/book/liked/` — wishlist (cached at TTL 0 today, future-proof)
 * Call from every mutation in this module so the UI never serves
 * 10-minute-old data after the user just acted.
 */
function invalidateBookCaches() {
  try {
    clearHttpCache("/book/");
  } catch {
    /* cache helper missing in test bundles — best effort */
  }
}

// URL slugs and a few i18n keys use "sell" as the user-facing type label
// (Telegram-friendlier than "seller"), but backend's BookType enum stores
// it as "seller". Translate ONLY the outbound filter param — responses are
// left in their backend shape so consumers like BookCreateModal (which
// edits books and keeps `"seller"` in its form state) keep working.
const TYPE_REQ_ALIAS = { sell: "seller" };

function toBackendType(t) {
  return t && TYPE_REQ_ALIAS[t] ? TYPE_REQ_ALIAS[t] : t;
}

export async function getBooks(params = {}) {
  const safeParams = { ...params };
  if (safeParams.type) safeParams.type = toBackendType(safeParams.type);

  const { data } = await http.get(API_ENDPOINTS.BOOKS.LIST, { params: safeParams });
  const { result: books, count, next, previous, success, raw } = normalizeListResponse(data);
  return { books, count, next, previous, success, raw };
}

export async function getBookById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.BOOKS.DETAIL}/${id}/`);
  return { book: normalizeItem(data) };
}

export async function getHomePageBooks() {
  return await getBooks({ for_home_page: true, is_active: true, limit: 12 });
}

export async function getNewBooks(limit = 8, offset = 0) {
  return await getBooks({ is_used: false, is_active: true, limit, offset });
}

export async function getUsedBooks(limit = 8, offset = 0) {
  return await getBooks({ is_active: true, is_used: true, limit, offset });
}

export async function getBooksByCategory(categoryId, limit = 12) {
  return await getBooks({ category: categoryId, is_active: true, limit });
}

export async function getBooksByType(type, limit = 12, offset = 0) {
  return await getBooks({ type, is_active: true, limit, offset });
}

export async function searchBooks(query, params = {}) {
  return await getBooks({ q: query, is_active: true, ...params });
}

export async function getBooksByPriceRange(minPrice, maxPrice, limit = 12) {
  return await getBooks({ price_min: minPrice, price_max: maxPrice, is_active: true, limit });
}

export async function getBooksByYear(minYear, maxYear, limit = 12) {
  return await getBooks({
    publication_year_min: minYear,
    publication_year_max: maxYear,
    is_active: true,
    limit,
  });
}

export async function getBooksByCoverType(coverType, limit = 12) {
  return await getBooks({ cover_type: coverType, is_active: true, limit });
}

export async function getBooksByOwnerType(ownerType, limit = 12) {
  return await getBooks({ owner_type: ownerType, is_active: true, limit });
}

export async function getBooksByShop(shopId, limit = 12) {
  return await getBooks({ shop: shopId, is_active: true, limit });
}

export async function getBooksByUser(userId, limit = 12) {
  return await getBooks({ posted_by: userId, is_active: true, limit });
}

export async function getUserPostedBooks(userId, limit = 12) {
  return await getBooks({ owner_type: "user", posted_by: userId, is_active: true, limit });
}

export async function getUserArchivedBooks(userId, limit = 12) {
  return await getBooks({ owner_type: "user", posted_by: userId, is_active: false, limit });
}

export async function createBook(bookData) {
  const { data } = await http.post(API_ENDPOINTS.BOOKS.CREATE, bookData, withIdempotency());
  invalidateBookCaches();
  return {
    book: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? "Book created successfully",
    raw: data,
  };
}

export async function patchBook(bookId, bookData) {
  const { data } = await http.patch(
    `${API_ENDPOINTS.BOOKS.DETAIL}/${bookId}/`,
    bookData,
    withIdempotency(),
  );
  invalidateBookCaches();
  return {
    book: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? "Book updated successfully",
    raw: data,
  };
}

export async function deleteBook(bookId) {
  const { data } = await http.delete(`${API_ENDPOINTS.BOOKS.DETAIL}/${bookId}/`, withIdempotency());
  invalidateBookCaches();
  return {
    success: data?.success === true,
    message: data?.message ?? "Book deleted successfully",
    raw: data,
  };
}

export async function likeBook(bookId) {
  const { data } = await http.post(API_ENDPOINTS.BOOKS.LIKE, { book_id: bookId });
  // Backend returns 'Liked' or 'Unliked' in result field
  const isLiked = data?.result === "Liked";
  // Wishlist (/liked/) is TTL=0 today so doesn't need clearing, but the
  // book detail (/book/<id>/) caches like_count — drop it so the next
  // detail view shows the new tally.
  invalidateBookCaches();
  return {
    success: data?.success === true,
    message: data?.result ?? "Book liked successfully",
    is_liked: isLiked,
    raw: data,
  };
}

export async function getLikedBooks(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.BOOKS.LIKED, { params });
  const { result: books, count, success, raw } = normalizeListResponse(data);
  return { books, count, success, raw };
}

export async function getBookComments(bookId, params = {}) {
  const { data } = await http.get(API_ENDPOINTS.BOOKS.COMMENT.LIST, {
    params: { book: bookId, ...params },
  });
  const { result: comments, count, success, raw } = normalizeListResponse(data);
  return { comments, count, success, raw };
}

export async function createBookComment(bookId, comment, parentId = null) {
  const payload = { book: bookId, comment };
  if (parentId) payload.parent = parentId;

  const { data } = await http.post(API_ENDPOINTS.BOOKS.COMMENT.CREATE, payload, withIdempotency());
  invalidateBookCaches();
  return {
    comment: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? "Comment created successfully",
    raw: data,
  };
}

export async function likeComment(commentId) {
  const { data } = await http.post(API_ENDPOINTS.BOOKS.COMMENT.LIKE, { comment_id: commentId });
  const isLiked = data?.result === "Liked";
  invalidateBookCaches();
  return {
    success: data?.success === true,
    message: data?.result ?? data?.message ?? "Comment liked successfully",
    is_liked: isLiked,
    raw: data,
  };
}

export async function deleteComment(commentId) {
  const { data } = await http.delete(
    `${API_ENDPOINTS.BOOKS.COMMENT.DELETE}/${commentId}/`,
    withIdempotency(),
  );
  invalidateBookCaches();
  return {
    success: data?.success === true,
    message: data?.message ?? "Comment deleted successfully",
    raw: data,
  };
}
