import "./page.scss";
import dynamic from "next/dynamic";
import Breadcrumb from "@/components/Breadcrumb";
import AboutUs from "@/components/AboutUs";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { getTranslations } from "next-intl/server";

const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 86400;

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

