import dynamic from "next/dynamic";
import Breadcrumb from "@/components/Breadcrumb";
import BookDetails from "@/components/BookDetails";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { getTranslations } from "next-intl/server";

const ShippingTwo = dynamic(() => import("@/components/ShippingTwo"));
const FooterOne = dynamic(() => import("@/components/FooterOne"));

export const revalidate = 3600;

export const metadata = {
  title: "Kitob tafsilotlari - MarketPro",
  description: "Kitob tafsilotlari va ma'lumotlari",
};

const BookDetailsPage = async ({ params }) => {
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTopInit color='#FA6400' />

      {/* Breadcrumb */}
      <Breadcrumb title={tBreadcrumb("bookDetails")} />

      {/* BookDetails */}
      <BookDetails bookId={params.id} />

      {/* ShippingTwo */}
      <ShippingTwo />

      {/* FooterOne */}
      <FooterOne />
    </>
  );
};

export default BookDetailsPage;
