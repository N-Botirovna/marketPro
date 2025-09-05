import http from "@/lib/http";

// Get banners
export async function getBanners(params = {}) {
  const { data } = await http.get("api/v1/base/banners/", { params });
  return {
    banners: data?.results || [],
    count: data?.count || 0,
    next: data?.next || null,
    previous: data?.previous || null,
    raw: data,
  };
}

// Get single banner by ID
export async function getBannerById(id) {
  const { data } = await http.get(`api/v1/base/banners/${id}/`);
  return {
    banner: data || null,
    raw: data,
  };
}
