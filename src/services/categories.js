import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse } from "@/utils/normalizeResponse";
import { serializeParams } from "@/utils/serializeParams";

const CATEGORY_CACHE_TTL = 5 * 60 * 1000;
const CATEGORY_CACHE_MAX = 20;
const categoriesCache = new Map();

// Get book categories with basic memoization to avoid duplicate network requests
export async function getBookCategories(params = {}) {
  const cacheKey = serializeParams(params);
  const cachedEntry = categoriesCache.get(cacheKey);
  const now = Date.now();

  if (cachedEntry) {
    if (cachedEntry.data && now - cachedEntry.timestamp < CATEGORY_CACHE_TTL) {
      return cachedEntry.data;
    }
    if (cachedEntry.promise) {
      return cachedEntry.promise;
    }
  }

  const requestPromise = http
    .get(API_ENDPOINTS.BOOKS.CATEGORIES, { params })
    .then(({ data }) => {
      const { result, count, next, previous, raw } = normalizeListResponse(data);
      const payload = { categories: result, count, next, previous, raw };

      if (categoriesCache.size >= CATEGORY_CACHE_MAX) {
        categoriesCache.delete(categoriesCache.keys().next().value);
      }
      categoriesCache.set(cacheKey, { data: payload, timestamp: Date.now() });

      return payload;
    })
    .catch((error) => {
      categoriesCache.delete(cacheKey);
      throw error;
    });

  categoriesCache.set(cacheKey, { promise: requestPromise });

  return requestPromise;
}

// Get single category by ID
export async function getCategoryById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.BOOKS.CATEGORY_DETAIL}/${id}/`);
  return {
    category: data || null,
    raw: data,
  };
}

// Get book subcategories
export async function getBookSubcategories(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.BOOKS.SUBCATEGORIES, { params });
  const { result: subcategories, count, next, previous, raw } = normalizeListResponse(data);
  return { subcategories, count, next, previous, raw };
}