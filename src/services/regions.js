import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { serializeParams } from "@/utils/serializeParams";

const REGION_CACHE_TTL = 5 * 60 * 1000;
const REGION_CACHE_MAX = 20;
const regionsCache = new Map();

// Get regions with districts (memoized to prevent duplicate requests on the client)
export async function getRegions(params = {}) {
  const cacheKey = serializeParams(params);
  const cachedEntry = regionsCache.get(cacheKey);
  const now = Date.now();

  if (cachedEntry) {
    if (cachedEntry.data && now - cachedEntry.timestamp < REGION_CACHE_TTL) {
      return cachedEntry.data;
    }
    if (cachedEntry.promise) {
      return cachedEntry.promise;
    }
  }

  const requestPromise = http
    .get(API_ENDPOINTS.BASE.REGIONS, { params })
    .then(({ data }) => {
      const normalizedRegions = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.result)
        ? data.result
        : Array.isArray(data)
        ? data
        : [];

      const payload = {
        regions: normalizedRegions,
        count: data?.count || normalizedRegions.length || 0,
        next: data?.next || null,
        previous: data?.previous || null,
        success: data?.success === true,
        raw: data,
      };

      if (regionsCache.size >= REGION_CACHE_MAX) {
        regionsCache.delete(regionsCache.keys().next().value);
      }
      regionsCache.set(cacheKey, { data: payload, timestamp: Date.now() });

      return payload;
    })
    .catch((error) => {
      regionsCache.delete(cacheKey);
      throw error;
    });

  regionsCache.set(cacheKey, { promise: requestPromise });

  return requestPromise;
}

// Get single region by ID
export async function getRegionById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.BASE.REGION_DETAIL}/${id}/`);
  return {
    region: data || null,
    raw: data,
  };
}
