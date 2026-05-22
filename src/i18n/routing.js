import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["uz", "en", "ru", "kaa"],
  defaultLocale: "uz",
  localePrefix: "always",
});
