import BottomFooter from "@/components/BottomFooter";
import Breadcrumb from "@/components/Breadcrumb";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import ShippingOne from "@/components/ShippingOne";
import VendorTwo from "@/components/VendorTwo";
import ColorInit from "@/helper/ColorInit";
import Preloader from "@/helper/Preloader";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { getTranslations } from "next-intl/server";

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

      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne category={true} />

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
