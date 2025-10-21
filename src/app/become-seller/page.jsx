import BottomFooter from "@/components/BottomFooter";
import Breadcrumb from "@/components/Breadcrumb";
import BreadcrumbImage from "@/components/BreadcrumbImage";
import CounterSection from "@/components/CounterSection";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import ShippingOne from "@/components/ShippingOne";
import StepsSection from "@/components/StepsSection";
import TestimonialOne from "@/components/TestimonialOne";
import WhyBecomeSeller from "@/components/WhyBecomeSeller";
import ColorInit from "@/helper/ColorInit";
import Preloader from "@/helper/Preloader";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

export const metadata = {
  title: "Kitobzor",
  description: "Kitobzor shiori",
};

const page = () => {
  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTopInit color="#FA6400" />

      {/* Preloader */}
      <Preloader />

      <HeaderOne category={true} />

      {/* WhyBecomeSeller */}
      <WhyBecomeSeller />

      {/* CounterSection */}
      <CounterSection />

      {/* StepsSection */}
      <StepsSection />

      {/* ShippingOne */}
      <ShippingOne />

      {/* FooterOne */}
      <FooterOne />

      {/* BottomFooter */}
      <BottomFooter />
    </>
  );
};

export default page;
