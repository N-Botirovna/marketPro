// ──────────────────────────────────────────────────────────────────────────
// PARKED — backend blog app is disabled (back-end/config/urls.py:31).
// All endpoints in this file will return 404 until the backend re-enables
// /api/v1/post/. Do NOT import these functions in user-facing components.
// Re-enable plan: uncomment include('blog.urls') in back-end + fix
// PostCommnet→PostComment typo, then remove this header.
// ──────────────────────────────────────────────────────────────────────────
import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse, normalizeItem } from "@/utils/normalizeResponse";
import { withIdempotency } from "@/lib/idempotency";

export async function getPosts(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.POSTS.LIST, { params });
  const { result: posts, count, next, previous, raw } = normalizeListResponse(data);
  return { posts, count, next, previous, raw };
}

export async function getUserPosts(userId, params = {}) {
  return await getPosts({ posted_by: userId, ...params });
}

export async function getPostById(id) {
  const { data } = await http.get(`${API_ENDPOINTS.POSTS.DETAIL}/${id}/`);
  return { post: normalizeItem(data), raw: data };
}

export async function createPost(postData) {
  const { data } = await http.post(API_ENDPOINTS.POSTS.CREATE, postData, withIdempotency());
  return {
    post: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? "Post created successfully",
    raw: data,
  };
}

export async function updatePost(postId, postData) {
  const { data } = await http.put(
    `${API_ENDPOINTS.POSTS.UPDATE}${postId}/`,
    postData,
    withIdempotency(),
  );
  return {
    post: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? "Post updated successfully",
    raw: data,
  };
}

export async function deletePost(postId) {
  const { data } = await http.delete(`${API_ENDPOINTS.POSTS.DELETE}${postId}/`, withIdempotency());
  return {
    success: data?.success === true,
    message: data?.message ?? "Post deleted successfully",
    raw: data,
  };
}
