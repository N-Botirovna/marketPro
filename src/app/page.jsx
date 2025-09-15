import BannerOne from "@/components/BannerOne";
import BestSellsOne from "@/components/BestSellsOne";
import BottomFooter from "@/components/BottomFooter";
import BrandOne from "@/components/BrandOne";
import DeliveryOne from "@/components/DeliveryOne";
import ExchangeBooksSection from "@/components/ExchangeBooksSection";
import FeatureOne from "@/components/FeatureOne";
import FlashSalesOne from "@/components/FlashSalesOne";
import FooterOne from "@/components/FooterOne";
import GiftBooksSection from "@/components/GiftBooksSection";
import HeaderOne from "@/components/HeaderOne";
import HotDealsOne from "@/components/HotDealsOne";
import NewArrivalOne from "@/components/NewArrivalOne";
import NewBooksSection from "@/components/NewBooksSection";
import NewsletterOne from "@/components/NewsletterOne";
import OfferOne from "@/components/OfferOne";
import OrganicOne from "@/components/OrganicOne";
import ProductListOne from "@/components/ProductListOne";
import PromotionalOne from "@/components/PromotionalOne";
import RecommendedOne from "@/components/RecommendedOne";
import ShippingOne from "@/components/ShippingOne";
import ShortProductOne from "@/components/ShortProductOne";
import ShopsSection from "@/components/ShopsSection";
import TopVendorsOne from "@/components/TopVendorsOne";
import UsedBooksSection from "@/components/UsedBooksSection";
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
      <ScrollToTopInit color='#299E60' />

      {/* ColorInit */}
      <ColorInit color={false} />

      {/* HeaderOne */}
      <HeaderOne />

      {/* BannerOne */}
      <BannerOne />

      {/* FeatureOne */}
      <FeatureOne />

      {/* New Books Section */}
      <NewBooksSection />

      {/* Used Books Section */}
      <UsedBooksSection />

      {/* TopVendorsOne */}
      <TopVendorsOne />

      {/* Gift Books Section */}
      <GiftBooksSection />

      {/* Exchange Books Section */}
      <ExchangeBooksSection />

      {/* PromotionalOne */}
      <PromotionalOne />

      {/* FlashSalesOne */}
      <FlashSalesOne />

      {/* ProductListOne */}
      <ProductListOne />

      {/* OfferOne */}
      <OfferOne />

      {/* RecommendedOne */}
      <RecommendedOne />

      {/* HotDealsOne */}
      <HotDealsOne />

      {/* BestSellsOne */}
      <BestSellsOne />

      {/* DeliveryOne */}
      <DeliveryOne />

      {/* OrganicOne */}
      <OrganicOne />

      {/* ShortProductOne */}
      <ShortProductOne />

      {/* BrandOne */}
      <BrandOne />

      {/* NewArrivalOne */}
      <NewArrivalOne />

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
