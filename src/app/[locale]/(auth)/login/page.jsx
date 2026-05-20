import AuthLogin from "@/components/AuthLogin";

export const metadata = {
  title: "Kirish — Kitobzor",
  description: "Telegram bot orqali olingan kod bilan Kitobzor saytiga kiring.",
  // Auth surface — no SEO value, and ?next= variants would create a
  // proliferation of near-duplicate URLs if crawlers indexed it.
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <AuthLogin />;
}
