import BottomFooter from "@/components/BottomFooter";
import BreadcrumbTwo from "@/components/BreadcrumbTwo";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import NewArrivalTwo from "@/components/NewArrivalTwo";
import NewsletterOne from "@/components/NewsletterOne";
import ProductDetailsOne from "@/components/ProductDetailsOne";
import RecommendedOne from "@/components/RecommendedOne";
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
      <ColorInit color={false} />
      <ScrollToTopInit color='#299E60' />
      <Preloader />
      <HeaderOne />
      <BreadcrumbTwo title={"Product Details"} />
      <ProductDetailsOne />
      <RecommendedOne />
      <ShippingOne />
      <NewsletterOne />
      <FooterOne />
      <BottomFooter />
    </>
  );
};

export default page;
