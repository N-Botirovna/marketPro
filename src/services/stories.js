import http, { clearHttpCache } from "@/lib/http";
import { API_ENDPOINTS } from "@/config";
import { normalizeListResponse } from "@/utils/normalizeResponse";
import { withIdempotency } from "@/lib/idempotency";

/**
 * Stories — Telegram-style ephemeral promos.
 *
 * Backend contract (extensible polymorphic target):
 *   {
 *     id: number,
 *     created_by: number,
 *     target_kind: 'book' | 'shop' | 'book_comment' | …,
 *     target_id: number,
 *     target: {                  // frozen snapshot at creation time
 *       kind: same as target_kind,
 *       id: number,              // the source id (for navigation)
 *       title: string,
 *       subtitle: string | null,
 *       picture: string | null,
 *       …                        // kind-specific extras (e.g. book_id on
 *                                //   a book_comment story)
 *     },
 *     expires_at: ISO,
 *     created_at: ISO,
 *   }
 *
 * New kinds are added on the backend (`StoryTargetKind` + `targets.py`)
 * and surface here automatically — only the click-handler needs a new
 * branch in `getStoryHref` below.
 */

export const STORY_TARGET_KIND = Object.freeze({
  BOOK: "book",
  SHOP: "shop",
  BOOK_COMMENT: "book_comment",
});

/**
 * Return the detail-page href for a story so callers (story bar, viewer,
 * profile preview) don't repeat the kind switch. New kinds: add a case.
 */
export function getStoryHref(story) {
  const target = story?.target || {};
  switch (target.kind) {
    case STORY_TARGET_KIND.BOOK:
      return target.id ? `/book-details/${target.id}` : null;
    case STORY_TARGET_KIND.SHOP:
      return target.id ? `/shops/${target.id}` : null;
    case STORY_TARGET_KIND.BOOK_COMMENT:
      // Comments live on book detail; jump to the book and let the page
      // anchor to the comment if it wants to.
      return target.book_id ? `/book-details/${target.book_id}` : null;
    default:
      return null;
  }
}

export async function getStories({ shopId, ownerId, targetKind, limit = 50 } = {}) {
  const params = { limit };
  if (shopId) params.shop = shopId;
  if (ownerId) params.owner = ownerId;
  if (targetKind) params.target_kind = targetKind;

  const { data } = await http.get(API_ENDPOINTS.STORIES.LIST, { params });
  const { result: stories, count, next, previous, raw } = normalizeListResponse(data);
  return { stories, count, next, previous, raw };
}

/**
 * Create a story. `targetKind` must be one of `STORY_TARGET_KIND.*`.
 * Backend rejects with:
 *   - 403 code='not_eligible'        → user can't post stories yet
 *   - 403 code='target_not_owned'    → user doesn't own this target
 *   - 429 code='daily_limit_reached' → over the daily cap
 *
 * Map the response code into a UX message via mapValidationError.
 */
export async function createStory({ targetKind, targetId } = {}) {
  const { data } = await http.post(
    API_ENDPOINTS.STORIES.LIST,
    { target_kind: targetKind, target_id: targetId },
    withIdempotency(),
  );
  try {
    clearHttpCache("/stories");
  } catch {
    /* ignore */
  }
  return {
    success: data?.success !== false,
    story: data?.result || null,
    message: data?.message || null,
    code: data?.code || null,
  };
}

export async function deleteStory(storyId) {
  await http.delete(`${API_ENDPOINTS.STORIES.DETAIL}/${storyId}/`, withIdempotency());
  try {
    clearHttpCache("/stories");
  } catch {
    /* ignore */
  }
  return { success: true };
}
