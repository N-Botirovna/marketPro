"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { loginWithCode } from "@/services/auth";
import { getBotUsername, getBotUrl } from "@/config/env";
import { useRouter } from "@/i18n/navigation";
import { mapValidationError } from "@/lib/mapValidationError";
import { sanitizeNextPath } from "@/utils/nextPath";
import Icon from "@/components/Icon";
import Spin from "./Spin";
import FieldError from "./FieldError";
import { useToast } from "./Toast";

const CODE_LENGTH = 6;

/**
 * Passwordless sign-in. The flow mirrors the Telegram bot exactly:
 *   1. Open the bot and tap "Kirish kodi" → it replies with a 6-digit code.
 *   2. Type that code here → signed in.
 * So the screen is a two-step guide, not a bare input: a prominent
 * "get code from the bot" CTA, then the code field.
 */
const AuthLogin = () => {
  const tAuth = useTranslations("Auth");
  const tErrors = useTranslations("Errors");
  const tCommon = useTranslations("Common");
  const tAccount = useTranslations("Account");
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = sanitizeNextPath(searchParams?.get("next"));
  const { showToast, ToastContainer } = useToast();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const inputRef = useRef(null);
  const botUsername = useMemo(() => getBotUsername(), []);
  const botUrl = useMemo(() => getBotUrl({ start: "login" }), []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (event) => {
    const cleaned = event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(cleaned);
    if (fieldError) setFieldError("");
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldError("");
    if (code.length !== CODE_LENGTH) {
      setFieldError(tAuth("codeMin"));
      return;
    }
    setLoading(true);
    try {
      const res = await loginWithCode(code);
      if (res.access_token) {
        showToast({
          type: "success",
          title: tCommon("success"),
          message: tAuth("loginSuccess"),
          duration: 1500,
        });
        setTimeout(() => router.push(nextParam || "/"), 800);
      } else {
        setError(tErrors("checkPassword"));
      }
    } catch (err) {
      const mapped = mapValidationError(err);
      const fieldMsg = mapped.fields?.otp_code || mapped.fields?.code;
      if (fieldMsg) setFieldError(fieldMsg);
      else setError(mapped.general || tErrors("loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section
        style={{
          minHeight: "88vh",
          display: "flex",
          alignItems: "center",
          padding: "32px 12px",
          background: "var(--surface-page)",
        }}
      >
        <div className="container container-lg">
          <div className="row justify-content-center">
            <div className="col-xl-4 col-lg-5 col-md-7 col-sm-9 col-12">
              <form
                onSubmit={handleSubmit}
                style={{
                  background: "var(--surface-card)",
                  borderRadius: 20,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.10)",
                  border: "1px solid var(--border-subtle)",
                  padding: "32px 26px",
                }}
              >
                {/* Brand badge */}
                <div className="text-center" style={{ marginBottom: 16 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #2aabee 0%, #0088cc 100%)",
                      color: "#fff",
                      fontSize: 30,
                      boxShadow: "0 8px 20px rgba(0,136,204,0.35)",
                    }}
                  >
                    <Icon className="ph-fill ph-telegram-logo" />
                  </span>
                </div>

                <div className="text-center" style={{ marginBottom: 22 }}>
                  <h1 className="fw-bold mb-8" style={{ fontSize: "1.45rem", lineHeight: 1.2 }}>
                    {tAuth("codeOnlyTitle")}
                  </h1>
                  <p
                    className="text-gray-600 mb-0"
                    style={{ fontSize: "0.92rem", lineHeight: 1.5 }}
                  >
                    {tAuth("codeOnlyDescription", { bot: `@${botUsername}` })}
                  </p>
                </div>

                {/* Step 1 — get the code from the bot (primary CTA) */}
                <a
                  href={botUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-100 d-flex align-items-center justify-content-center gap-8"
                  style={{
                    background: "linear-gradient(135deg, #2aabee 0%, #0088cc 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.98rem",
                    padding: "13px 20px",
                    borderRadius: 12,
                    textDecoration: "none",
                    boxShadow: "0 8px 20px rgba(0,136,204,0.30)",
                  }}
                >
                  <Icon
                    className="ph-fill ph-telegram-logo"
                    aria-hidden="true"
                    style={{ fontSize: 20 }}
                  />
                  {tAuth("getCodeFromBot")}
                </a>

                {/* Divider → step 2 */}
                <div
                  className="d-flex align-items-center"
                  style={{ gap: 12, margin: "20px 0 16px" }}
                >
                  <span style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
                  <span
                    style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}
                  >
                    {tAuth("thenEnterCode")}
                  </span>
                  <span style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
                </div>

                {/* Step 2 — code input */}
                <input
                  ref={inputRef}
                  id="otp-code"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  autoComplete="one-time-code"
                  enterKeyHint="go"
                  placeholder="••••••"
                  value={code}
                  onChange={handleChange}
                  maxLength={CODE_LENGTH}
                  className="common-input"
                  aria-label={tAuth("codeLabel")}
                  style={{
                    textAlign: "center",
                    fontSize: "1.7rem",
                    letterSpacing: "0.55em",
                    padding: "14px 12px 14px 18px",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  }}
                  aria-describedby="otp-hint"
                />
                <small
                  id="otp-hint"
                  className="text-gray-500 mt-8 d-block text-center"
                  style={{ fontSize: "0.78rem" }}
                >
                  {tAuth("codeHint")}
                </small>
                <FieldError message={fieldError} />

                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-center gap-6 mt-16 mb-0"
                    style={{ padding: "10px 14px", fontSize: "0.88rem" }}
                  >
                    <Icon className="ph ph-warning" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-main w-100 mt-20"
                  style={{ padding: "14px 24px", fontSize: "0.98rem", borderRadius: 12 }}
                  disabled={loading || code.length !== CODE_LENGTH}
                >
                  {loading ? <Spin size="sm" text={tAuth("loggingIn") || ""} /> : tAccount("logIn")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <ToastContainer />
    </>
  );
};

export default AuthLogin;
