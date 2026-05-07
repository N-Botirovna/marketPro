import "./home.scss";
import dynamic from "next/dynamic";
import BannerOne from "@/components/BannerOne";
import FeatureOne from "@/components/FeatureOne";
import ShortProductOne from "@/components/ShortProductOne";
import TopVendorsOne from "@/components/TopVendorsOne";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

// Below-fold components — loaded after critical content
const NewsletterOne = dynamic(() => import("@/components/NewsletterOne"));
const ShippingOne = dynamic(() => import("@/components/ShippingOne"));
const FaqSection = dynamic(() => import("@/components/FaqSection"));
const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 3600;

export const metadata = {
  title: "MarketPro - E-commerce Next JS Template",
  description:
    "MarketPro is a comprehensive and versatile Next JS template designed for e-commerce platforms, specifically tailored for multi vendor marketplaces. With its modern design and extensive feature set, MarketPro provides everything you need to create a robust and user-friendly online marketplace..",
};

const page = () => {
  return (
    <>
      {/* ScrollToTop */}
      <ScrollToTopInit color="#299E60" />

      {/* ColorInit */}
      <ColorInit color={false} />

      {/* BannerOne */}
      <BannerOne />

      {/* FeatureOne */}
      <FeatureOne />
      {/* TopVendorsOne */}
      <TopVendorsOne />

      <ShortProductOne />
      {/* HotDealsOne */}
      {/* <HotDealsOne /> */}

      {/* NewsletterOne */}
      <NewsletterOne />
      {/* ShippingOne */}
      <ShippingOne />
      <FaqSection />

      {/* FooterOne */}
      <FooterOne />

      {/* BottomFooter */}
      <BottomFooter />
    </>
  );
};

export default page;













