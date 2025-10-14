import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

// Get posts
export async function getPosts(params = {}) {
  const { data } = await http.get(API_ENDPOINTS.POSTS.LIST, { params });
  return {
    posts: data?.result || data?.results || [],
    count: data?.count || (data?.result?.length || 0),
    next: data?.next || null,
    previous: data?.previous || null,
    raw: data,
  };
}

// Get user's posts
export async function getUserPosts(userId, params = {}) {
  return await getPosts({ 
    posted_by: userId,
    ...params 
  });
}

// Get single post by ID
export async function getPostById(id) {
  const { data } = await http.get(`api/v1/post/detail/${id}/`);
  return {
    post: data?.result || data || null,
    raw: data,
  };
}

// Create new post
export async function createPost(postData) {
  const { data } = await http.post(API_ENDPOINTS.POSTS.CREATE, postData);
  return {
    post: data?.result || data || null,
    success: data?.success || false,
    message: data?.message || 'Post created successfully',
    raw: data,
  };
}

// Update existing post
export async function updatePost(postId, postData) {
  const { data } = await http.put(`${API_ENDPOINTS.POSTS.UPDATE}${postId}/`, postData);
  return {
    post: data?.result || data || null,
    success: data?.success || false,
    message: data?.message || 'Post updated successfully',
    raw: data,
  };
}

// Delete post
export async function deletePost(postId) {
  const { data } = await http.delete(`${API_ENDPOINTS.POSTS.DELETE}${postId}/`);
  return {
    success: data?.success || false,
    message: data?.message || 'Post deleted successfully',
    raw: data,
  };
}
