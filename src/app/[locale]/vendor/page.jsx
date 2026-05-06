import dynamic from "next/dynamic";
import BreadcrumbThree from "@/components/BreadcrumbThree";
import VendorsList from "@/components/VendorsList";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { getTranslations } from "next-intl/server";

const ShippingOne = dynamic(() => import("@/components/ShippingOne"));
const NewsletterOne = dynamic(() => import("@/components/NewsletterOne"));
const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 3600;

export const metadata = {
  title: "MarketPro - E-commerce Next JS Template",
  description:
    "MarketPro is a comprehensive and versatile Next JS template designed for e-commerce platforms, specifically tailored for multi vendor marketplaces. With its modern design and extensive feature set, MarketPro provides everything you need to create a robust and user-friendly online marketplace..",
};

const page = async () => {
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <>
      {/* ColorInit */}
      <ColorInit color={false} />

      {/* ScrollToTop */}
      <ScrollToTopInit color='#299E60' />

      {/* BreadcrumbThree */}
      <BreadcrumbThree title={tBreadcrumb("shops")} />

      {/* VendorsList */}
      <VendorsList />

      {/* ShippingOne */}
      <ShippingOne />

      {/* NewsletterOne */}
      <NewsletterOne />

      {/* FooterOne */}
      <FooterOne />

      {/* BottomFooter */}
      <BottomFooter />
    </>
  );
};

export default page;
