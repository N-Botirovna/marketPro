import Breadcrumb from "@/components/Breadcrumb";
import FooterTwo from "@/components/FooterTwo";
import HeaderTwo from "@/components/HeaderTwo";
import ShopsList from "@/components/ShopsList";
import ShippingTwo from "@/components/ShippingTwo";
import ColorInit from "@/helper/ColorInit";
import Preloader from "@/helper/Preloader";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

export const metadata = {
  title: "Do'konlar - MarketPro",
  description: "Barcha kitob do'konlari va ularning ma'lumotlari",
};

const ShopsPage = () => {
  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTopInit color='#FA6400' />

      {/* Preloader */}
      <Preloader />

      {/* HeaderTwo */}
      <HeaderTwo category={true} />

      {/* Breadcrumb */}
      <Breadcrumb title={"Do'konlar"} />

      {/* ShopsList */}
      <ShopsList />

      {/* ShippingTwo */}
      <ShippingTwo />

      {/* FooterTwo */}
      <FooterTwo />
    </>
  );
};

export default ShopsPage;
