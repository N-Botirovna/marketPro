import http from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse, normalizeItem } from "@/utils/normalizeResponse";

export async function createComment(commentData) {
  const { data } = await http.post(API_ENDPOINTS.COMMENTS.CREATE, commentData);
  return {
    comment: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? 'Comment created successfully',
    raw: data,
  };
}

export async function getComments(targetId, targetType = 'book', params = {}) {
  const { data } = await http.get(API_ENDPOINTS.COMMENTS.LIST, {
    params: { target_id: targetId, target_type: targetType, ...params },
  });
  const { result: comments, count, next, previous, raw } = normalizeListResponse(data);
  return { comments, count, next, previous, raw };
}

export async function updateComment(commentId, commentData) {
  const { data } = await http.put(`${API_ENDPOINTS.COMMENTS.UPDATE}/${commentId}/`, commentData);
  return {
    comment: normalizeItem(data),
    success: data?.success === true,
    message: data?.message ?? 'Comment updated successfully',
    raw: data,
  };
}

export async function deleteComment(commentId) {
  const { data } = await http.delete(`${API_ENDPOINTS.COMMENTS.DELETE}/${commentId}/`);
  return {
    success: data?.success === true,
    message: data?.message ?? 'Comment deleted successfully',
    raw: data,
  };
}
