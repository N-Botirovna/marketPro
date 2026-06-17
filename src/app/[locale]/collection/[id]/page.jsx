import dynamic from "next/dynamic";
import CollectionDetails from "@/components/CollectionDetails";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { serverGet } from "@/lib/serverFetch";

const FooterOne = dynamic(() => import("@/components/FooterOne"));

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { id, locale } = await params;
  try {
    const res = await serverGet(`/api/v1/book/collections/${id}/`, { locale, revalidate: 120 });
    const c = res?.result || res || {};
    return { title: c?.title ? `${c.title} — Kitobzor` : "Kitobzor", robots: { index: true } };
  } catch {
    return { title: "Kitobzor" };
  }
}

const page = async ({ params }) => {
  const { id } = await params;
  return (
    <>
      <ScrollToTopInit color="#299E60" />
      <ColorInit color={false} />
      <CollectionDetails collectionId={id} />
      <FooterOne />
    </>
  );
};

export default page;
