import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/Breadcrumb";
import CommunityBooksPage from "@/components/CommunityBooksPage";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

const VALID_TYPES = ["all", "sell", "gift", "exchange", "rent"];

export async function generateMetadata({ params }) {
  const { locale, type } = await params;
  if (!VALID_TYPES.includes(type)) return {};
  const t = await getTranslations({ locale, namespace: "CommunityPage" });
  return {
    title: `${t(`title.${type}`)} — Kitobzor`,
    description: t(`subtitle.${type}`),
  };
}

const Page = async ({ params }) => {
  const { type } = await params;

  if (!VALID_TYPES.includes(type)) {
    notFound();
  }

  const tCommunity = await getTranslations("CommunityPage");

  return (
    <>
      <ColorInit color={true} />
      <ScrollToTopInit color="#299E60" />
      <Breadcrumb title={tCommunity(`title.${type}`)} />
      <CommunityBooksPage type={type} />
      <FooterOne />
      <BottomFooter />
    </>
  );
};

export default Page;
