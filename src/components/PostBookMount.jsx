"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { POST_BOOK_MODAL_EVENT } from "@/lib/postBookModal";

// Lazy: the 1k-line modal stays off the wire until the user actually
// taps the floating "post a book" button. After the first open we keep
// the import resolved so subsequent opens are instant.
const BookCreateModal = dynamic(() => import("./BookCreateModal"), {
  ssr: false,
  loading: () => null,
});

export default function PostBookMount() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handler = () => {
      setMounted(true);
      setOpen(true);
    };
    window.addEventListener(POST_BOOK_MODAL_EVENT, handler);
    return () => window.removeEventListener(POST_BOOK_MODAL_EVENT, handler);
  }, []);

  if (!mounted) return null;
  return (
    <BookCreateModal
      isOpen={open}
      onClose={() => setOpen(false)}
      onSuccess={() => setOpen(false)}
    />
  );
}
