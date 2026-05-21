"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SHARE_SHEET_EVENT } from "@/lib/shareSheet";

// Lazy: the sheet chunk stays off the wire until the first share. After
// that we keep the import resolved so subsequent opens are instant.
const ShareSheet = dynamic(() => import("./ShareSheet"), {
  ssr: false,
  loading: () => null,
});

export default function ShareSheetMount() {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handler = (event) => {
      setMounted(true);
      setPayload(event?.detail || null);
      setOpen(true);
    };
    window.addEventListener(SHARE_SHEET_EVENT, handler);
    return () => window.removeEventListener(SHARE_SHEET_EVENT, handler);
  }, []);

  if (!mounted) return null;
  return <ShareSheet open={open} payload={payload} onClose={() => setOpen(false)} />;
}
