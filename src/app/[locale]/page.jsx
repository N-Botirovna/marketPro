import "./home.scss";
import dynamic from "next/dynamic";
import BannerOne from "@/components/BannerOne";
import HomeMainEntryChips from "@/components/home/HomeMainEntryChips";
import HomeStoryBar from "@/components/home/HomeStoryBar";
import HomeShopsRow from "@/components/home/HomeShopsRow";
import HomeBookList from "@/components/home/HomeBookList";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { serverGet, unwrapList } from "@/lib/serverFetch";
import { getSiteUrl } from "@/config/env";
import { routing } from "@/i18n/routing";

// Below-fold components — loaded after critical content. FaqSection was
// pulled from the home page — the FAQ surface is now reachable only via
// the header menu and footer link, so visitors who want it tap there
// instead of scrolling past it on every page.
const FooterOne = dynamic(() => import("@/components/FooterOne"));
const BottomFooter = dynamic(() => import("@/components/BottomFooter"));

export const revalidate = 600;

const SITE_URL = getSiteUrl();

function buildHomeLanguageAlternates() {
  const languages = {};
  for (const loc of routing.locales) languages[loc] = `${SITE_URL}/${loc}`;
  // The default locale is `uz` per routing.defaultLocale.
  languages["x-default"] = `${SITE_URL}/uz`;
  return languages;
}

// Home page locale-specific metadata. Next.js does NOT deep-merge
// alternates from the parent layout — when a page exports its own
// metadata, it replaces the layout's alternates entirely. So we must
// re-emit hreflang here even though the layout sets them site-wide.
// kaa falls through to the uz copy for now (placeholder strategy until a
// translator delivers Karakalpak prose); OG locale tag still uses kaa_UZ
// so social previews label the page correctly.
const OG_LOCALE = { uz: "uz_UZ", ru: "ru_RU", en: "en_US", kaa: "kaa_UZ" };

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const desc =
    locale === "ru"
      ? "Kitobzor — маркетплейс книг в Узбекистане. Покупайте, продавайте, обменивайте или дарите книги."
      : locale === "en"
        ? "Kitobzor — Uzbekistan's book marketplace. Buy, sell, exchange or gift new and used books online."
        : "Kitobzor — O'zbekistondagi kitob do'konlari va sevuvchilari uchun marketplace. Kitob sotib oling, sotvering, almashtiring, bepul tarqating yoki ijaraga oling.";
  const title =
    locale === "ru"
      ? "Kitobzor — маркетплейс книг в Узбекистане"
      : locale === "en"
        ? "Kitobzor — Uzbekistan's book marketplace"
        : "Kitobzor — kitoblar marketplace'i";
  return {
    title,
    description: desc,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: buildHomeLanguageAlternates(),
    },
    openGraph: {
      title,
      description: desc,
      url: `${SITE_URL}/${locale}`,
      siteName: "Kitobzor",
      locale: OG_LOCALE[locale] || OG_LOCALE.uz,
      type: "website",
    },
  };
}

const bookParams = (type) => ({
  is_active: true,
  type,
  owner_type: "user",
  // 6 so the home feed fills exactly two full rows of the 3-column BookRowGrid
  // on desktop (no dangling single card).
  limit: 6,
});

const page = async ({ params }) => {
  const { locale } = await params;

  // Fire every home-feed request in parallel on the server. Previously
  // each home component fetched its own data after hydration — six
  // round-trips stacked behind React mount, ~600-1200 ms of empty
  // skeleton on cold loads. Now the page lands fully populated.
  const [storiesRes, shopsRes, sellRes, giftRes, exchangeRes, rentRes] = await Promise.all([
    serverGet("/api/v1/stories/", { locale, revalidate: 120 }),
    serverGet("/api/v1/shop/list/", {
      locale,
      params: { is_active: true, limit: 10 },
      revalidate: 600,
    }),
    serverGet("/api/v1/book/list/", { locale, params: bookParams("sell") }),
    serverGet("/api/v1/book/list/", { locale, params: bookParams("gift") }),
    serverGet("/api/v1/book/list/", { locale, params: bookParams("exchange") }),
    serverGet("/api/v1/book/list/", { locale, params: bookParams("rent") }),
  ]);

  const initialStories = unwrapList(storiesRes).items;
  const initialShops = unwrapList(shopsRes).items;
  const initialSell = unwrapList(sellRes).items;
  const initialGift = unwrapList(giftRes).items;
  const initialExchange = unwrapList(exchangeRes).items;
  const initialRent = unwrapList(rentRes).items;

  return (
    <>
      <ScrollToTopInit color="#299E60" />
      <ColorInit color={false} />
      <BannerOne />
      <HomeMainEntryChips />
      <HomeStoryBar initialStories={initialStories} />
      <HomeShopsRow initialShops={initialShops} />

      <HomeBookList
        type="sell"
        ownerType="user"
        titleKey="eldagiSellTitle"
        viewAllHref="/community/sell"
        initialBooks={initialSell}
      />
      <HomeBookList
        type="gift"
        ownerType="user"
        titleKey="eldagiGiftTitle"
        viewAllHref="/community/gift"
        initialBooks={initialGift}
      />
      <HomeBookList
        type="exchange"
        ownerType="user"
        titleKey="eldagiExchangeTitle"
        viewAllHref="/community/exchange"
        initialBooks={initialExchange}
      />
      <HomeBookList
        type="rent"
        ownerType="user"
        titleKey="eldagiRentTitle"
        viewAllHref="/community/rent"
        initialBooks={initialRent}
      />

      <FooterOne />
      <BottomFooter />
    </>
  );
};

export default page;
