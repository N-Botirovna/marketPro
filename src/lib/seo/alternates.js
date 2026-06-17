/**
 * Single source of truth for a page's `alternates` metadata (canonical +
 * hreflang). Every locale-prefixed route differs only by its `/{locale}`
 * segment, so callers pass the locale-agnostic `suffix` (the path *after*
 * the locale) and get back the full `alternates` object Next.js expects.
 *
 *   buildAlternates("uz", "community/all")
 *   → { canonical: "https://…/uz/community/all",
 *       languages: { uz: "…/uz/community/all", ru: "…/ru/community/all",
 *                    en: …, kaa: …, "x-default": "…/uz/community/all" } }
 *
 * hreflang tells Google these are the same page in different languages
 * (no duplicate-content penalty); x-default points at the uz canonical.
 * Replaces the per-page `buildLanguageAlternates` copies so the 4-locale
 * list can never drift between pages.
 */
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/config/env";

const SITE_URL = getSiteUrl();
const DEFAULT_LOCALE = routing.defaultLocale || "uz";

export function buildAlternates(locale, suffix = "") {
  const clean = suffix ? `/${String(suffix).replace(/^\/+/, "")}` : "";
  const languages = {};
  for (const loc of routing.locales) {
    languages[loc] = `${SITE_URL}/${loc}${clean}`;
  }
  languages["x-default"] = `${SITE_URL}/${DEFAULT_LOCALE}${clean}`;
  return {
    canonical: `${SITE_URL}/${locale}${clean}`,
    languages,
  };
}

export default buildAlternates;
