"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Snackbar, Alert, Button, Box, Stack, Typography } from "@mui/material";
import { Link } from "@/i18n/navigation";
import { isAuthenticated } from "@/services/auth";
import Icon from "@/components/Icon";

const NUDGE_DELAY_MS = 60 * 1000; // 60s — long enough to read a page, short
// enough to keep new visitors on the conversion path
const SUPPRESS_KEY = "anon_login_nudge_dismissed_at";
const SUPPRESS_TTL_MS = 24 * 60 * 60 * 1000; // hide for 24h after dismissal

/**
 * Telegram-style soft prompt that appears at the bottom of the screen for
 * anonymous visitors after a quiet 60s window. We deliberately do NOT modal
 * the page — Telegram bots inspire trust precisely because they don't beg.
 * Dismissals are remembered for 24h via localStorage, then re-shown.
 */
const AnonymousLoginNudge = () => {
  const t = useTranslations("AnonymousNudge");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    // Suppress if user is already authenticated.
    try {
      if (isAuthenticated()) return undefined;
    } catch {
      /* localStorage blocked — assume anonymous */
    }

    // Respect prior dismissal.
    try {
      const raw = window.localStorage.getItem(SUPPRESS_KEY);
      if (raw) {
        const ts = Number(raw);
        if (!Number.isNaN(ts) && Date.now() - ts < SUPPRESS_TTL_MS) {
          return undefined;
        }
      }
    } catch {}

    const timer = window.setTimeout(() => setOpen(true), NUDGE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(SUPPRESS_KEY, String(Date.now()));
    } catch {}
  };

  if (!open) return null;

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ maxWidth: { xs: "100%", sm: 460 }, width: { xs: "calc(100% - 32px)", sm: "auto" } }}
    >
      <Alert
        severity="info"
        icon={
          <Icon
            className="ph-fill ph-telegram-logo"
            style={{ fontSize: 22, color: "var(--main-600, hsl(148, 59%, 39%))" }}
            aria-hidden="true"
          />
        }
        onClose={handleDismiss}
        sx={{
          bgcolor: "var(--surface-elevated)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-elevated)",
          alignItems: "center",
          "& .MuiAlert-action": { alignItems: "center" },
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ alignItems: "center" }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{t("title")}</Typography>
            <Typography variant="caption" sx={{ color: "var(--text-secondary)" }}>
              {t("body")}
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/login"
            variant="contained"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}
            onClick={handleDismiss}
          >
            {t("cta")}
          </Button>
        </Stack>
      </Alert>
    </Snackbar>
  );
};

export default AnonymousLoginNudge;
