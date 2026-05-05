import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse } from "@/utils/normalizeResponse";

const CATEGORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const categoriesCache = new Map();

const serializeParams = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null
  );

  if (entries.length === 0) {
    return "__default__";
  }

  return JSON.stringify(
    entries
      .sort(([a], [b]) => (a > b ? 1 : a < b ? -1 : 0))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {})
  );
};

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

      categoriesCache.set(cacheKey, {
        data: payload,
        timestamp: Date.now(),
      });

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