import { fileURLToPath } from "url";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dev convenience: trust whatever NEXT_PUBLIC_API_BASE_URL points at (e.g. a
// LAN IP like http://192.168.x.x:8000 used for phone testing) in CSP +
// next/image, so the committed config stays generic — no hardcoded IPs.
const localApiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_BASE_URL).origin;
  } catch {
    return null;
  }
})();
const localApiHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_BASE_URL).hostname;
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // M-22: strict mode catches effect-cleanup bugs by double-invoking
  // components in dev. Re-enabling after the conditional-hook lint debt
  // was retired in Phase 3.
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Self-contained server bundle for Docker: `.next/standalone/server.js`
  // ships with a pruned node_modules, so the runtime image stays small.
  output: "standalone",
  outputFileTracingRoot: __dirname,

  // H-20: build no longer tolerates new lint errors. The remaining
  // legacy items are *warnings*, which don't block the build but show
  // up in CI for follow-up. Warnings include a handful of `<img>`-instead-
  // of-`<Image>` opportunities (B-card / footer / vendor list / user
  // profile) and one import-order nit. Promote any of those to errors
  // once the team has bandwidth to migrate the images.
  eslint: {
    ignoreDuringBuilds: false,
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.kitobzor.uz" },
      { protocol: "https", hostname: "api-dev.kitobzor.uz" },
      // Dev backend currently serves media over plain HTTP — keep until it
      // gets a cert. Production deploys should only see HTTPS.
      { protocol: "http", hostname: "api-dev.kitobzor.uz" },
      // Local Docker stack (Variant B in onboarding).
      { protocol: "http", hostname: "localhost" },
      // Dev: LAN-IP backend for phone testing (derived from env, dev-only).
      ...(localApiHost &&
      process.env.NODE_ENV !== "production" &&
      !["localhost", "api.kitobzor.uz", "api-dev.kitobzor.uz"].includes(localApiHost)
        ? [{ protocol: "http", hostname: localApiHost }]
        : []),
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // dangerouslyAllowSVG removed (M-25). Backend serves books as
    // JPEG/PNG/WebP via ResizedImageField — no SVG path is intended.
    // If a future feature needs SVGs, gate it behind a specific
    // image-loader rather than re-enabling globally.
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  experimental: {
    optimizePackageImports: [
      "react",
      "react-dom",
      "@mui/material",
      "react-slick",
      "slick-carousel",
      "axios",
    ],
  },

  // Legacy URL retirements. Emitted as 308 (permanent, preserves method)
  // at the Next.js edge BEFORE any React rendering, so SEO link-equity
  // transfers reliably across environments (the runtime
  // `permanentRedirect` helper from next-intl can be sensitive to
  // server-vs-edge context in dev mode). The dynamic legacy paths that
  // need search-param handling (`/vendor-two`, `/vendor-two-details`)
  // still live in their React page wrappers because edge redirects
  // can't easily rewrite query-string keys.
  async redirects() {
    return [
      // /uz/books/sell  →  /uz/community/sell  (and the other types)
      {
        source: "/:locale(uz|ru|en)/books/:type(all|sell|gift|exchange|rent)",
        destination: "/:locale/community/:type",
        permanent: true,
      },
      // /uz/books (no type) → /uz/community/all
      {
        source: "/:locale(uz|ru|en)/books",
        destination: "/:locale/community/all",
        permanent: true,
      },
    ];
  },

  async headers() {
    const isProd = process.env.NODE_ENV === "production";

    // `unsafe-eval` is required by Next.js' dev-mode runtime (React refresh,
    // webpack HMR). It is dropped in production to close the eval-based XSS
    // vector. `unsafe-inline` stays for Emotion/MUI runtime <style> tags.
    //
    // Phosphor icons are now self-hosted (H-12), so unpkg.com is no longer
    // in any directive — the only third-party CSS/font origin we trust is
    // Google Fonts.
    const scriptSrc = isProd
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

    // Dev backend (api-dev.kitobzor.uz) still serves media over plain HTTP.
    // Allow it locally + localhost for the Docker stack; production only sees
    // HTTPS hosts (no mixed-content).
    // Append the env-configured API origin (e.g. LAN IP for phone testing).
    const devApi = !isProd && localApiOrigin ? ` ${localApiOrigin}` : "";
    const devHosts = isProd ? "" : ` http://api-dev.kitobzor.uz http://localhost:8000${devApi}`;
    const devConnect = isProd
      ? ""
      : ` http://api-dev.kitobzor.uz http://localhost:8000 ws://localhost:* http://localhost:*${devApi}`;

    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `img-src 'self' data: blob: https://api.kitobzor.uz https://api-dev.kitobzor.uz${devHosts}`,
      "font-src 'self' data: https://fonts.gstatic.com",
      `connect-src 'self' https://api.kitobzor.uz https://api-dev.kitobzor.uz https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io${devConnect}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "geolocation=(), microphone=(), camera=(), payment=()",
      },
    ];

    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/assets/:all*(svg|jpg|png|webp|avif|gif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/assets/:all*(woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/assets/css/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");
// M-27: opt-in bundle analyzer. Run `npm run analyze` to get the
// client/server/edge chunk size HTML reports under .next/analyze/.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(withNextIntl(nextConfig));
