"use client";

import React, { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Box, Stack, Typography, CircularProgress, Button } from "@mui/material";
import { useRouter } from "@/i18n/navigation";
import Spin from "@/components/Spin";
import { getUserProfile, loginWithTicket } from "@/services/auth";
import { routing } from "@/i18n/routing";

// Bot stores the user's preferred language as a full English name
// (`User.language`'s `Languages` enum in the backend); the frontend
// uses ISO locale prefixes. Mapping mirrors:
//   - bot/api_client/client.py:233 (sends Accept-Language)
//   - back-end/users/api_endpoints/Ticket/views.py (builds redirect URL)
const LANG_NAME_TO_LOCALE = {
  uzbek: "uz",
  russian: "ru",
  english: "en",
  karakalpak: "kaa",
};

function resolveUserLocale(rawLanguage) {
  if (!rawLanguage) return null;
  const key = String(rawLanguage).trim().toLowerCase();
  const candidate = LANG_NAME_TO_LOCALE[key] || key;
  return routing.locales.includes(candidate) ? candidate : null;
}

/**
 * Telegram-style auto-login surface.
 *
 * The bot mints a single-use ticket (Redis-backed, 60s TTL) and sends the
 * user a deep-link like `/uz/auth/auto?ticket=…&next=/account`. This client
 * exchanges the ticket for a JWT pair, then redirects to `next`.
 *
 * UX goal: zero clicks. Show a quick "Welcome back" interstitial, persist
 * the tokens, redirect. On error: actionable retry CTA pointing back to
 * /login (manual OTP flow).
 */
const AutoLoginClient = ({ ticket, next = "/" }) => {
  const t = useTranslations("AutoLogin");
  const router = useRouter();
  const currentLocale = useLocale();
  const [state, setState] = useState("loading"); // loading | success | error
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!ticket) {
      setState("error");
      setErrorMsg(t("missingTicket"));
      return;
    }

    let alive = true;
    (async () => {
      try {
        await loginWithTicket(ticket);
        if (!alive) return;

        // Read the user's preferred language from /me/ and align the URL.
        // The bot redirect already aims at the right locale (Ticket view
        // builds `/{locale}/auth/auto?...`), but a user who bookmarked an
        // old `/uz/auth/auto?...` link or whose preference changed since
        // gets corrected here. Best-effort: ignore failures and keep the
        // current locale.
        let targetLocale = currentLocale;
        try {
          const { user } = await getUserProfile();
          const preferred = resolveUserLocale(user?.language);
          if (preferred) targetLocale = preferred;
        } catch {
          /* /me/ unavailable — fall back to URL locale */
        }
        if (!alive) return;

        setState("success");
        const safeNext = next && next.startsWith("/") ? next : "/";
        // Strip any leading locale prefix in `next` so the locale option
        // takes effect; next-intl's router prepends the locale.
        const stripped = safeNext.replace(/^\/(uz|ru|en|kaa)(?=\/|$)/, "") || "/";
        window.setTimeout(() => {
          router.replace(stripped, { locale: targetLocale });
        }, 500);
      } catch (err) {
        if (!alive) return;
        setState("error");
        const code = err?.response?.data?.code;
        if (code === "ticket_invalid") setErrorMsg(t("ticketInvalid"));
        else setErrorMsg(err?.normalized?.message || t("genericError"));
      }
    })();

    return () => {
      alive = false;
    };
  }, [ticket, next, router, t, currentLocale]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "var(--surface-page)",
        color: "var(--text-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Stack
        spacing={2}
        alignItems="center"
        sx={{
          maxWidth: 420,
          textAlign: "center",
          p: { xs: 3, md: 4 },
          bgcolor: "var(--surface-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 3,
          boxShadow: "var(--shadow-card)",
        }}
      >
        {state === "loading" && (
          <>
            <CircularProgress size={32} />
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{t("loading")}</Typography>
            <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
              {t("loadingHint")}
            </Typography>
          </>
        )}

        {state === "success" && (
          <>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              <i className="ph-fill ph-check" aria-hidden="true" />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{t("success")}</Typography>
            <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
              {t("redirecting")}
            </Typography>
            <Spin text="" />
          </>
        )}

        {state === "error" && (
          <>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "error.light",
                color: "error.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              <i className="ph-fill ph-x" aria-hidden="true" />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{t("failed")}</Typography>
            <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
              {errorMsg}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.replace("/login")}
              sx={{ textTransform: "none", fontWeight: 600, mt: 1 }}
            >
              {t("manualLogin")}
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default AutoLoginClient;
