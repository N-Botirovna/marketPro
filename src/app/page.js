// Root entry — bridges the bare `/` URL into the locale tree.
// `@/i18n/navigation` helpers don't fit here: this page lives outside the
// [locale] segment, so there's no active locale to be aware of yet. The
// next-intl middleware would normally catch this too, but the explicit
// redirect keeps the contract clear and avoids a "no entry" 404 on direct
// hits to the root.
// eslint-disable-next-line no-restricted-imports
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/uz");
}
