"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "@/i18n/navigation";
import { isAuthenticated, isRefreshTokenExpired } from "@/services/auth";
import { SELLER_MODAL_EVENT } from "@/lib/sellerModal";

// Lazy-load the actual ~1k-line form only on first open. Until the user
// clicks any "Kitob do'kon ochish" button anywhere on the site, the modal
// chunk + its MUI surface stay off the wire entirely.
const SellerRegistrationModal = dynamic(() => import("./SellerRegistrationModal"), {
  ssr: false,
  loading: () => null,
});

export default function SellerModalMount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // `mounted` stays `true` after the first open so the modal can play its
  // exit animation when closed — but it never mounts before the first event,
  // so the layout pays zero cost until the user wants the form.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handler = () => {
      // Creating a shop requires a session — the backend rejects anonymous
      // POSTs anyway, so gate here too. Allow if a valid access OR refresh
      // token exists (the request refreshes access when needed); otherwise
      // send them to login instead of opening a form they can't submit.
      if (!isAuthenticated() && isRefreshTokenExpired()) {
        router.push("/login");
        return;
      }
      setMounted(true);
      setOpen(true);
    };
    window.addEventListener(SELLER_MODAL_EVENT, handler);
    return () => window.removeEventListener(SELLER_MODAL_EVENT, handler);
  }, [router]);

  if (!mounted) return null;
  return <SellerRegistrationModal show={open} onHide={() => setOpen(false)} />;
}
