import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

// Get book categories
export async function getBookCategories(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.BOOKS.CATEGORIES, { params });
  return {
    categories: data?.result || data?.results || [],
    count: data?.count || (data?.result?.length || 0),
    next: data?.next || null,
    previous: data?.previous || null,
    raw: data,
  };
}

// Get single category by ID
export async function getCategoryById(id) {
  const { data } = await http.get(`api/v1/book/categories/${id}/`);
  return {
    category: data || null,
    raw: data,
  };
}