import "./home.scss";
import dynamic from "next/dynamic";
import BannerOne from "@/components/BannerOne";
import HomeStoryBar from "@/components/home/HomeStoryBar";
import HomeShopsRow from "@/components/home/HomeShopsRow";
import HomeCollectionsRow from "@/components/home/HomeCollectionsRow";
import HomeBookList from "@/components/home/HomeBookList";
import ColorInit from "@/helper/ColorInit";
import ScrollToTopInit from "@/helper/ScrollToTopInit";
import { serverGet, unwrapList } from "@/lib/serverFetch";
import { getSiteUrl } from "@/config/env";
import { routing } from "@/i18n/routing";
import { ALL_BOOK_SECTIONS, HOME_BOOK_SECTIONS, homeLayout } from "@/lib/homeRotation";

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
  const title =
    locale === "ru"
      ? "Kitobzor — платформа для людей с высоким интеллектом"
      : locale === "en"
        ? "Kitobzor — a platform for people of high intellect"
        : "Kitobzor — yuqori idrok egalari uchun platforma";
  return {
    title,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: buildHomeLanguageAlternates(),
    },
    openGraph: {
      title,
      url: `${SITE_URL}/${locale}`,
      siteName: "Kitobzor",
      locale: OG_LOCALE[locale] || OG_LOCALE.uz,
      type: "website",
    },
  };
}

const bookParams = (type) => ({
  is_active: true,
  // Hide books bundled into a collection — they show once as a collection card.
  standalone: true,
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
  //
  // `wanted` is fetched like any other section here, but note it can never
  // ride along in another one: the API hides demand posts from every unscoped
  // feed, so it only ever appears under its own explicit `type=wanted`.
  const [storiesRes, shopsRes, ...bookResults] = await Promise.all([
    serverGet("/api/v1/stories/", { locale, revalidate: 120 }),
    serverGet("/api/v1/shop/list/", {
      locale,
      // 6 for the same reason as the book rows: HomeShopsRow is a 3-column
      // grid on desktop, so 6 fills exactly two rows with no dangling card.
      // It also matches what the component itself assumes — its skeleton
      // count and its client-side fallback fetch are both 6; this server
      // prefetch was the odd one out at 10 and silently won.
      params: { is_active: true, limit: 6 },
      revalidate: 600,
    }),
    ...ALL_BOOK_SECTIONS.map((slug) =>
      serverGet("/api/v1/book/list/", {
        locale,
        params: bookParams(HOME_BOOK_SECTIONS[slug].type),
      }),
    ),
  ]);

  const initialStories = unwrapList(storiesRes).items;
  const initialShops = unwrapList(shopsRes).items;
  const booksBySection = Object.fromEntries(
    ALL_BOOK_SECTIONS.map((slug, i) => [slug, unwrapList(bookResults[i]).items]),
  );

  // Order is a pure function of the current time bucket (see lib/homeRotation):
  // `wanted` is always the first book row, the supply rows cycle, and the
  // shops/collections block moves between them instead of permanently owning
  // the top of the page. Computed on the server, so the rendered payload and
  // the hydrated tree always agree.
  const { bookOrder, discoveryAt, discoveryOrder } = homeLayout();

  const discoveryBlock = discoveryOrder.map((block) =>
    block === "shops" ? (
      <HomeShopsRow key="shops" initialShops={initialShops} />
    ) : (
      <HomeCollectionsRow key="collections" />
    ),
  );

  // Each row self-hides on an empty list (HomeBookList / HomeShopsRow /
  // HomeCollectionsRow all return null), so a data-light deployment collapses
  // to whatever it actually has without leaving holes in the rotation.
  const sections = [];
  bookOrder.forEach((slug, i) => {
    if (i === discoveryAt) sections.push(...discoveryBlock);
    const section = HOME_BOOK_SECTIONS[slug];
    sections.push(
      <HomeBookList
        key={slug}
        type={section.type}
        ownerType="user"
        titleKey={section.titleKey}
        viewAllHref={section.href}
        initialBooks={booksBySection[slug]}
      />,
    );
  });
  if (discoveryAt >= bookOrder.length) sections.push(...discoveryBlock);

  return (
    <>
      <ScrollToTopInit color="#299E60" />
      <ColorInit color={false} />
      <BannerOne />
      <HomeStoryBar initialStories={initialStories} />

      {sections}

      <FooterOne />
      <BottomFooter />
    </>
  );
};

export default page;
