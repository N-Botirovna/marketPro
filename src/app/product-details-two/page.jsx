import BottomFooter from "@/components/BottomFooter";
import Breadcrumb from "@/components/Breadcrumb";
import FooterTwo from "@/components/FooterTwo";
import HeaderOne from "@/components/HeaderOne";
import NewArrivalTwo from "@/components/NewArrivalTwo";
import NewsletterOne from "@/components/NewsletterOne";
import ProductDetailsTwo from "@/components/ProductDetailsTwo";
import ShippingOne from "@/components/ShippingOne";
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

      {/* HeaderOne */}
      <HeaderOne category={true} />

      {/* Breadcrumb */}
      <Breadcrumb title={"Product Details"} />

      {/* ProductDetailsTwo */}
      <ProductDetailsTwo />

      {/* NewArrivalTwo */}
      <NewArrivalTwo />

      {/* ShippingOne */}
      <ShippingOne />

      {/* NewsletterOne */}
      <NewsletterOne />

      {/* FooterTwo */}
      <FooterTwo />

      {/* BottomFooter */}
      <BottomFooter />
    </>
  );
};

export default page;
