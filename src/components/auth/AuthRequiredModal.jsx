"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  Box,
  Stack,
  Typography,
  IconButton,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { loginWithPhoneOtp } from "@/services/auth";
import { mapValidationError } from "@/lib/mapValidationError";
import { getBotUrl } from "@/config/env";
import Icon from "@/components/Icon";

// Telegram bot deep-link. The handle comes from NEXT_PUBLIC_BOT_USERNAME
// (see src/config/env.js) — per-env so dev points at a test bot.
const BOT_DEEP_LINK = getBotUrl({ start: "login" });

/**
 * Login gate shown whenever an anonymous user attempts a mutation.
 *
 * Triggered globally by the `auth:required` CustomEvent emitted from
 * `src/lib/http.js` when a 401/403 lands on POST/PUT/PATCH/DELETE without
 * any stored auth tokens.
 *
 * UX:
 *   - Primary CTA opens the Telegram bot (`?start=login`). The bot's main
 *     menu offers two flows: "auto-login link" (one-tap return to the
 *     site) and "OTP code" (paste it here).
 *   - The inline form below is the OTP fallback — phone + 4–6-digit code
 *     → POST /auth/login/. On success we close the modal and let the
 *     user retry their original action.
 *
 * Design choice: we do NOT auto-replay the failed mutation. Mutation
 * payloads can contain FormData, idempotency keys, and ephemeral file
 * blobs; reliably replaying them across an auth event is brittle. A
 * "please redo the action" toast is the safer contract.
 */
const AuthRequiredModal = () => {
  const t = useTranslations("AuthRequiredModal");
  const tCommon = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handler = () => {
      // Re-show every time the event fires — caller-side throttling is
      // simpler than tracking a "last shown at" timestamp here, and the
      // user usually only triggers one auth event per session.
      setError(null);
      setSuccess(false);
      setOpen(true);
    };
    window.addEventListener("auth:required", handler);
    return () => window.removeEventListener("auth:required", handler);
  }, []);

  const handleClose = () => {
    if (submitting) return;
    setOpen(false);
    setError(null);
  };

  const canSubmit = !submitting && phone.trim().length >= 9 && code.trim().length >= 4;

  const handleSubmit = async (event) => {
    event?.preventDefault?.();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await loginWithPhoneOtp({
        phone_number: phone.trim(),
        otp_code: code.trim(),
      });
      if (res?.access_token) {
        setSuccess(true);
        // Give the user a beat to read the success state, then close.
        // Caller-side: they retry their original action manually.
        window.setTimeout(() => {
          setOpen(false);
          setPhone("");
          setCode("");
        }, 900);
      } else {
        setError(t("loginFailed"));
      }
    } catch (err) {
      const mapped = mapValidationError(err);
      setError(mapped.general || t("loginFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "var(--surface-card)",
          color: "var(--text-primary)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 3 },
          py: 1.5,
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{t("title")}</Typography>
        <IconButton
          onClick={handleClose}
          disabled={submitting}
          aria-label={tCommon("close") || "Close"}
          size="small"
        >
          <Icon className="ph ph-x" style={{ fontSize: 18 }} aria-hidden="true" />
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
        <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 2.5 }}>
          {t("body")}
        </Typography>

        <Button
          fullWidth
          component="a"
          href={BOT_DEEP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          startIcon={
            <Icon
              className="ph-fill ph-telegram-logo"
              style={{ fontSize: 20 }}
              aria-hidden="true"
            />
          }
          endIcon={
            <Icon className="ph ph-arrow-up-right" style={{ fontSize: 16 }} aria-hidden="true" />
          }
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            bgcolor: "#0088cc",
            color: "#fff",
            "&:hover": { bgcolor: "#0077b3" },
            py: 1.25,
            mb: 1,
          }}
        >
          {t("openBot")}
        </Button>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: "var(--text-muted)",
            mb: 2,
          }}
        >
          {t("botHint")}
        </Typography>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
            {t("orEnterCode")}
          </Typography>
        </Divider>

        {success ? (
          <Alert severity="success" sx={{ alignItems: "center" }}>
            {t("loginSuccess")}
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={1.75}>
              <TextField
                fullWidth
                size="small"
                type="tel"
                label={t("phoneLabel")}
                placeholder="+998 9X XXX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                disabled={submitting}
              />
              <TextField
                fullWidth
                size="small"
                label={t("codeLabel")}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={submitting}
              />
              {error && (
                <Alert severity="error" sx={{ alignItems: "center" }}>
                  {error}
                </Alert>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={!canSubmit}
                startIcon={
                  submitting ? (
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                  ) : (
                    <Icon className="ph ph-sign-in" aria-hidden="true" />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  py: 1.25,
                }}
              >
                {submitting ? t("loggingIn") : t("login")}
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default AuthRequiredModal;
