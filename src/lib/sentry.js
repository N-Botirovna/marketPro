import { getSentryDsn, getSentryEnvironment, getSentryRelease } from "@/config/env";

let initialized = false;

export function isSentryEnabled() {
  return Boolean(getSentryDsn());
}

export async function initSentryClient() {
  if (initialized || !isSentryEnabled()) {
    return;
  }
  if (typeof window === "undefined") {
    return;
  }

  initialized = true;

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: getSentryDsn(),
      environment: getSentryEnvironment(),
      release: getSentryRelease() || undefined,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.1,
      ignoreErrors: ["ResizeObserver loop limit exceeded", "Non-Error promise rejection captured"],
    });
  } catch (err) {
    initialized = false;
    // eslint-disable-next-line no-console
    console.warn("[sentry] init failed", err);
  }
}

export async function captureException(error, context) {
  if (!isSentryEnabled()) {
    // eslint-disable-next-line no-console
    console.error("[error]", error, context);
    return;
  }
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error, context);
  } catch {
    // swallow — Sentry not loaded
  }
}
