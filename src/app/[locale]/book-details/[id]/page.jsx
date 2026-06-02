import "./page.scss";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/Breadcrumb";
import BookDetails from "@/components/BookDetails";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import JsonLd from "@/components/seo/JsonLd";
import { serverGet } from "@/lib/serverFetch";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { localizedField } from "@/utils/localizedField";
import { getSiteUrl } from "@/config/env";
import { bookLd, breadcrumbLd } from "@/lib/seo/jsonLd";
import { seoTruncate, joinParts } from "@/lib/seo/text";
import { routing } from "@/i18n/routing";

const FooterOne = dynamic(() => import("@/components/FooterOne"));

export const revalidate = 3600;

const SITE_URL = getSiteUrl();

function loadBookOnce(id, locale) {
  // Next dedupes identical fetches inside one render pass automatically,
  // but our serverGet uses Next's `fetch` so dedup applies here too.
  return serverGet(`/api/v1/book/${id}/`, { locale, revalidate: 600 });
}

function buildLanguageAlternates(id) {
  const languages = {};
  for (const loc of routing.locales) {
    languages[loc] = `${SITE_URL}/${loc}/book-details/${id}`;
  }
  languages["x-default"] = `${SITE_URL}/uz/book-details/${id}`;
  return languages;
}

// Build OG/Twitter metadata for Telegram/WhatsApp/etc. link previews and
// the structured-data schema for SERP rich results. We fetch the book on
// the server with serverGet so the share preview shows the actual title,
// author, cover image — turning shared links into a growth loop instead
// of generic placeholder cards.
export async function generateMetadata({ params }) {
  const { id, locale } = await params;
  const data = await loadBookOnce(id, locale);
  const book = data?.result || data?.book || data || null;

  const fallbackTitle = "Kitob tafsilotlari";
  const fallbackDesc = "Kitob haqida batafsil ma'lumot, narx va sotuvchi bilan bog'lanish.";

  if (!book) {
    return {
      title: fallbackTitle,
      description: fallbackDesc,
      alternates: {
        canonical: `${SITE_URL}/${locale}/book-details/${id}`,
        languages: buildLanguageAlternates(id),
      },
    };
  }

  const name = localizedField(book, "name", locale) || fallbackTitle;
  const author = localizedField(book, "author", locale);
  const rawDesc = localizedField(book, "description", locale);
  // Strip HTML and truncate at word boundary for SERP-quality descriptions.
  // 160 chars matches Google's typical desktop SERP snippet width.
  const desc =
    seoTruncate(rawDesc, 160) || seoTruncate(author ? `${author} — Kitobzor` : fallbackDesc, 160);
  const image = book.picture ? resolveMediaUrl(book.picture) : null;
  const url = `${SITE_URL}/${locale}/book-details/${id}`;
  // Title: "Name — Author" reads cleanly in SERP; the layout's title
  // template adds " | Kitobzor" so we don't repeat the brand here.
  const fullTitle = joinParts([name, author], " — ");

  return {
    title: fullTitle,
    description: desc,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(id),
    },
    openGraph: {
      type: "article",
      title: fullTitle,
      description: desc,
      url,
      siteName: "Kitobzor",
      locale:
        locale === "ru"
          ? "ru_RU"
          : locale === "en"
            ? "en_US"
            : locale === "kaa"
              ? "kaa_UZ"
              : "uz_UZ",
      images: image ? [{ url: image, alt: name }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: fullTitle,
      description: desc,
      images: image ? [image] : undefined,
    },
  };
}

const BookDetailsPage = async ({ params }) => {
  const { id, locale } = await params;
  const tBreadcrumb = await getTranslations("Breadcrumb");

  // Fetch the same payload generateMetadata used — Next's fetch cache
  // deduplicates the two calls during the same render.
  const data = await loadBookOnce(id, locale);
  const book = data?.result || data?.book || data || null;

  // ── Structured data (visible to crawlers, invisible to users) ─────
  // Book: target Google Knowledge Graph entry + Shopping/Offer pipeline.
  // BreadcrumbList: triggers the breadcrumb display in SERP.
  const bookSchema = book ? bookLd({ book, locale }) : null;
  const breadcrumbSchema = breadcrumbLd({
    items: [
      { name: tBreadcrumb("home"), url: `/${locale}` },
      { name: tBreadcrumb("bookShop"), url: `/${locale}/community/all` },
      {
        name: localizedField(book, "name", locale) || tBreadcrumb("bookDetails"),
        url: `/${locale}/book-details/${id}`,
      },
    ],
  });

  return (
    <>
      <ColorInit color={true} />
      <ScrollToTopInit color="#FA6400" />
      <JsonLd data={[bookSchema, breadcrumbSchema]} />
      <Breadcrumb title={tBreadcrumb("bookDetails")} />
      <BookDetails bookId={id} />
      <FooterOne />
    </>
  );
};

export default BookDetailsPage;
