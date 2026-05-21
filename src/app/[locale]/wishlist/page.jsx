import "./page.scss";
import dynamic from "next/dynamic";
import WishListSection from "@/components/WishListSection";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 3600;

export const metadata = {
  title: "Saralanganlar — Kitobzor",
  description:
    "Sevimli kitoblaringiz ro'yxati. Kitobzorda yoqtirgan kitoblarni saqlab qo'ying va keyinroq oson toping.",
  // Per-user surface — same noindex rules as /account.
  robots: { index: false, follow: false, nocache: true },
};

const page = async () => {
  return (
    <>
      <ColorInit color={true} />
      <ScrollToTopInit color="#FA6400" />
      {/* Breadcrumb removed — the new wishlist hero already labels the
          page and the second header was duplicating visual hierarchy. */}
      <WishListSection />
      <FooterOne />
      <BottomFooter />
    </>
  );
};

export default page;
