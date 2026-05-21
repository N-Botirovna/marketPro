import { notFound } from "next/navigation";
import { permanentRedirect } from "@/i18n/navigation";

// Legacy route. The Telegram-style refactor moved shop detail to /shops/[id]
// with a proper path parameter. Preserve old bookmarks by redirecting:
//   /uz/vendor-two-details?id=42  →  /uz/shops/42
// Without an id, fall back to /shops list. 308 (permanent) so search
// engines transfer the destination's authority to the canonical URL.
const Page = async ({ params, searchParams }) => {
  const { locale } = await params;
  const sp = await searchParams;
  const shopId = sp?.id;

  if (shopId) {
    permanentRedirect({ href: `/shops/${shopId}`, locale });
  }
  permanentRedirect({ href: "/shops", locale });

  // Unreachable — Next.js throws on redirect — but satisfies type-checkers.
  notFound();
};

export default Page;
