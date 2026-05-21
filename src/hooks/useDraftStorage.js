"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useDraftStorage — persist a form's transient state to localStorage so a
 * user who closes the modal mid-flight can resume where they left off.
 *
 * Light-weight alternative to a full FSM/XState refactor. Backend-FSM parity
 * is preserved in spirit: the "identity" fields (e.g. `editBook.id`) are kept
 * out of the draft via `excludeKeys` so editing book A and switching to book
 * B doesn't bleed state.
 *
 * Files (Blob/File) are dropped on save — localStorage cannot serialize them,
 * and re-attaching them is a user concern anyway.
 *
 * Usage:
 *   const { draft, save, clear, hasDraft } = useDraftStorage(
 *     "book-create-draft",
 *     formData,
 *     { ttlMs: 24 * 60 * 60 * 1000, excludeKeys: ["picture"] }
 *   );
 *
 *   useEffect(() => { if (draft) setFormData(draft); }, [draft]);
 *   useEffect(() => { save(formData); }, [formData]);
 *   // After successful submit:
 *   clear();
 */

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const SAVE_DEBOUNCE_MS = 400;

function stripUnserializable(obj, excludeKeys) {
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (excludeKeys.includes(key)) continue;
    if (value instanceof File || value instanceof Blob) continue;
    if (typeof value === "function") continue;
    out[key] = value;
  }
  return out;
}

export function useDraftStorage(key, data, options = {}) {
  const { ttlMs = DEFAULT_TTL_MS, enabled = true, excludeKeys = [] } = options;

  const [draft, setDraft] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const saveTimeoutRef = useRef(null);
  const restoredRef = useRef(false);

  // Restore on mount
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (restoredRef.current) return;
    restoredRef.current = true;

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      const { savedAt, payload } = parsed;
      if (typeof savedAt !== "number" || !payload) return;

      if (Date.now() - savedAt > ttlMs) {
        window.localStorage.removeItem(key);
        return;
      }

      setDraft(payload);
      setHasDraft(true);
    } catch {
      // Corrupt entry — drop it silently
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* noop */
      }
    }
  }, [key, ttlMs, enabled]);

  // Debounced save when `data` changes
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;
    if (data == null) return undefined;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const payload = stripUnserializable(data, excludeKeys);
        if (!payload || Object.keys(payload).length === 0) return;
        window.localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), payload }));
      } catch {
        // Quota exceeded or storage disabled — silent
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [key, data, enabled, excludeKeys]);

  function clear() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* noop */
    }
    setDraft(null);
    setHasDraft(false);
  }

  function save(snapshot) {
    if (!enabled || typeof window === "undefined") return;
    try {
      const payload = stripUnserializable(snapshot, excludeKeys);
      window.localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), payload }));
    } catch {
      /* noop */
    }
  }

  return { draft, hasDraft, clear, save };
}
