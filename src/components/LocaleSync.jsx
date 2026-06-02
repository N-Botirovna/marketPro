"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/services/auth";

const VALID = ["uz", "ru", "en", "kaa"];

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

    const applyLocale = (lang) => {
      if (alive && VALID.includes(lang) && lang !== locale) {
        router.replace(pathname, { locale: lang });
      }
    };

    let pref = null;
    try {
      pref = localStorage.getItem("preferred_locale");
    } catch {
      /* storage blocked */
    }
    if (VALID.includes(pref)) {
      applyLocale(pref);
      return undefined;
    }

    // No cached preference yet — read the account language from /me once.
    if (fetchedRef.current) return undefined;
    fetchedRef.current = true;
    getUserProfile()
      .then(({ user }) => {
        const lang = user?.language;
        if (VALID.includes(lang)) {
          try {
            localStorage.setItem("preferred_locale", lang);
          } catch {
            /* ignore */
          }
          applyLocale(lang);
        }
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [isAuthenticated, isLoading, locale, pathname, router]);

  return null;
}
