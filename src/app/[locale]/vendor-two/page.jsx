import { permanentRedirect } from "@/i18n/navigation";

// Legacy route. The Telegram-style refactor moved the book listing under
// /community/all. Preserve old bookmarks AND forward any search/category
// query string so existing header links still work. 308 (permanent) so
// search engines transfer PageRank to the canonical destination.
const Page = async ({ params, searchParams }) => {
  const { locale } = await params;
  const sp = await searchParams;

  const qs = new URLSearchParams();
  if (sp?.search) qs.set("search", sp.search);
  if (sp?.q) qs.set("q", sp.q);
  if (sp?.category) qs.set("category", sp.category);
  if (sp?.subcategory) qs.set("sub_category", sp.subcategory);
  if (sp?.sub_category) qs.set("sub_category", sp.sub_category);
  if (sp?.region) qs.set("region", sp.region);
  if (sp?.district) qs.set("district", sp.district);
  if (sp?.type) {
    permanentRedirect({
      href: `/community/${sp.type}?${qs.toString()}`,
      locale,
    });
  }
  if (sp?.is_used) qs.set("is_used", sp.is_used);

  permanentRedirect({
    href: `/community/all${qs.toString() ? `?${qs}` : ""}`,
    locale,
  });
};

export default Page;
