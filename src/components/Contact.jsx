"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { sendContactMessage } from "@/services/contact";
import { mapValidationError } from "@/lib/mapValidationError";
import {
  getTelegramChannelHandle,
  getTelegramChannelUrl,
  getInstagramHandle,
  getInstagramUrl,
} from "@/config/env";
import Spin from "./Spin";
import FieldError from "./FieldError";
import { useToast } from "./Toast";

const Contact = () => {
  const tContact = useTranslations("Contact");
  const tForms = useTranslations("Forms");
  const tCommon = useTranslations("Common");
  const { showToast, ToastContainer } = useToast();

  const tgHandle = getTelegramChannelHandle();
  const tgUrl = getTelegramChannelUrl();
  const igHandle = getInstagramHandle();
  const igUrl = getInstagramUrl();
  const [formData, setFormData] = useState({
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const fieldError = (name) => fieldErrors[name] || "";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!formData.phone || !formData.message) {
      setError(tCommon("fillAllFields"));
      return;
    }

    setLoading(true);
    try {
      const response = await sendContactMessage({
        phone: formData.phone,
        message: formData.message,
      });

      if (response.success) {
        showToast({
          type: "success",
          title: tCommon("success"),
          message: tContact("messageSent"),
          duration: 3000,
        });
        setFormData({ phone: "", message: "" });
      } else {
        setError(response.message || tContact("sendError"));
      }
    } catch (err) {
      const mapped = mapValidationError(err);
      if (Object.keys(mapped.fields || {}).length > 0) {
        setFieldErrors(mapped.fields);
        setError(mapped.general);
      } else {
        setError(mapped.general || tContact("sendError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact py-80">
      <div className="container container-lg">
        <div className="row gy-5">
          <div className="col-12 col-md-7 col-lg-8">
            <div className="contact-box border border-gray-100 rounded-16 px-16 px-md-24 py-24 py-md-40">
              <form onSubmit={handleSubmit}>
                <h6 className="mb-32">{tContact("sendMessage")}</h6>

                {error && <div className="alert alert-danger mb-24">{error}</div>}

                <div className="row gy-4">
                  <div className="col-sm-12">
                    <label
                      htmlFor="phone"
                      className="flex-align gap-4 text-sm font-heading-two text-gray-900 fw-semibold mb-4"
                    >
                      {tForms("phone")}
                      <span className="text-danger text-xl line-height-1">*</span>{" "}
                    </label>
                    <input
                      type="tel"
                      className="common-input px-16"
                      id="phone"
                      name="phone"
                      placeholder="+998901234567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    <FieldError message={fieldError("phone")} />
                  </div>
                  <div className="col-sm-12">
                    <label
                      htmlFor="message"
                      className="flex-align gap-4 text-sm font-heading-two text-gray-900 fw-semibold mb-4"
                    >
                      {tContact("message")}
                      <span className="text-danger text-xl line-height-1">*</span>{" "}
                    </label>
                    <textarea
                      className="common-input px-16"
                      id="message"
                      name="message"
                      placeholder={tContact("messagePlaceholder")}
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      required
                    />
                    <FieldError message={fieldError("message")} />
                  </div>
                  <div className="col-sm-12 mt-32">
                    <button
                      type="submit"
                      className="btn btn-main py-18 px-32 rounded-8"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spin size="sm" text={tContact("sending") || ""} />
                          {tContact("sending")}
                        </>
                      ) : (
                        tContact("sendMessage")
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="col-12 col-md-5 col-lg-4">
            {/* Social sidebar — phone/email/address dropped (the contact
                form on the left is the canonical channel; for everything
                else, push users to our public socials). Both cards use
                brand-true colours and a soft hover lift to read as
                primary CTAs rather than passive listing rows. */}
            <div
              className="rounded-16 px-16 px-md-24 py-24 py-md-32"
              style={{
                background: "var(--surface-card)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <h6 className="mb-8" style={{ fontSize: 18, fontWeight: 700 }}>
                {tContact("followUs")}
              </h6>
              <p
                className="mb-24"
                style={{
                  fontSize: 13.5,
                  color: "var(--text-secondary)",
                  lineHeight: 1.55,
                }}
              >
                {tContact("socialTagline")}
              </p>

              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="d-flex align-items-center gap-12 rounded-12 px-16 py-12 mb-12 contact-social-card contact-social-card--telegram"
                style={{
                  background: "linear-gradient(135deg, #0088cc 0%, #229ed9 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  boxShadow: "0 6px 18px rgba(0, 136, 204, 0.25)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    background: "rgba(255, 255, 255, 0.2)",
                    fontSize: 22,
                  }}
                >
                  <i className="ph-fill ph-telegram-logo" aria-hidden="true" />
                </span>
                <span className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 500 }}>
                    {tContact("telegramChannel")}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
                    @{tgHandle}
                  </span>
                </span>
                <i
                  className="ph ph-arrow-up-right flex-shrink-0"
                  style={{ fontSize: 18, opacity: 0.85 }}
                  aria-hidden="true"
                />
              </a>

              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="d-flex align-items-center gap-12 rounded-12 px-16 py-12 contact-social-card contact-social-card--instagram"
                style={{
                  background:
                    "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  boxShadow: "0 6px 18px rgba(220, 39, 67, 0.25)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    background: "rgba(255, 255, 255, 0.2)",
                    fontSize: 22,
                  }}
                >
                  <i className="ph-fill ph-instagram-logo" aria-hidden="true" />
                </span>
                <span className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 12, opacity: 0.9, fontWeight: 500 }}>
                    {tContact("instagram")}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
                    @{igHandle}
                  </span>
                </span>
                <i
                  className="ph ph-arrow-up-right flex-shrink-0"
                  style={{ fontSize: 18, opacity: 0.9 }}
                  aria-hidden="true"
                />
              </a>
              <style jsx>{`
                .contact-social-card:hover {
                  transform: translateY(-2px);
                }
                .contact-social-card--telegram:hover {
                  box-shadow: 0 10px 28px rgba(0, 136, 204, 0.38);
                }
                .contact-social-card--instagram:hover {
                  box-shadow: 0 10px 28px rgba(220, 39, 67, 0.38);
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default Contact;
