import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

// Get regions with districts
export async function getRegions(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.BASE.REGIONS, { params });
  return {
    regions: data?.result || [],
    count: data?.count || 0,
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
