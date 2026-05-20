import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import BreadcrumbThree from "@/components/BreadcrumbThree";
import VendorsList from "@/components/VendorsList";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 3600;

export const metadata = {
  title: "Do'konlar — Kitobzor",
  description:
    "Kitobzor platformasidagi do'konlar ro'yxati. Sevimli do'koningizni toping va kitoblar bilan tanishing.",
  // Legacy template route — the canonical shops index is at /shops.
  // Keep it accessible (don't 404 old links) but tell crawlers to
  // ignore this duplicate so it doesn't compete with /shops in SERP.
  robots: { index: false, follow: true },
};

const page = async () => {
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <>
      {/* ColorInit */}
      <ColorInit color={false} />

      {/* ScrollToTop */}
      <ScrollToTopInit color="#299E60" />

      {/* BreadcrumbThree */}
      <BreadcrumbThree title={tBreadcrumb("shops")} />

      {/* VendorsList */}
      <VendorsList />

      {/* FooterOne */}
      <FooterOne />

      {/* BottomFooter */}
      <BottomFooter />
    </>
  );
};

export default page;
