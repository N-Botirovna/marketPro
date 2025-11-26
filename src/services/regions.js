import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

const REGION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const regionsCache = new Map();

const serializeParams = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
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

// Get regions with districts (memoized to prevent duplicate requests on the client)
export async function getRegions(params = {}) {
  // Filter out empty parameters
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== "" && value !== null && value !== undefined) {
      cleanParams[key] = value;
    }
  });

  const cacheKey = serializeParams(cleanParams);
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
    .get(API_ENDPOINTS.BASE.REGIONS, { params: cleanParams })
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
        success: data?.success || false,
        raw: data,
      };

      regionsCache.set(cacheKey, {
        data: payload,
        timestamp: Date.now(),
      });

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
  const { data } = await http.get(`api/v1/base/regions/${id}/`);
  return {
    region: data || null,
    raw: data,
  };
}
