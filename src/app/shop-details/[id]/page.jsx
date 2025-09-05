import Breadcrumb from "@/components/Breadcrumb";
import ShopDetails from "@/components/ShopDetails";
import FooterTwo from "@/components/FooterTwo";
import HeaderTwo from "@/components/HeaderTwo";
import ShippingTwo from "@/components/ShippingTwo";
import ColorInit from "@/helper/ColorInit";
import Preloader from "@/helper/Preloader";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

export const metadata = {
  title: "Do'kon tafsilotlari - MarketPro",
  description: "Do'kon tafsilotlari va ma'lumotlari",
};

const ShopDetailsPage = ({ params }) => {
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
      <Breadcrumb title={"Do'kon tafsilotlari"} />

      {/* ShopDetails */}
      <ShopDetails shopId={params.id} />

      {/* ShippingTwo */}
      <ShippingTwo />

      {/* FooterTwo */}
      <FooterTwo />
    </>
  );
};

export default ShopDetailsPage;
