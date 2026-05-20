import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/Breadcrumb";
import ShopDetailPage from "@/components/ShopDetailPage";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import JsonLd from "@/components/seo/JsonLd";
import { serverGet } from "@/lib/serverFetch";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { getSiteUrl } from "@/config/env";
import { localBusinessLd, breadcrumbLd } from "@/lib/seo/jsonLd";
import { seoTruncate } from "@/lib/seo/text";
import { routing } from "@/i18n/routing";

const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 600;

const SITE_URL = getSiteUrl();

function loadShopOnce(id, locale) {
  return serverGet(`/api/v1/shop/${id}/`, { locale, revalidate: 600 });
}

function buildLanguageAlternates(id) {
  const languages = {};
  for (const loc of routing.locales) {
    languages[loc] = `${SITE_URL}/${loc}/shops/${id}`;
  }
  languages["x-default"] = `${SITE_URL}/uz/shops/${id}`;
  return languages;
}

export async function generateMetadata({ params }) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: "ShopDetailPage" });

  const data = await loadShopOnce(id, locale);
  const shop = data?.result || data || null;

  const fallbackTitle = t("metaTitle");
  const fallbackDesc = t("metaDescription");

  if (!shop) {
    return {
      title: fallbackTitle,
      description: fallbackDesc,
      alternates: {
        canonical: `${SITE_URL}/${locale}/shops/${id}`,
        languages: buildLanguageAlternates(id),
      },
    };
  }

  const name = shop.name || fallbackTitle;
  const desc = seoTruncate(shop.bio || shop.description || shop.about, 160) || fallbackDesc;
  const rawImage = shop.picture || shop.logo || shop.cover_image || null;
  const image = rawImage ? resolveMediaUrl(rawImage) : null;
  const url = `${SITE_URL}/${locale}/shops/${id}`;

  return {
    title: name,
    description: desc,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(id),
    },
    openGraph: {
      type: "profile",
      title: name,
      description: desc,
      url,
      siteName: "Kitobzor",
      locale: locale === "ru" ? "ru_RU" : locale === "en" ? "en_US" : "uz_UZ",
      images: image ? [{ url: image, alt: name }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: name,
      description: desc,
      images: image ? [image] : undefined,
    },
  };
}

const Page = async ({ params }) => {
  const { id, locale } = await params;
  const tBreadcrumb = await getTranslations("Breadcrumb");

  const data = await loadShopOnce(id, locale);
  const shop = data?.result || data || null;

  // BookStore schema + Breadcrumb. BookStore inherits LocalBusiness so we
  // also unlock the Maps panel + opening-hours rich result.
  const businessSchema = shop ? localBusinessLd({ shop, locale }) : null;
  const breadcrumbSchema = breadcrumbLd({
    items: [
      { name: tBreadcrumb("home"), url: `/${locale}` },
      { name: tBreadcrumb("shops"), url: `/${locale}/shops` },
      {
        name: shop?.name || tBreadcrumb("shopDetails"),
        url: `/${locale}/shops/${id}`,
      },
    ],
  });

  return (
    <>
      <ColorInit color={true} />
      <ScrollToTopInit color="#299E60" />
      <JsonLd data={[businessSchema, breadcrumbSchema]} />
      <Breadcrumb title={tBreadcrumb("shopDetails")} />
      <ShopDetailPage shopId={id} />
      <FooterOne />
      <BottomFooter />
    </>
  );
};

export default Page;
