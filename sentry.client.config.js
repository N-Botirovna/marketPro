import * as Sentry from "@sentry/nextjs";

const dsn = (process.env.NEXT_PUBLIC_SENTRY_DSN || "").trim();

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || undefined,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    ignoreErrors: ["ResizeObserver loop limit exceeded", "Non-Error promise rejection captured"],
  });
}
