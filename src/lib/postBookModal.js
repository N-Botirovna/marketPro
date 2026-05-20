/**
 * Event bus for opening the BookCreateModal from anywhere in the tree.
 * Mirror of `sellerModal.js` — the floating "post a book" FAB lives
 * outside the page tree, so prop-drilling the open state would mean a
 * context provider; an event keeps the FAB completely decoupled.
 */
const EVENT = "post-book-modal:open";

export function openPostBookModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

export const POST_BOOK_MODAL_EVENT = EVENT;
