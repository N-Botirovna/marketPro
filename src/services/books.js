import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse, normalizeItem } from "@/utils/normalizeResponse";

export async function getBooks(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.BOOKS.LIST, { params });
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
  return await getBooks({ publication_year_min: minYear, publication_year_max: maxYear, is_active: true, limit });
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
  return await getBooks({ owner_type: 'user', posted_by: userId, is_active: true, limit });
}

export async function getUserArchivedBooks(userId, limit = 12) {
  return await getBooks({ owner_type: 'user', posted_by: userId, is_active: false, limit });
}

export async function createBook(bookData) {
  const { data } = await http.post(API_ENDPOINTS.BOOKS.CREATE, bookData);
  return {
    book: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? 'Book created successfully',
    raw: data,
  };
}

export async function updateBook(bookId, bookData) {
  const { data } = await http.put(`${API_ENDPOINTS.BOOKS.UPDATE}${bookId}/`, bookData);
  return {
    book: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? 'Book updated successfully',
    raw: data,
  };
}

export async function patchBook(bookId, bookData) {
  const { data } = await http.patch(`${API_ENDPOINTS.BOOKS.DETAIL}/${bookId}/`, bookData);
  return {
    book: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? 'Book updated successfully',
    raw: data,
  };
}

export async function deleteBook(bookId) {
  const { data } = await http.delete(`${API_ENDPOINTS.BOOKS.DETAIL}/${bookId}/`);
  return {
    success: data?.success === true,
    message: data?.message ?? 'Book deleted successfully',
    raw: data,
  };
}

export async function likeBook(bookId) {
  const { data } = await http.post(API_ENDPOINTS.BOOKS.LIKE, { book_id: bookId });
  // Backend returns 'Liked' or 'Unliked' in result field
  const isLiked = data?.result === 'Liked';
  return {
    success: data?.success === true,
    message: data?.result ?? 'Book liked successfully',
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

  const { data } = await http.post(API_ENDPOINTS.BOOKS.COMMENT.CREATE, payload);
  return {
    comment: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? 'Comment created successfully',
    raw: data,
  };
}

export async function likeComment(commentId) {
  const { data } = await http.post(API_ENDPOINTS.BOOKS.COMMENT.LIKE, { comment_id: commentId });
  // Backend returns 'Liked' or 'Unliked'
  const isLiked = data?.result === 'Liked' || data?.message === 'Liked';
  return {
    success: data?.success === true,
    message: data?.result ?? data?.message ?? 'Comment liked successfully',
    is_liked: isLiked,
    raw: data,
  };
}

export async function deleteComment(commentId) {
  const { data } = await http.delete(`${API_ENDPOINTS.BOOKS.COMMENT.DELETE}/${commentId}/`);
  return {
    success: data?.success === true,
    message: data?.message ?? 'Comment deleted successfully',
    raw: data,
  };
}
