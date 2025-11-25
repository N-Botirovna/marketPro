import Breadcrumb from "@/components/Breadcrumb";
import FooterOne from "@/components/FooterOne";
import HeaderOne from "@/components/HeaderOne";
import ShippingTwo from "@/components/ShippingTwo";
import UserPublicProfile from "@/components/UserPublicProfile";
import ColorInit from "@/helper/ColorInit";
import Preloader from "@/helper/Preloader";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Foydalanuvchi profili - MarketPro",
  description: "MarketPro foydalanuvchi profili sahifasi.",
};

const UserProfilePage = async ({ params }) => {
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <>
      <ColorInit color={true} />
      <ScrollToTopInit color="#FA6400" />
      <Preloader />
      <HeaderOne category={true} />
      <Breadcrumb title={tBreadcrumb("userProfile")} />
      <UserPublicProfile userId={params.id} />
      <ShippingTwo />
      <FooterOne />
    </>
  );
};

export default UserProfilePage;


