/**
 * Tiny event bus for opening the SellerRegistrationModal from anywhere
 * in the React tree without prop-drilling. Same pattern as `auth:required`
 * (see src/components/auth/AuthRequiredModal.jsx): the modal mounts once
 * in the layout, header/footer/cta buttons just dispatch the event.
 */
const EVENT = "seller-modal:open";

export function openSellerModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

export const SELLER_MODAL_EVENT = EVENT;
