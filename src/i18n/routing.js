import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["uz", "en", "ru", "kaa"],
  defaultLocale: "uz",
  localePrefix: "always",
  // Anonymous visitors always start in Uzbek — don't auto-pick from the
  // browser's Accept-Language. Authenticated users are routed to their saved
  // language client-side by <LocaleSync>.
  localeDetection: false,
});
