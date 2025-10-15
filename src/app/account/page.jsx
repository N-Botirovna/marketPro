import ProfileDashboard from "@/components/ProfileDashboard";
import BottomFooter from "@/components/BottomFooter";
import Breadcrumb from "@/components/Breadcrumb";
import FooterOne from "@/components/FooterOne";
import ShippingOne from "@/components/ShippingOne";
import ColorInit from "@/helper/ColorInit";
import Preloader from "@/helper/Preloader";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import HeaderOne from "@/components/HeaderOne";

export const metadata = {
  title: "MarketPro - User Profile",
  description:
    "Manage your profile, orders, and account settings on MarketPro - your comprehensive e-commerce marketplace.",
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
      <HeaderOne category={true} />

      {/* Breadcrumb */}
      <Breadcrumb title={"My Account"} />

      {/* ProfileDashboard */}
      <ProfileDashboard />

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
