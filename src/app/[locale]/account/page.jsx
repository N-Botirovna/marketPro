import dynamic from "next/dynamic";
import ProfileDashboard from "@/components/ProfileDashboard";
import Breadcrumb from "@/components/Breadcrumb";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { getTranslations } from "next-intl/server";

const ShippingOne = dynamic(() => import("@/components/ShippingOne"));
const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 3600;

export const metadata = {
  title: "MarketPro - User Profile",
  description:
    "Manage your profile, orders, and account settings on MarketPro - your comprehensive e-commerce marketplace.",
};

const page = async ({ params }) => {
  const { locale } = await params;
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTopInit color='#FA6400' />

      {/* Breadcrumb */}
      <Breadcrumb title={tBreadcrumb("myAccount")} />

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
