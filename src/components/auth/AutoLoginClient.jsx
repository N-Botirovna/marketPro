"use client";

import React, { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Box, Stack, Typography, Button } from "@mui/material";
import { useRouter } from "@/i18n/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { loginWithTicket } from "@/services/auth";
import { stripLocalePrefix } from "@/utils/nextPath";
import Icon from "@/components/Icon";

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

        setState("success");
        const safeNext = next && next.startsWith("/") ? next : "/";
        // Strip any leading locale prefix in `next`; we re-add the current one.
        const stripped = stripLocalePrefix(safeNext);

        // HARD navigation (full reload), not router.replace. This page renders
        // under the main layout, so a client-side nav would NOT remount the
        // header / useAuth / ProtectedRoute — they'd keep their pre-login
        // "logged out" state even though tokens are now stored, and the user
        // would land looking unauthenticated. A full reload re-initialises
        // everything from localStorage, so they arrive authenticated.
        const target = `/${currentLocale}${stripped === "/" ? "" : stripped}`;
        if (typeof window !== "undefined") {
          window.location.replace(target);
        } else {
          router.replace(stripped, { locale: currentLocale });
        }
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

  if (state === "error") {
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
          sx={{
            alignItems: "center",
            maxWidth: 420,
            textAlign: "center",
            p: { xs: 3, md: 4 },
            bgcolor: "var(--surface-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 3,
            boxShadow: "var(--shadow-card)",
          }}
        >
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
            <Icon className="ph-fill ph-x" aria-hidden="true" />
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
        </Stack>
      </Box>
    );
  }

  // loading / success — show the branded rotating-fact loader until redirect.
  return <LoadingScreen title={state === "success" ? t("success") : t("loading")} />;
};

export default AutoLoginClient;
