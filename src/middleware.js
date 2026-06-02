import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Path segments under `/[locale]/...` that are dynamic-catch-all-only
// (no index page) and need a default tab redirect on direct URL access.
// Hand-typed `/uz/community` would otherwise 404 since the file system has
// only `community/[type]/page.jsx`. Doing this in middleware (vs. an async
// server-component redirect) preserves a real 307 with Location header,
// which SEO and curl-based tooling depend on.
const SECTION_DEFAULTS = {
  community: "all",
};

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/(uz|ru|en|kaa)\/([^/]+)\/?$/);
  if (match) {
    const [, locale, section] = match;
    const defaultTab = SECTION_DEFAULTS[section];
    if (defaultTab) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/${section}/${defaultTab}`;
      return NextResponse.redirect(url, 307);
    }
  }
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/((?!api|_next|_vercel|.*\\..*|assets).*)", "/"],
};
