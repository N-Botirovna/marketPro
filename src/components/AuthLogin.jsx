"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { loginWithCode } from "@/services/auth";
import { getBotUsername, getBotUrl } from "@/config/env";
import { useRouter } from "@/i18n/navigation";
import { mapValidationError } from "@/lib/mapValidationError";
import Icon from "@/components/Icon";
import Spin from "./Spin";
import FieldError from "./FieldError";
import { useToast } from "./Toast";

const CODE_LENGTH = 6;

function sanitizeNextPath(raw) {
  if (typeof raw !== "string") return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  if (/^\/[^/]+\/login(\?|$|\/)/.test(raw)) return null;
  return raw;
}

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
  // Resolve the bot identity once per mount — env access is cheap but the
  // memo keeps the JSX read-site obviously stable.
  const botUsername = useMemo(() => getBotUsername(), []);
  const botUrl = useMemo(() => getBotUrl(), []);

  useEffect(() => {
    // Auto-focus the input so the user can paste/type without an extra tap.
    inputRef.current?.focus();
  }, []);

  const handleChange = (event) => {
    // Keep only digits, cap at CODE_LENGTH. This lets the browser's OTP
    // autofill (autocomplete="one-time-code") drop the whole code in at
    // once on iOS/Android.
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
      if (fieldMsg) {
        setFieldError(fieldMsg);
      } else {
        setError(mapped.general || tErrors("loginFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section
        className="account"
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          padding: "32px 12px",
        }}
      >
        <div className="container container-lg">
          <div className="row justify-content-center">
            <div className="col-xl-4 col-lg-5 col-md-7 col-sm-10 col-12">
              <form
                onSubmit={handleSubmit}
                style={{
                  background: "var(--surface-card)",
                  borderRadius: 16,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                  border: "1px solid var(--border-subtle)",
                  padding: "28px 24px",
                }}
              >
                <div className="text-center mb-24">
                  <h1 className="fw-bold mb-8" style={{ fontSize: "1.4rem", lineHeight: 1.2 }}>
                    {tAuth("codeOnlyTitle")}
                  </h1>
                  <p className="text-gray-600 mb-0" style={{ fontSize: "0.92rem" }}>
                    {tAuth("codeOnlyDescription", { bot: `@${botUsername}` })}
                  </p>
                </div>

                <label
                  htmlFor="otp-code"
                  className="text-neutral-900 mb-8 fw-medium d-block"
                  style={{ fontSize: "0.92rem" }}
                >
                  {tAuth("codeLabel")}
                </label>
                <input
                  ref={inputRef}
                  id="otp-code"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  autoComplete="one-time-code"
                  enterKeyHint="go"
                  placeholder={tAuth("codePlaceholder")}
                  value={code}
                  onChange={handleChange}
                  maxLength={CODE_LENGTH}
                  className="common-input"
                  style={{
                    textAlign: "center",
                    fontSize: "1.6rem",
                    letterSpacing: "0.5em",
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
                  style={{ padding: "14px 24px", fontSize: "0.98rem" }}
                  disabled={loading || code.length !== CODE_LENGTH}
                >
                  {loading ? <Spin size="sm" text={tAuth("loggingIn") || ""} /> : tAccount("logIn")}
                </button>

                <div className="text-center mt-20" style={{ fontSize: "0.85rem" }}>
                  <span className="text-gray-500">{tAuth("noCodeYet")} </span>
                  <a
                    href={botUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0088cc", fontWeight: 600 }}
                  >
                    {tAuth("openBot")}
                  </a>
                </div>
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
