import dynamic from "next/dynamic";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import BootstrapInit from "@/helper/BootstrapInit";
import RouteScrollToTop from "@/helper/RouteScrollToTop";
import "./font.css";
import "./globals.scss";
import "./performance.css";
// Phosphor icons are rendered as tree-shaken SVG components via
// `@/components/Icon` (@phosphor-icons/react). The old webfont CSS
// (`@phosphor-icons/web/regular` + `/fill`) shipped ~3000 unused icon
// classes + two full woff2 fonts on every page and is no longer imported.
import ProtectedRoute from "@/components/ProtectedRoute";
import ConditionalHeader from "@/components/ConditionalHeader";
import LocaleSync from "@/components/LocaleSync";
import MaterialThemeProvider from "@/components/MaterialThemeProvider";
import StyledJsxRegistry from "@/components/StyledJsxRegistry";
import { themeBootstrapScript } from "@/lib/theme";
import { initSentryClient } from "@/lib/sentry";
import { getApiBaseUrl, getSiteUrl } from "@/config/env";
import JsonLd from "@/components/seo/JsonLd";
import { organizationLd, webSiteLd } from "@/lib/seo/jsonLd";

// Resolve the API host once at module init so the <link rel="preconnect">
// always matches the env-configured backend. Falls back to the production
// host if the URL is malformed (very defensive — the env helper validates).
const API_PRECONNECT_ORIGIN = (() => {
  try {
    return new URL(getApiBaseUrl()).origin;
  } catch {
    return "https://api.kitobzor.uz";
  }
})();

// Defer below-the-fold layout widgets so their JS isn't in the layout
// chunk that ships on every navigation:
//   * AnonymousLoginNudge waits 60s before doing anything anyway.
//   * AuthRequiredModal only mounts in response to an `auth:required` event.
// (We don't pass `ssr: false` — Next 15 forbids it inside Server Components.
// These already declare "use client", so SSR just renders empty shells;
// the win is purely code-splitting the chunk out of the initial layout.)
const AnonymousLoginNudge = dynamic(() => import("@/components/AnonymousLoginNudge"), {
  loading: () => null,
});
const AuthRequiredModal = dynamic(() => import("@/components/auth/AuthRequiredModal"), {
  loading: () => null,
});
// SellerRegistrationModal mount point — listens for the global
// "seller-modal:open" event dispatched by every "Kitob do'kon ochish" CTA
// on the site. The form chunk itself is dynamic'd inside SellerModalMount,
// so it isn't fetched until the user actually opens the modal.
const SellerModalMount = dynamic(() => import("@/components/SellerModalMount"), {
  loading: () => null,
});
// Floating "post a book" button (Telegram-style new-chat FAB) + its modal
// mount-point. The button lives in the layout so it persists across page
// transitions and dispatches an event the mount-point listens for.
const PostBookFab = dynamic(() => import("@/components/PostBookFab"), {
  loading: () => null,
});
const PostBookMount = dynamic(() => import("@/components/PostBookMount"), {
  loading: () => null,
});
// Global share sheet — mounted at the layout root so any component can
// dispatch `share-sheet:open` and get a Telegram/WhatsApp/SMS picker.
const ShareSheetMount = dynamic(() => import("@/components/ShareSheetMount"), {
  loading: () => null,
});

if (typeof window !== "undefined") {
  initSentryClient();
}

// metadataBase makes relative OG/Twitter image URLs resolve against our
// public origin. Without it, Telegram/Facebook scrapers see a relative
// path and skip the rich preview card — defeating the point of shared
// links. Set via NEXT_PUBLIC_SITE_URL in production deployments.
//
// Note: `metadata` is the default per-page export. generateMetadata in
// individual pages must spread `alternates.languages` themselves —
// Next.js does NOT inherit from the parent because alternates are
// page-specific. The root values here only apply when a page renders
// without its own generateMetadata.
const SITE_URL = getSiteUrl();
const HREFLANG_MAP = {
  uz: `${SITE_URL}/uz`,
  ru: `${SITE_URL}/ru`,
  en: `${SITE_URL}/en`,
  kaa: `${SITE_URL}/kaa`,
  "x-default": `${SITE_URL}/uz`,
};

// Map a `locale` path-segment to the BCP47 tag we emit in OG metadata.
// Karakalpak maps to kaa-UZ since the speaker base is in Uzbekistan.
const OG_LOCALE_TAG = {
  uz: "uz_UZ",
  ru: "ru_RU",
  en: "en_US",
  kaa: "kaa_UZ",
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Kitobzor — yuqori idrok egalari uchun platforma",
      template: "%s | Kitobzor",
    },
    openGraph: {
      siteName: "Kitobzor",
      type: "website",
      locale: OG_LOCALE_TAG[locale] || OG_LOCALE_TAG.uz,
      alternateLocale: Object.values(OG_LOCALE_TAG).filter(
        (tag) => tag !== (OG_LOCALE_TAG[locale] || OG_LOCALE_TAG.uz),
      ),
      images: [{ url: "/assets/images/logo/kitobzor-logo.png", alt: "Kitobzor" }],
    },
    icons: {
      icon: "/favicon.ico",
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: HREFLANG_MAP,
    },
  };
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Site-wide JSON-LD: Organization + WebSite (search-box).
            Page-level Book/BreadcrumbList/FAQPage schemas are injected
            from the individual page components. */}
        <JsonLd data={[organizationLd(), webSiteLd({ locale })]} />
        {/* eslint-disable-next-line no-restricted-syntax -- static bootstrap, no user input; runs BEFORE hydration to prevent light/dark flash */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preconnect (not just dns-prefetch) to the API host: opens the
            TCP+TLS handshake during HTML parse so the first user-triggered
            fetch hits an already-warm connection. Resolves to whatever
            NEXT_PUBLIC_API_BASE_URL is set to per environment. */}
        <link rel="preconnect" href={API_PRECONNECT_ORIGIN} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={API_PRECONNECT_ORIGIN} />
        {/* Logo appears in HeaderOne above the fold on every authenticated
            page. Preload so it paints alongside the header instead of
            after the header chunk hydrates. */}
        <link
          rel="preload"
          as="image"
          href="/assets/images/logo/kitobzor-logo.png"
          fetchPriority="high"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body suppressHydrationWarning={true}>
        <StyledJsxRegistry>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <MaterialThemeProvider>
              <BootstrapInit />
              <RouteScrollToTop />
              <LocaleSync />
              <ProtectedRoute locale={locale}>
                <ConditionalHeader />
                {children}
                <AnonymousLoginNudge />
                <AuthRequiredModal />
                <SellerModalMount />
                <PostBookFab />
                <PostBookMount />
                <ShareSheetMount />
              </ProtectedRoute>
            </MaterialThemeProvider>
          </NextIntlClientProvider>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
