import dynamic from "next/dynamic";
import BreadcrumbTwo from "@/components/BreadcrumbTwo";
import ProductDetailsOne from "@/components/ProductDetailsOne";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

const RecommendedOne = dynamic(() => import("@/components/RecommendedOne"));
const NewArrivalTwo = dynamic(() => import("@/components/NewArrivalTwo"));
const ShippingOne = dynamic(() => import("@/components/ShippingOne"));
const NewsletterOne = dynamic(() => import("@/components/NewsletterOne"));
const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

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
