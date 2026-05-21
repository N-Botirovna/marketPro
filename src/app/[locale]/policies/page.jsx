import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/Breadcrumb";
import PoliciesSection from "@/components/PoliciesSection";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 86400;

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PoliciesPage" });
  return {
    title: `${t("title")} — Kitobzor`,
    description: t("subtitle"),
  };
}

const Page = async () => {
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <>
      <ColorInit color={true} />
      <ScrollToTopInit color="#299E60" />
      <Breadcrumb title={tBreadcrumb("policies")} />
      <PoliciesSection />
      <FooterOne />
      <BottomFooter />
    </>
  );
};

export default Page;
