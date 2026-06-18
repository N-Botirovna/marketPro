/**
 * Event bus for opening the CollectionCreateModal (bundle wizard) from
 * anywhere — mirror of postBookModal.js.
 */
const EVENT = "post-collection-modal:open";

export function openPostCollectionModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { shopId: null } }));
}

/** Open the bundle wizard pre-attributed to a shop the user owns/staffs. */
export function openPostCollectionFromShopModal(shopId) {
  if (typeof window === "undefined" || !shopId) return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { shopId: String(shopId) } }));
}

export const POST_COLLECTION_MODAL_EVENT = EVENT;
