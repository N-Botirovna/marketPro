import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import BootstrapInit from "@/helper/BootstrapInit";
import RouteScrollToTop from "@/helper/RouteScrollToTop";
import "./font.css";
import "./globals.scss";
import "./performance.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import Preloader from "@/helper/Preloader";
import ConditionalHeader from "@/components/ConditionalHeader";

export const metadata = {
  title: "Kitobzor - Online Book Store",
  description:
    "Kitobzor - Online Book Store - A versatile and meticulously designed set of templates crafted to elevate your Digital Products Marketplace content and experiences.",
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.kitobzor.uz" />
        <link rel="dns-prefetch" href="https://unpkg.com" />
        <link rel="preload" href="/assets/css/main.css" as="style" />
        {/* Phosphor Icons - load directly in head so icons appear immediately */}
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/bold/style.css" crossOrigin="anonymous" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <NextIntlClientProvider locale={locale} messages={messages}>
            <Preloader />
            <BootstrapInit />
            <RouteScrollToTop />
            <ProtectedRoute locale={locale}>
              <ConditionalHeader />
              {children}
            </ProtectedRoute>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

