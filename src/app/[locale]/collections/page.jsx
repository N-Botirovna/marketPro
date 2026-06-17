import dynamic from "next/dynamic";
import CollectionsListPage from "@/components/CollectionsListPage";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";

const FooterOne = dynamic(() => import("@/components/FooterOne"));

export const metadata = { title: "Kitob to'plamlari — Kitobzor" };

export default function Page() {
  return (
    <>
      <ScrollToTopInit color="#299E60" />
      <ColorInit color={false} />
      <CollectionsListPage />
      <FooterOne />
    </>
  );
}
