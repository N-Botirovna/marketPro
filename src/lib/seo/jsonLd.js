/**
 * JSON-LD builders for schema.org. Each function returns a plain object
 * (or null when input is too thin) — the consumer wraps it in a
 * <script type="application/ld+json"> tag and serializes with JSON.stringify.
 *
 * Why builders here and not inline in pages?
 *   - Reused across server (generateMetadata) and client (component head).
 *   - Centralizing schema decisions makes "are we emitting valid JSON-LD?"
 *     a single grep, not 12 different inline shapes.
 *   - Easier to unit-test (no React render needed).
 *
 * Schema choices specifically for a book marketplace:
 *   - book(): `Book` (preferred for individual title) WITH a nested
 *     `Product` `mainEntity` Offer so we hit BOTH the Knowledge-Graph
 *     book entity pipeline AND the Shopping/Offer pipeline. Many
 *     marketplaces emit Product only and miss the book entity entirely.
 *   - localBusiness(): the more specific `BookStore` subtype, falls back
 *     to `Store` for non-book sellers.
 *   - faqPage(): plain `FAQPage` (no `Article` parent — we want the
 *     FAQ rich result, not the Article one).
 */

import { getSiteUrl } from "@/config/env";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { stripHtml, seoTruncate, slugify } from "./text";

const SITE = () => getSiteUrl();

const TG_LANG_MAP = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

function asAbsoluteUrl(path) {
  if (!path) return undefined;
  const p = String(path);
  if (/^https?:\/\//i.test(p)) return p;
  const base = SITE().replace(/\/$/, "");
  return `${base}${p.startsWith("/") ? p : `/${p}`}`;
}

// ── Organization (root layout — site-wide) ─────────────────────────────

export function organizationLd({ locale = "uz" } = {}) {
  const site = SITE();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kitobzor",
    alternateName: ["Kitobzor.uz", "Китобзор"],
    url: site,
    logo: `${site}/assets/images/logo/kitobzor-logo.png`,
    description:
      locale === "ru"
        ? "Kitobzor — маркетплейс книг в Узбекистане: покупайте, продавайте, обменивайте и дарите книги."
        : locale === "en"
          ? "Kitobzor — Uzbekistan's book marketplace: buy, sell, exchange or gift books in one place."
          : "Kitobzor — O'zbekistondagi kitoblar marketplace'i: sotib oling, soting, almashtiring yoki sovg'a qiling.",
    inLanguage: [TG_LANG_MAP.uz, TG_LANG_MAP.ru, TG_LANG_MAP.en],
    sameAs: [
      "https://t.me/kitobzoruz",
      "https://instagram.com/kitobzoruz",
      "https://facebook.com/kitobzoruz",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+998 93 834 01 03",
      areaServed: "UZ",
      availableLanguage: ["Uzbek", "Russian", "English"],
    },
  };
}

// ── WebSite + SearchAction (lets Google surface a sitelinks searchbox) ─

export function webSiteLd({ locale = "uz" } = {}) {
  const site = SITE();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kitobzor",
    url: site,
    inLanguage: TG_LANG_MAP[locale] || TG_LANG_MAP.uz,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site}/${locale}/community/all?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ── Book (book-detail page) ────────────────────────────────────────────

const COVER_TO_BOOK_FORMAT = {
  hard: "https://schema.org/Hardcover",
  soft: "https://schema.org/Paperback",
  paperback: "https://schema.org/Paperback",
  hardcover: "https://schema.org/Hardcover",
  audio: "https://schema.org/AudiobookFormat",
  ebook: "https://schema.org/EBook",
};

const LANG_TO_BCP47 = {
  uz: "uz",
  uzbek: "uz",
  oz: "uz",
  ru: "ru",
  russian: "ru",
  en: "en",
  english: "en",
  kaa: "kaa",
  qq: "kaa",
};

const TYPE_TO_AVAILABILITY = {
  seller: "https://schema.org/InStock",
  sell: "https://schema.org/InStock",
  rent: "https://schema.org/InStock",
  exchange: "https://schema.org/InStock",
  gift: "https://schema.org/InStock",
};

/**
 * Build the schema.org/Book + nested Offer payload for a book detail page.
 * Defensive: returns null if we don't have at least a name — we never
 * want to ship a schema with empty required fields.
 */
export function bookLd({ book, locale = "uz" } = {}) {
  if (!book) return null;
  const name = book[`name_${locale}`] || book.name_uz || book.name || null;
  if (!name) return null;

  const author = book[`author_${locale}`] || book.author_uz || book.author || null;
  const description = seoTruncate(
    book[`description_${locale}`] || book.description_uz || book.description || "",
    300,
  );

  const image = book.picture ? asAbsoluteUrl(resolveMediaUrl(book.picture)) : undefined;
  const inLanguage = LANG_TO_BCP47[(book.language || "").toString().toLowerCase()] || undefined;
  const bookFormat = COVER_TO_BOOK_FORMAT[(book.cover_type || "").toString().toLowerCase()];

  const url = `${SITE()}/${locale}/book-details/${book.id}`;

  const offers =
    book.price != null && book.type !== "gift" && book.type !== "exchange"
      ? {
          "@type": "Offer",
          url,
          priceCurrency: "UZS",
          price: String(book.discount_price ?? book.price),
          availability:
            TYPE_TO_AVAILABILITY[(book.type || "seller").toString().toLowerCase()] ||
            "https://schema.org/InStock",
          itemCondition:
            book.condition === "brand_new" || book.is_used === false
              ? "https://schema.org/NewCondition"
              : "https://schema.org/UsedCondition",
          seller: book.shop?.name
            ? { "@type": "Organization", name: book.shop.name }
            : book.posted_by
              ? {
                  "@type": "Person",
                  name:
                    [book.posted_by.first_name, book.posted_by.last_name]
                      .filter(Boolean)
                      .join(" ") || undefined,
                }
              : undefined,
        }
      : undefined;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${url}#book`,
    name,
    url,
    image,
    description: description || undefined,
    bookFormat,
    inLanguage,
    isbn: book.isbn || undefined,
    numberOfPages: book.pages || undefined,
    datePublished: book.publication_year ? String(book.publication_year) : undefined,
    author: author
      ? {
          "@type": "Person",
          name: author,
          url: `${SITE()}/${locale}/muallif/${slugify(author)}`,
        }
      : undefined,
    aggregateRating:
      book.rating_avg != null && book.rating_count
        ? {
            "@type": "AggregateRating",
            ratingValue: book.rating_avg,
            reviewCount: book.rating_count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    offers,
  };
  return prune(schema);
}

// ── Breadcrumb (every multi-segment page) ──────────────────────────────

/**
 * items: [{ name, url }]
 *   url is path-only or absolute; we resolve to absolute here.
 */
export function breadcrumbLd({ items = [] } = {}) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: asAbsoluteUrl(item.url),
    })),
  };
}

// ── FAQPage (the /faq route) ───────────────────────────────────────────

export function faqPageLd({ items = [] } = {}) {
  const cleaned = items
    .filter((f) => f && f.question && f.answer)
    .map((f) => ({
      "@type": "Question",
      name: stripHtml(f.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtml(f.answer),
      },
    }));
  if (!cleaned.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cleaned,
  };
}

// ── LocalBusiness / BookStore (shop detail) ────────────────────────────

export function localBusinessLd({ shop, locale = "uz" } = {}) {
  if (!shop || !shop.id || !shop.name) return null;
  const url = `${SITE()}/${locale}/shops/${shop.id}`;
  const image = shop.picture ? asAbsoluteUrl(resolveMediaUrl(shop.picture)) : undefined;
  const geo =
    shop.point && Array.isArray(shop.point) && shop.point.length === 2
      ? {
          "@type": "GeoCoordinates",
          latitude: shop.point[1],
          longitude: shop.point[0],
        }
      : shop.point && shop.point.latitude != null
        ? {
            "@type": "GeoCoordinates",
            latitude: shop.point.latitude,
            longitude: shop.point.longitude,
          }
        : undefined;

  return prune({
    "@context": "https://schema.org",
    "@type": "BookStore",
    "@id": `${url}#shop`,
    name: shop.name,
    url,
    image,
    description: seoTruncate(shop.bio || shop.description || "", 300) || undefined,
    telephone: shop.phone_number || undefined,
    address: shop.location_text
      ? {
          "@type": "PostalAddress",
          streetAddress: shop.location_text,
          addressRegion: shop.region?.name,
          addressLocality: shop.district?.name,
          addressCountry: "UZ",
        }
      : undefined,
    geo,
    openingHours: shop.working_hours
      ? translateWorkingHours(shop.working_days, shop.working_hours)
      : undefined,
    aggregateRating:
      shop.star && shop.star > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: shop.star,
            reviewCount: shop.feedback_count || 1,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    sameAs: [shop.telegram, shop.instagram, shop.website].filter(Boolean),
  });
}

// ── ItemList for category / author / community feed pages ──────────────

export function itemListLd({ name, url, items = [], locale = "uz" } = {}) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: asAbsoluteUrl(url),
    itemListElement: items.slice(0, 20).map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE()}/${locale}/book-details/${it.id}`,
      name: it[`name_${locale}`] || it.name_uz || it.name || undefined,
    })),
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────

/**
 * Recursively drop keys whose value is null/undefined/empty-string/array.
 * Google's structured-data validator dislikes empty fields more than
 * absent ones.
 */
function prune(obj) {
  if (Array.isArray(obj)) {
    const cleaned = obj.map(prune).filter((v) => v != null);
    return cleaned.length ? cleaned : undefined;
  }
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      const cleaned = prune(v);
      if (
        cleaned !== undefined &&
        cleaned !== null &&
        cleaned !== "" &&
        !(Array.isArray(cleaned) && cleaned.length === 0)
      ) {
        out[k] = cleaned;
      }
    }
    return Object.keys(out).length ? out : undefined;
  }
  return obj;
}

const DAY_MAP = {
  mon: "Mo",
  tue: "Tu",
  wed: "We",
  thu: "Th",
  fri: "Fr",
  sat: "Sa",
  sun: "Su",
};

function translateWorkingHours(daysStr, hoursStr) {
  if (!daysStr || !hoursStr) return undefined;
  const days = String(daysStr)
    .split(/[,\s]+/)
    .map((d) => DAY_MAP[d.toLowerCase().slice(0, 3)])
    .filter(Boolean);
  const match = String(hoursStr).match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!days.length || !match) return undefined;
  return `${days.join(",")} ${match[1]}-${match[2]}`;
}

// ── Serializer for the script tag (XSS-safe) ───────────────────────────

/**
 * JSON.stringify is safe for inline <script> as long as we escape `<`
 * and `</` sequences. JSON-LD docs are not parsed as JavaScript, but
 * the browser will treat `</script>` inside it as a tag-closer.
 */
export function serializeJsonLd(obj) {
  if (!obj) return null;
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
