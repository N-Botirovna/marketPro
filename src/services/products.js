import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

// Get all products
export async function getProducts(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
  return {
    products: data?.products || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    raw: data,
  };
}

// Get single product by ID
export async function getProductById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.PRODUCTS.DETAIL}/${id}`);
  return {
    product: data?.product || null,
    raw: data,
  };
}

// Search products
export async function searchProducts(query, params = {}) {
  const searchParams = { q: query, ...params };
  const { data } = await http.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params: searchParams });
  return {
    products: data?.products || [],
    total: data?.total || 0,
    query,
    raw: data,
  };
}

// Get product categories
export async function getCategories() {
  const { data } = await http.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
  return {
    categories: data?.categories || [],
    raw: data,
  };
}

// Get products by category
export async function getProductsByCategory(categoryId, params = {}) {
  const { data } = await http.get(`${API_ENDPOINTS.PRODUCTS.CATEGORIES}/${categoryId}/products`, { params });
  return {
    products: data?.products || [],
    category: data?.category || null,
    total: data?.total || 0,
    raw: data,
  };
}
