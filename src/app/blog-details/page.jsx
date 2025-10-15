import BlogDetails from "@/components/BlogDetails";
import BottomFooter from "@/components/BottomFooter";
import Breadcrumb from "@/components/Breadcrumb";
import FooterTwo from "@/components/FooterTwo";
import HeaderOne from "@/components/HeaderOne";
import HeaderOne from "@/components/HeaderOne";
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
      <HeaderOne  />

      {/* Breadcrumb */}
      <Breadcrumb title={"Blog Details"} />

      {/* BlogDetails */}
      <BlogDetails />

      {/* ShippingOne */}
      <ShippingOne />

      {/* FooterTwo */}
      <FooterTwo />

      {/* BottomFooter */}
      <BottomFooter />
    </>
  );
};

export default page;
