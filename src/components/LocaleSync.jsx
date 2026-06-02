"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/services/auth";

// The account `language` (from /me) is the backend Languages enum — stored as
// full words ("russian", "english", "karakalpak", "uzbek"), NOT locale codes.
// `preferred_locale` (set by the switcher) is already a code. Normalize both.
const LANG_TO_LOCALE = {
  uz: "uz",
  uzbek: "uz",
  ru: "ru",
  russian: "ru",
  en: "en",
  english: "en",
  kaa: "kaa",
  karakalpak: "kaa",
  qaraqalpaq: "kaa",
};
const toLocale = (v) => LANG_TO_LOCALE[String(v ?? "").toLowerCase()] || null;

/**
 * Routes a signed-in user to *their* language.
 *
 * Anonymous visitors are left in Uzbek (the routing default with
 * localeDetection off). For an authenticated user the desired locale is:
 *   1. `preferred_locale` in localStorage — set when they switch languages
 *      while logged in (so their web choice sticks), OR
 *   2. their account `language` from `/me` (set during bot onboarding),
 *      cached into `preferred_locale` on first read.
 * If that differs from the URL locale we replace the route to it. Renders
 * nothing.
 */
export default function LocaleSync() {
  const { isAuthenticated, isLoading } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return undefined;
    let alive = true;

    const applyLocale = (loc) => {
      if (alive && loc && loc !== locale) {
        router.replace(pathname, { locale: loc });
      }
    };

    let pref = null;
    try {
      pref = localStorage.getItem("preferred_locale");
    } catch {
      /* storage blocked */
    }
    const prefLoc = toLocale(pref);
    if (prefLoc) {
      applyLocale(prefLoc);
      return undefined;
    }

    // No cached preference yet — read the account language from /me once.
    if (fetchedRef.current) return undefined;
    fetchedRef.current = true;
    getUserProfile()
      .then(({ user }) => {
        const loc = toLocale(user?.language);
        if (loc) {
          try {
            localStorage.setItem("preferred_locale", loc);
          } catch {
            /* ignore */
          }
          applyLocale(loc);
        }
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [isAuthenticated, isLoading, locale, pathname, router]);

  return null;
}
