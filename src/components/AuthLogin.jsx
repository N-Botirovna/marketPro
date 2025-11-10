"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { loginWithPhoneOtp } from "@/services/auth";
import Spin from "./Spin";
import { useToast } from "./Toast";
import { useRouter } from "@/i18n/navigation";

const AuthLogin = () => {
  const tAuth = useTranslations("Auth");
  const tForms = useTranslations("Forms");
  const tCommon = useTranslations("Common");
  const tErrors = useTranslations("Errors");
  const tButtons = useTranslations("Buttons");
  const tAccount = useTranslations("Account");
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("+998");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+998[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Faqat raqamlarni qoldiramiz
    const numbers = value.replace(/[^0-9]/g, "");
    
    // Maksimal 9 ta raqam (998 dan keyin)
    const phoneDigits = numbers.substring(0, 9);
    
    // State da to'liq raqamni saqlaymiz
    setPhoneNumber("+998" + phoneDigits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phoneNumber || !password) {
      setError(tCommon("fillAllFields"));
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError(tAuth("invalidPhone"));
      return;
    }

    if (password.length < 6) {
      setError(tErrors("passwordMin"));
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithPhoneOtp({
        phone_number: phoneNumber,
        otp_code: password,
      });

      if (res.access_token || res.token) {
        showToast({
          type: "success",
          title: tCommon("success"),
          message: tAuth("loginSuccess"),
          duration: 2000,
        });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(tErrors("checkPassword"));
      }
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err?.normalized?.message ||
        err?.response?.data?.message ||
        tErrors("loginFailed");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .telegram-section {
          background: linear-gradient(135deg, #0088cc 0%, #229ed9 100%);
          border-radius: 10px;
          padding: 18px;
          margin-bottom: 18px;
        }

        .telegram-icon {
          width: 38px;
          height: 38px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          box-shadow: 0 3px 10px rgba(0, 136, 204, 0.3);
        }

        .telegram-button {
          background: white;
          color: #0088cc;
          border: 2px solid white;
          border-radius: 7px;
          padding: 9px 18px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .telegram-button:hover {
          background: #0088cc;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 136, 204, 0.4);
        }

        .form-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .form-container:hover {
          border-color: #fa6400;
          box-shadow: 0 15px 50px rgba(250, 100, 0, 0.15);
        }

        .welcome-title {
          background: linear-gradient(135deg, #fa6400 0%, #ff8c00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      <section
        className="account"
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <div className="container container-lg">
          <div className="row justify-content-center">
            <div className="col-xl-4 col-lg-5 col-md-7 col-sm-9">
              <div className="text-center mb-28">
                <h2
                  className="fw-bold mb-12 welcome-title"
                  style={{ fontSize: "1.75rem" }}
                >
                  {tAuth("welcome")}
                </h2>
                <p className="text-gray-600" style={{ fontSize: "0.95rem" }}>
                  {tAuth("fillInfo")}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-container px-24 py-28">
                  <div className="text-center mb-20">
                    <div className="telegram-section">
                      <div className="telegram-icon">
                        <i className="ph ph-telegram-logo text-lg text-blue-600"></i>
                      </div>
                      <h6
                        className="text-white fw-bold mb-6"
                        style={{ fontSize: "1rem" }}
                      >
                        @kitobzoruz_bot
                      </h6>
                      <p
                        className="text-white mb-10 opacity-90"
                        style={{ fontSize: "13px" }}
                      >
                        {tAuth("getPasswordFromBot")}
                      </p>
                      <a
                        href="https://t.me/kitobzoruz_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="telegram-button"
                      >
                        <i className="ph ph-telegram-logo"></i>
                        {tButtons("goToBot")}
                      </a>
                    </div>
                  </div>
                  <div className="mb-18">
                    <label
                      htmlFor="phone"
                      className="text-neutral-900 mb-6 fw-medium d-block"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {tForms("phone")} <span className="text-danger">*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "16px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#6b7280",
                          fontSize: "14px",
                          fontWeight: "500",
                          pointerEvents: "none",
                          zIndex: 1,
                        }}
                      >
                        +998
                      </span>
                      <input
                        type="tel"
                        className="common-input"
                        id="phone"
                        name="phone"
                        placeholder="901234567"
                        value={phoneNumber.startsWith("+998") ? phoneNumber.substring(4) : ""}
                        onChange={handlePhoneChange}
                        required
                        autoComplete="tel"
                        maxLength={9}
                        inputMode="numeric"
                        style={{
                          padding: "12px 16px 12px 60px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-18">
                    <label
                      htmlFor="password"
                      className="text-neutral-900 mb-6 fw-medium d-block"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {tForms("password")} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="common-input"
                      id="password"
                      name="password"
                      autoComplete="off"
                      placeholder={tForms("passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ padding: "12px 16px", fontSize: "14px" }}
                    />
                    <small
                      className="text-gray-500 mt-6 d-block"
                      style={{ fontSize: "13px" }}
                    >
                      {tAuth("enterPasswordFromBot")}
                    </small>
                  </div>
                  {error && (
                    <div className="mb-18">
                      <div
                        className="alert alert-danger d-flex align-items-center gap-6"
                        style={{ padding: "12px 16px" }}
                      >
                        <i
                          className="ph ph-warning"
                          style={{ fontSize: "1rem" }}
                        ></i>
                        <span style={{ fontSize: "14px" }}>{error}</span>
                      </div>
                    </div>
                  )}

                  <div className="mb-16 mt-24">
                    <button
                      type="submit"
                      className="btn btn-main w-100"
                      style={{ padding: "14px 32px", fontSize: "15px" }}
                      disabled={loading || !phoneNumber || !password}
                    >
                      {loading ? (
                        <>
                          <Spin size="sm" text={tAuth("loggingIn") || ""} />
                          {tAuth("loggingIn")}
                        </>
                      ) : (
                        tAccount("logIn")
                      )}
                    </button>
                  </div>
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
