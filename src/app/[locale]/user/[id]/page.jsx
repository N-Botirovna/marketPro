import dynamic from "next/dynamic";
import Breadcrumb from "@/components/Breadcrumb";
import UserPublicProfile from "@/components/UserPublicProfile";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { getTranslations } from "next-intl/server";

const ShippingTwo = dynamic(() => import("@/components/ShippingTwo"));
const FooterOne = dynamic(() => import("@/components/FooterOne"));

export const revalidate = 3600;

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
      <Breadcrumb title={tBreadcrumb("userProfile")} />
      <UserPublicProfile userId={params.id} />
      <ShippingTwo />
      <FooterOne />
    </>
  );
};

export default UserProfilePage;


