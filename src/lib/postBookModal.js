/**
 * Event bus for opening the BookCreateModal from anywhere in the tree.
 * Mirror of `sellerModal.js` — the floating "post a book" FAB lives
 * outside the page tree, so prop-drilling the open state would mean a
 * context provider; an event keeps the FAB completely decoupled.
 */
const EVENT = "post-book-modal:open";

export function openPostBookModal() {
  if (typeof window === "undefined") return;
  // No shopId → personal listing (the modal still lets owners pick a shop).
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { shopId: null } }));
}

/**
 * Open the modal pre-attributed to a specific shop — used from the owner's
 * shop page so "add book here" lists under the shop automatically. The backend
 * still validates that the caller owns/staffs the shop.
 */
export function openPostBookFromShopModal(shopId) {
  if (typeof window === "undefined" || !shopId) return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { shopId: String(shopId) } }));
}

export const POST_BOOK_MODAL_EVENT = EVENT;

// Pre-question: "sell a single book or build a collection?". The entry points
// (FAB, shop "add" button) open this chooser, which then dispatches the book
// or collection modal event. Carries an optional shopId for shop context.
const CHOOSER_EVENT = "post-book-chooser:open";

export function openPostChooser(shopId = null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CHOOSER_EVENT, { detail: { shopId: shopId ? String(shopId) : null } }),
  );
}

export const POST_BOOK_CHOOSER_EVENT = CHOOSER_EVENT;
