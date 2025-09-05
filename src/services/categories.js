import http from "@/lib/http";

// Get book categories
export async function getBookCategories(params = {}) {
  const { data } = await http.get("api/v1/book/categories", { params });
  return {
    categories: data?.results || [],
    count: data?.count || 0,
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