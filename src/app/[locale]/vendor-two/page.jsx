import dynamic from "next/dynamic";
import Breadcrumb from "@/components/Breadcrumb";
import VendorTwo from "@/components/VendorTwo";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { getTranslations } from "next-intl/server";

const ShippingOne = dynamic(() => import("@/components/ShippingOne"));
const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 3600;

export const metadata = {
  title: "Kitoblar Do'koni - MarketPro",
  description:
    "Kitoblar do'konida turli kategoriyalardagi kitoblarni toping. Muallif, nashriyot, narx va boshqa mezonlar bo'yicha qidiring va kerakli kitobni toping.",
};

const page = async () => {
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTopInit color='#FA6400' />

      {/* Breadcrumb */}
      <Breadcrumb title={tBreadcrumb("bookShop")} />

      {/* VendorTwo */}
      <VendorTwo />

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
