import BottomFooter from "@/components/BottomFooter";
import Breadcrumb from "@/components/Breadcrumb";
import AboutUs from "@/components/AboutUs";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import ColorInit from "@/helper/ColorInit";
import Preloader from "@/helper/Preloader";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Biz haqimizda - Kitobzor",
  description:
    "Kitobzor - kitob do'konlari va kitob sevuvchilarini birlashtiruvchi innovatsion platforma. Bizning missiyamiz va ko'rsatkichimiz haqida batafsil ma'lumot.",
};

const page = async () => {
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTopInit color="#299E60" />

      {/* Preloader */}
      <Preloader />

      {/* HeaderOne */}
      <HeaderOne category={true} />

      {/* Breadcrumb */}
      <Breadcrumb title={tBreadcrumb("aboutUs")} />

      {/* AboutUs */}
      <AboutUs />

      {/* FooterOne */}
      <FooterOne />

      {/* BottomFooter */}
      <BottomFooter />
    </>
  );
};

export default page;

