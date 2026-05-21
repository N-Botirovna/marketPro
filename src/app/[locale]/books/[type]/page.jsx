import { notFound } from "next/navigation";
import { permanentRedirect } from "@/i18n/navigation";

// Legacy route. The Telegram-style refactor moved book-type listings under
// /community/[type] to emphasise the "eldagi" (community) semantics —
// shop books are now reached via /shops/[id]. Preserve old bookmarks AND
// transfer SEO link-equity by emitting a 308 (permanent) instead of the
// default 307 (temporary) — temporary redirects don't pass PageRank.
const VALID_TYPES = ["all", "sell", "gift", "exchange", "rent"];

const Page = async ({ params }) => {
  const { locale, type } = await params;

  if (VALID_TYPES.includes(type)) {
    permanentRedirect({ href: `/community/${type}`, locale });
  }

  notFound();
};

export default Page;
