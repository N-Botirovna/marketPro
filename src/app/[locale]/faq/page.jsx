import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/Breadcrumb";
import FaqPage from "@/components/FaqPage";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import JsonLd from "@/components/seo/JsonLd";
import { serverGet, unwrapList } from "@/lib/serverFetch";
import { getSiteUrl } from "@/config/env";
import { faqPageLd, breadcrumbLd } from "@/lib/seo/jsonLd";
import { routing } from "@/i18n/routing";

const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 86400;

const SITE_URL = getSiteUrl();

function buildLanguageAlternates() {
  const languages = {};
  for (const loc of routing.locales) languages[loc] = `${SITE_URL}/${loc}/faq`;
  languages["x-default"] = `${SITE_URL}/uz/faq`;
  return languages;
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FAQ" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${SITE_URL}/${locale}/faq`,
      languages: buildLanguageAlternates(),
    },
  };
}

const Page = async ({ params }) => {
  const { locale } = await params;
  const tBreadcrumb = await getTranslations("Breadcrumb");

  // Fetch the FAQ items server-side so we can emit FAQPage schema
  // before hydration. The component still fetches client-side for live
  // search; both share the same backend cache.
  const data = await serverGet("/api/v1/base/faqs/", {
    params: { limit: 100 },
    locale,
    revalidate: 86400,
  });
  const { items: faqs } = unwrapList(data);

  // FAQPage rich result unlocks expanded SERP entries — for an
  // information-poor query like "kitob almashish qanday ishlaydi"
  // we can ship the answer directly in Google's result panel.
  const faqSchema = faqPageLd({ items: faqs });
  const breadcrumbSchema = breadcrumbLd({
    items: [
      { name: tBreadcrumb("home"), url: `/${locale}` },
      { name: tBreadcrumb("faq"), url: `/${locale}/faq` },
    ],
  });

  return (
    <>
      <ColorInit color={true} />
      <ScrollToTopInit color="#299E60" />
      <JsonLd data={[faqSchema, breadcrumbSchema]} />
      <Breadcrumb title={tBreadcrumb("faq")} />
      <FaqPage />
      <FooterOne />
      <BottomFooter />
    </>
  );
};

export default Page;
