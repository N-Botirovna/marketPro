import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

// Get all vendors
export async function getVendors(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.VENDORS.LIST, { params });
  return {
    vendors: data?.vendors || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    raw: data,
  };
}


export async function getVendorById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.VENDORS.DETAIL}/${id}`);
  return {
    vendor: data?.vendor || null,
    raw: data,
  };
}

// Get vendor products
export async function getVendorProducts(vendorId, params = {}) {
  const { data } = await http.get(`${API_ENDPOINTS.VENDORS.DETAIL}/${vendorId}/products`, { params });
  return {
    products: data?.products || [],
    vendor: data?.vendor || null,
    total: data?.total || 0,
    raw: data,
  };
}

// Search vendors
export async function searchVendors(query, params = {}) {
  const searchParams = { q: query, ...params };
  const { data } = await http.get(`${API_ENDPOINTS.VENDORS.LIST}/search`, { params: searchParams });
  return {
    vendors: data?.vendors || [],
    total: data?.total || 0,
    query,
    raw: data,
  };
}
