import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse, normalizeItem } from "@/utils/normalizeResponse";

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
  const { data } = await http.post(API_ENDPOINTS.POSTS.CREATE, postData);
  return {
    post: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? 'Post created successfully',
    raw: data,
  };
}

export async function updatePost(postId, postData) {
  const { data } = await http.put(`${API_ENDPOINTS.POSTS.UPDATE}${postId}/`, postData);
  return {
    post: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? 'Post updated successfully',
    raw: data,
  };
}

export async function deletePost(postId) {
  const { data } = await http.delete(`${API_ENDPOINTS.POSTS.DELETE}${postId}/`);
  return {
    success: data?.success === true,
    message: data?.message ?? 'Post deleted successfully',
    raw: data,
  };
}
