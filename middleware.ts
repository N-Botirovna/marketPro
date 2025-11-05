import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';

const middleware = createMiddleware(routing);

export default middleware;

export const config = {
  // Match all pathnames including root path
  // - Excludes API routes, Next.js internals, Vercel routes, and files with extensions
  matcher: [
    // Match root path and all other paths
    '/',
    // Match all other pathnames except excluded ones
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};

