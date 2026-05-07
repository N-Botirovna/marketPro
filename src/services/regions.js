import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

// Caching handled by http.js (24-hour TTL for /regions endpoints)
export async function getRegions(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.BASE.REGIONS, { params });
  const normalizedRegions = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data?.result)
    ? data.result
    : Array.isArray(data)
    ? data
    : [];

  return {
    regions: normalizedRegions,
    count: data?.count || normalizedRegions.length || 0,
    next: data?.next || null,
    previous: data?.previous || null,
    success: data?.success === true,
    raw: data,
  };
}

export async function getRegionById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.BASE.REGION_DETAIL}/${id}/`);
  return { region: data || null, raw: data };
}
