import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
export default getRequestConfig(async ({ requestLocale }) => {
  // Agar locale kelmagan bo‘lsa — default locale ni olamiz
  let locale = requestLocale;
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  // messages faylni import qilamiz
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return {
    locale,
    messages
  };
});


