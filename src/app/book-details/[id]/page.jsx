import Breadcrumb from "@/components/Breadcrumb";
import BookDetails from "@/components/BookDetails";
import FooterTwo from "@/components/FooterTwo";
import HeaderOne from "@/components/HeaderOne";
import ShippingTwo from "@/components/ShippingTwo";
import ColorInit from "@/helper/ColorInit";
import Preloader from "@/helper/Preloader";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

export const metadata = {
  title: "Kitob tafsilotlari - MarketPro",
  description: "Kitob tafsilotlari va ma'lumotlari",
};

const BookDetailsPage = ({ params }) => {
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
      <Breadcrumb title={"Kitob tafsilotlari"} />

      {/* BookDetails */}
      <BookDetails bookId={params.id} />

      {/* ShippingTwo */}
      <ShippingTwo />

      {/* FooterTwo */}
      <FooterTwo />
    </>
  );
};

export default BookDetailsPage;
