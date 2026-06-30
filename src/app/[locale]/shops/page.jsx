import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import ShopsListPage from "@/components/ShopsListPage";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { buildAlternates } from "@/lib/seo/alternates";

const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ShopsPage" });
  return {
    title: `${t("title")} — Kitobzor`,
    description: t("subtitle"),
    alternates: buildAlternates(locale, "shops"),
  };
}

const Page = async () => {
  return (
    <>
      <ColorInit color={true} />
      <ScrollToTopInit color="#299E60" />
      <ShopsListPage />
      <FooterOne />
      <BottomFooter />
    </>
  );
};

export default Page;
