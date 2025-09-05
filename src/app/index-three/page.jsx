import BannerThree from "@/components/BannerThree";
import BrandThree from "@/components/BrandThree";
import DealsSection from "@/components/DealsSection";
import DiscountThree from "@/components/DiscountThree";
import FeatureThree from "@/components/FeatureThree";
import FooterThree from "@/components/FooterThree";
import HeaderThree from "@/components/HeaderThree";
import InstagramSection from "@/components/InstagramSection";
import NewArrivalThree from "@/components/NewArrivalThree";
import NewsletterThree from "@/components/NewsletterThree";
import PopularProductsThree from "@/components/PopularProductsThree";
import PromotionalThree from "@/components/PromotionalThree";
import ShippingThree from "@/components/ShippingThree";
import TestimonialOne from "@/components/TestimonialOne";
import TextSlider from "@/components/TextSlider";
import TrendingThree from "@/components/TrendingThree";
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
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTopInit color='#FA6400' />

      {/* Preloader */}
      <Preloader />

      {/* HeaderThree */}
      <HeaderThree />

      {/* BannerThree */}
      <BannerThree />

      {/* PromotionalThree */}
      <PromotionalThree />

      {/* FeatureThree */}
      <FeatureThree />

      {/* TextSlider */}
      <TextSlider />

      {/* TrendingThree */}
      <TrendingThree />

      {/* DiscountThree */}
      <DiscountThree />

      {/* NewArrivalThree */}
      <NewArrivalThree />

      {/* DealsSection */}
      <DealsSection />

      {/* PopularProductsThree */}
      <PopularProductsThree />

      {/* BrandThree */}
      <BrandThree />

      {/* ShippingThree */}
      <ShippingThree />

      {/* TestimonialOne */}
      <TestimonialOne />

      {/* InstagramSection */}
      <InstagramSection />

      {/* NewsletterThree */}
      <NewsletterThree />

      {/* FooterThree */}
      <FooterThree />
    </>
  );
};

export default page;
