import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
export default getRequestConfig(async ({ requestLocale }) => {
  // `requestLocale` is a Promise in next-intl v3.22+/v4 — it MUST be awaited.
  // Without `await`, `locale` is a Promise, fails the `includes` check, and
  // every server component falls back to the default (uz) regardless of the
  // URL. This silently broke localization for all server-rendered strings
  // (TestModeBanner, BottomFooter, FooterOne, breadcrumbs, metadata…).
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  // messages faylni import qilamiz
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
