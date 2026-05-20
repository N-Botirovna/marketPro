"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SELLER_MODAL_EVENT } from "@/lib/sellerModal";

// Lazy-load the actual ~1k-line form only on first open. Until the user
// clicks any "Kitob do'kon ochish" button anywhere on the site, the modal
// chunk + its MUI surface stay off the wire entirely.
const SellerRegistrationModal = dynamic(() => import("./SellerRegistrationModal"), {
  ssr: false,
  loading: () => null,
});

export default function SellerModalMount() {
  const [open, setOpen] = useState(false);
  // `mounted` stays `true` after the first open so the modal can play its
  // exit animation when closed — but it never mounts before the first event,
  // so the layout pays zero cost until the user wants the form.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handler = () => {
      setMounted(true);
      setOpen(true);
    };
    window.addEventListener(SELLER_MODAL_EVENT, handler);
    return () => window.removeEventListener(SELLER_MODAL_EVENT, handler);
  }, []);

  if (!mounted) return null;
  return <SellerRegistrationModal show={open} onHide={() => setOpen(false)} />;
}
