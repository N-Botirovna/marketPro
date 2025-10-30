import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import BootstrapInit from "@/helper/BootstrapInit";
import RouteScrollToTop from "@/helper/RouteScrollToTop";
import "./font.css";
import "./globals.scss";
import "./performance.css";
import PhosphorIconInit from "@/helper/PhosphorIconInit";
import ProtectedRoute from "@/components/ProtectedRoute";
import MaterialThemeProvider from "@/components/MaterialThemeProvider";

export const metadata = {
  title: "Digital Market Place NEXT Js Template",
  description:
    "DpMarket – Digital Products Marketplace NEXT JS Template – A versatile and meticulously designed set of templates crafted to elevate your Digital Products Marketplace content and experiences.",
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
        <link rel="dns-prefetch" href="https://api.kitobzor.uz" />
        <link rel="preload" href="/assets/css/main.css" as="style" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MaterialThemeProvider>
            <BootstrapInit />
            <PhosphorIconInit />
            <RouteScrollToTop />
            <ProtectedRoute locale={locale}>{children}</ProtectedRoute>
          </MaterialThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
