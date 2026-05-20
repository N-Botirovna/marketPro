import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/Breadcrumb";
import Contact from "@/components/Contact";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

// FaqSection used to render below the contact form. It was pulled — FAQ
// has a dedicated page reachable from the header menu and footer link,
// so embedding it on contact (and previously on home) was duplicating
// the surface and stretching every page taller than it needed to be.
const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 86400;

export const metadata = {
  title: "Aloqa — Kitobzor",
  description:
    "Kitobzor jamoasi bilan bog'lanish: savol, taklif yoki muammoingiz bo'lsa, biz bilan aloqaga chiqing.",
};

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
