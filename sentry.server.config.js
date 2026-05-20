import * as Sentry from "@sentry/nextjs";

const dsn = (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || "").trim();

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_SENTRY_RELEASE || undefined,
    tracesSampleRate: 0.1,
  });
}
