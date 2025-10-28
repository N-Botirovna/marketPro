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

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.kitobzor.uz" />
        <link rel="preload" href="/assets/css/main.css" as="style" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body suppressHydrationWarning={true}>
        <MaterialThemeProvider>
          <BootstrapInit />
          <PhosphorIconInit />
          <RouteScrollToTop />
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </MaterialThemeProvider>
      </body>
    </html>
  );
}
