import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse } from "@/utils/normalizeResponse";

export async function getBanners(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.BASE.BANNERS, { params });
  const { result: banners, count, next, previous, raw } = normalizeListResponse(data);
  return { banners, count, next, previous, raw };
}

export async function getBannerById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.BASE.BANNER_DETAIL}/${id}/`);
  return { banner: data ?? null, raw: data };
}
