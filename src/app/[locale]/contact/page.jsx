import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/Breadcrumb";
import Contact from "@/components/Contact";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { buildAlternates } from "@/lib/seo/alternates";

// FaqSection used to render below the contact form. It was pulled — FAQ
// has a dedicated page reachable from the header menu and footer link,
// so embedding it on contact (and previously on home) was duplicating
// the surface and stretching every page taller than it needed to be.
const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 86400;

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates(locale, "contact"),
  };
}

const page = async () => {
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <>
      {/* ColorInit */}
      <ColorInit color={true} />

      {/* ScrollToTop */}
      <ScrollToTopInit color="#FA6400" />

      {/* Breadcrumb */}
      <Breadcrumb title={tBreadcrumb("contact")} />

      {/* Contact */}
      <Contact />

      {/* FooterOne */}
      <FooterOne />

      {/* BottomFooter */}
      <BottomFooter />
    </>
  );
};

export default page;
