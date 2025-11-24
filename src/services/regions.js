import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

// Get regions with districts
export async function getRegions(params = {}) {
  // Filter out empty parameters
  const cleanParams = {};
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== '' && value !== null && value !== undefined) {
      cleanParams[key] = value;
    }
  });
  
  const { data } = await http.get(API_ENDPOINTS.BASE.REGIONS, { params: cleanParams });

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
    success: data?.success || false,
    raw: data,
  };
}

// Get single region by ID
export async function getRegionById(id) {
  const { data } = await http.get(`api/v1/base/regions/${id}/`);
  return {
    region: data || null,
    raw: data,
  };
}
