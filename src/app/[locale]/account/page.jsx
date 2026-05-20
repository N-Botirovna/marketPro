import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import ProfileDashboard from "@/components/ProfileDashboard";
import Breadcrumb from "@/components/Breadcrumb";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 3600;

export const metadata = {
  title: "Mening profilim — Kitobzor",
  description:
    "Profilingizni boshqaring, joylagan kitoblaringizni ko'ring, do'kon va xodimlaringizni tahrirlang.",
  // Account is per-user content with zero SEO value — keep it out of
  // every crawler index AND drop the link-equity follow signal so the
  // page doesn't bleed PageRank into private sub-routes.
  robots: { index: false, follow: false, nocache: true },
};

const page = async ({ params }) => {
  const { locale } = await params;
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTopInit color="#FA6400" />

      {/* Breadcrumb */}
      <Breadcrumb title={tBreadcrumb("myAccount")} />

      {/* ProfileDashboard */}
      <ProfileDashboard />

      {/* FooterOne */}
      <FooterOne />

      {/* BottomFooter */}
      <BottomFooter />
    </>
  );
};

export default page;
