import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse } from "@/utils/normalizeResponse";

// Caching handled by http.js (1-hour TTL for /categories endpoints)
export async function getBookCategories(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.BOOKS.CATEGORIES, { params });
  const { result, count, next, previous, raw } = normalizeListResponse(data);
  return { categories: result, count, next, previous, raw };
}

export async function getCategoryById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.BOOKS.CATEGORY_DETAIL}/${id}/`);
  return { category: data || null, raw: data };
}

export async function getBookSubcategories(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.BOOKS.SUBCATEGORIES, { params });
  const { result: subcategories, count, next, previous, raw } = normalizeListResponse(data);
  return { subcategories, count, next, previous, raw };
}
