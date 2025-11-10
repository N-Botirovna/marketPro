import BottomFooter from "@/components/BottomFooter";
import Breadcrumb from "@/components/Breadcrumb";
import AboutUs from "@/components/AboutUs";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import ColorInit from "@/helper/ColorInit";
import Preloader from "@/helper/Preloader";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

export const metadata = {
  title: "Biz haqimizda - Kitobzor",
  description:
    "Kitobzor - kitob do'konlari va kitob sevuvchilarini birlashtiruvchi innovatsion platforma. Bizning missiyamiz va ko'rsatkichimiz haqida batafsil ma'lumot.",
};

const page = () => {
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
      <Breadcrumb title={"Biz haqimizda"} />

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

