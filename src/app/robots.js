import { getSiteUrl } from "@/config/env";

/**
 * Next.js MetadataRoute robots — replaces a static public/robots.txt.
 * Crawl budget on a book marketplace is precious: we have thousands of
 * book detail pages that deserve every crawl visit. This file keeps
 * Googlebot / Yandex / Bing away from the surfaces with zero SEO value:
 *
 *   - /account, /wishlist        user-specific dashboards
 *   - /auth/*                    one-time auth ticket handlers
 *   - /(auth)/login              already index-blocked at the page level,
 *                                belt-and-braces
 *   - /api, /_next               internal/server endpoints
 *   - /vendor, /vendor-two*      legacy template debris (to be deleted)
 *   - /assets                    no need to index static binaries
 *
 * Yandex needs the explicit Host directive in robots.txt — Next.js'
 * MetadataRoute schema doesn't support it directly, so we'll emit it via
 * the `host` field which Next 15+ forwards to the rendered file.
 */
export default function robots() {
  const base = getSiteUrl().replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/wishlist",
          "/auth/",
          "/*/account",
          "/*/wishlist",
          "/*/auth/",
          "/*/(auth)/",
          "/*/login",
          "/api/",
          "/_next/",
          "/admin/",
          "/vendor",
          "/vendor-two",
          "/vendor-two-details",
          "/*/vendor",
          "/*/vendor-two",
          "/*/vendor-two-details",
          // Block the search-result variants of community pages — the
          // canonical landing pages live at /community/{type} without
          // params, the filter combinations multiply crawl budget for
          // near-duplicate listings.
          "/*/community/*?*",
          "/*/shops?*",
        ],
      },
      {
        // Be a little stricter with aggressive crawlers from US/EU LLM
        // training pipelines that don't drive any traffic but still
        // hit every page. Leave Google/Bing/Yandex/AppleBot untouched.
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "anthropic-ai",
          "CCBot",
          "PerplexityBot",
          "Google-Extended",
        ],
        allow: [
          "/",
          "/uz/book-details/",
          "/ru/book-details/",
          "/en/book-details/",
          "/uz/shops/",
          "/ru/shops/",
          "/en/shops/",
          "/uz/faq",
          "/ru/faq",
          "/en/faq",
          "/uz/policies",
          "/ru/policies",
          "/en/policies",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
