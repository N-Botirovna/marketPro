"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { sendContactMessage } from "@/services/contact";
import Spin from "./Spin";
import { useToast } from "./Toast";

const Contact = () => {
  const tContact = useTranslations("Contact");
  const tForms = useTranslations("Forms");
  const tCommon = useTranslations("Common");
  const tFooter = useTranslations("Footer");
  const { showToast, ToastContainer } = useToast();
  const [formData, setFormData] = useState({
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError(err?.normalized?.message || tContact("sendError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact py-80">
      <div className="container container-lg">
        <div className="row gy-5">
          <div className="col-lg-8">
            <div className="contact-box border border-gray-100 rounded-16 px-24 py-40">
              <form onSubmit={handleSubmit}>
                <h6 className="mb-32">{tContact("sendMessage")}</h6>

                {error && (
                  <div className="alert alert-danger mb-24">{error}</div>
                )}

                <div className="row gy-4">
                  <div className="col-sm-12">
                    <label
                      htmlFor="phone"
                      className="flex-align gap-4 text-sm font-heading-two text-gray-900 fw-semibold mb-4"
                    >
                      {tForms("phone")}
                      <span className="text-danger text-xl line-height-1">
                        *
                      </span>{" "}
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
                  </div>
                  <div className="col-sm-12">
                    <label
                      htmlFor="message"
                      className="flex-align gap-4 text-sm font-heading-two text-gray-900 fw-semibold mb-4"
                    >
                      {tContact("message")}
                      <span className="text-danger text-xl line-height-1">
                        *
                      </span>{" "}
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
          <div className="col-lg-4">
            <div className="contact-box border border-gray-100 rounded-16 px-24 py-40">
              <h6 className="mb-48">{tContact("contact")}</h6>
              <div className="flex-align gap-16 mb-16">
                <span className="w-40 h-40 flex-center rounded-circle border border-gray-100 text-main-two-600 text-2xl flex-shrink-0">
                  <i className="ph-fill ph-phone-call" />
                </span>
                <a
                  href="tel:+00123456789"
                  className="text-md text-gray-900 hover-text-main-600"
                >
                  +998 93 834 01 03
                </a>
              </div>
              <div className="flex-align gap-16 mb-16">
                <span className="w-40 h-40 flex-center rounded-circle border border-gray-100 text-main-two-600 text-2xl flex-shrink-0">
                  <i className="ph-fill ph-envelope" />
                </span>
                <Link
                  href="/mailto:kitobzor.help@gmail.com"
                  className="text-md text-gray-900 hover-text-main-600"
                >
                  {tFooter("about.email")}
                </Link>
              </div>
              <div className="flex-align gap-16 mb-0">
                <span className="w-40 h-40 flex-center rounded-circle border border-gray-100 text-main-two-600 text-2xl flex-shrink-0">
                  <i className="ph-fill ph-map-pin" />
                </span>
                <span className="text-md text-gray-900 ">
                  {tFooter("about.address")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default Contact;
