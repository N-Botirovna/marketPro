import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/Breadcrumb";
import UserPublicProfile from "@/components/UserPublicProfile";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

const FooterOne = dynamic(() => import("@/components/FooterOne"));

export const revalidate = 3600;

export const metadata = {
  title: "Foydalanuvchi profili — Kitobzor",
  description: "Foydalanuvchining Kitobzordagi profili va joylagan kitoblari.",
};

const UserProfilePage = async ({ params }) => {
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <>
      <ColorInit color={true} />
      <ScrollToTopInit color="#FA6400" />
      <Breadcrumb title={tBreadcrumb("userProfile")} />
      <UserPublicProfile userId={params.id} />
      <FooterOne />
    </>
  );
};

export default UserProfilePage;
