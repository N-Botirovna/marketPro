import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";

// Create new comment
export async function createComment(commentData) {
  const { data } = await http.post(API_ENDPOINTS.COMMENTS.CREATE, commentData);
  return {
    comment: data?.result || data || null,
    success: data?.success || false,
    message: data?.message || 'Comment created successfully',
    raw: data,
  };
}

// Get comments for a book/post
export async function getComments(targetId, targetType = 'book', params = {}) {
  const { data } = await http.get(`api/v1/comment/list/`, { 
    params: { 
      target_id: targetId, 
      target_type: targetType,
      ...params 
    } 
  });
  return {
    comments: data?.result || data?.results || [],
    count: data?.count || (data?.result?.length || 0),
    next: data?.next || null,
    previous: data?.previous || null,
    raw: data,
  };
}

// Update comment
export async function updateComment(commentId, commentData) {
  const { data } = await http.put(`api/v1/comment/update/${commentId}/`, commentData);
  return {
    comment: data?.result || data || null,
    success: data?.success || false,
    message: data?.message || 'Comment updated successfully',
    raw: data,
  };
}

// Delete comment
export async function deleteComment(commentId) {
  const { data } = await http.delete(`api/v1/comment/delete/${commentId}/`);
  return {
    success: data?.success || false,
    message: data?.message || 'Comment deleted successfully',
    raw: data,
  };
}
