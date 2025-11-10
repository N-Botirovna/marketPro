import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';
import {NextRequest, NextResponse} from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  
  // If root path, redirect to default locale
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}`;
    return NextResponse.redirect(url);
  }
  
  // Use next-intl middleware for all other paths
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames including root path
  // - Excludes API routes, Next.js internals, Vercel routes, and files with extensions
  matcher: [
    // Match root path explicitly
    '/',
    // Match all other pathnames except excluded ones
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};

