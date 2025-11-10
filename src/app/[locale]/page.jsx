import BannerOne from "@/components/BannerOne";
import BottomFooter from "@/components/BottomFooter";
import FaqSection from "@/components/FaqSection";
import FeatureOne from "@/components/FeatureOne";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import HotDealsOne from "@/components/HotDealsOne";
import NewsletterOne from "@/components/NewsletterOne";
import ShippingOne from "@/components/ShippingOne";
import ShortProductOne from "@/components/ShortProductOne";
import TopVendorsOne from "@/components/TopVendorsOne";
import ColorInit from "@/helper/ColorInit";
import Preloader from "@/helper/Preloader";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

export const metadata = {
  title: "MarketPro - E-commerce Next JS Template",
  description:
    "MarketPro is a comprehensive and versatile Next JS template designed for e-commerce platforms, specifically tailored for multi vendor marketplaces. With its modern design and extensive feature set, MarketPro provides everything you need to create a robust and user-friendly online marketplace..",
};

const page = () => {
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* ScrollToTop */}
      <ScrollToTopInit color="#299E60" />

      {/* ColorInit */}
      <ColorInit color={false} />

      {/* HeaderOne */}
      <HeaderOne />

      {/* BannerOne */}
      <BannerOne />

      {/* FeatureOne */}
      <FeatureOne />
      {/* TopVendorsOne */}
      <TopVendorsOne />

      <ShortProductOne />
      {/* HotDealsOne */}
      <HotDealsOne />

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









