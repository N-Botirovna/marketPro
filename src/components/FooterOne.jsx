"use client";
import React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const FooterOne = () => {
  const tF = useTranslations("Footer");
  return (
    <footer className="footer py-5">
      <img
        src="assets/images/bg/body-bottom-bg.png"
        alt="BG"
        className="body-bottom-bg"
      />
      <div className="container container-lg">
        <div className="row gy-4">
          <div className="col-lg-3 col-md-6">
            <div className="footer-item">
              <div className="footer-item__logo mb-20">
                <Link href="/">
                  <img src="/assets/images/logo/logo.png" alt="Logo" onError={(e) => {
                    e.target.src = "/assets/images/logo1.png";
                  }} />
                </Link>
              </div>
              <p className="mb-20 text-gray-700">{tF("about.blurb")}</p>
              <ul className="footer-menu">
                <li className="mb-12">
                  <Link
                    href="/contact"
                    className="text-sm text-gray-600 hover-text-main-500 transition-1"
                  >
                    {tF("help.contact")}
                  </Link>
                </li>
                <li className="mb-0">
                  <Link
                    href="/become-seller"
                    className="text-sm text-gray-600 hover-text-main-500 transition-1"
                  >
                    {tF("help.becomeSeller")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-6">
            <div className="footer-item">
              <h6 className="footer-item__title mb-20">{tF("info.title")}</h6>
              <ul className="footer-menu">
                <li className="mb-12">
                  <Link
                    href="/about-us"
                    className="text-sm text-gray-600 hover-text-main-500 transition-1"
                  >
                    {tF("info.aboutUs")}
                  </Link>
                </li>
                <li className="mb-12">
                  <Link
                    href="/shop"
                    className="text-sm text-gray-600 hover-text-main-500 transition-1"
                  >
                    {tF("info.privacy")}
                  </Link>
                </li>
                <li className="mb-0">
                  <Link
                    href="/#faq"
                    className="text-sm text-gray-600 hover-text-main-500 transition-1"
                  >
                    {tF("info.faq")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="footer-item">
              <h6 className="footer-item__title mb-20">{tF("about.title")}</h6>
              <div className="flex-align gap-12 mb-12">
                <span className="w-32 h-32 flex-center rounded-circle bg-main-500 text-white text-md flex-shrink-0">
                  <i className="ph-fill ph-map-pin" />
                </span>
                <span className="text-sm text-gray-700">
                  {tF("about.address")}
                </span>
              </div>
              <div className="flex-align gap-12 mb-12">
                <span className="w-32 h-32 flex-center rounded-circle bg-main-500 text-white text-md flex-shrink-0">
                  <i className="ph-fill ph-phone-call" />
                </span>
                <a
                  href="tel:+998938340103"
                  className="text-sm text-gray-700 hover-text-main-500"
                >
                  +998 93 834 01 03
                </a>
              </div>
              <div className="flex-align gap-12 mb-0">
                <span className="w-32 h-32 flex-center rounded-circle bg-main-500 text-white text-md flex-shrink-0">
                  <i className="ph-fill ph-envelope" />
                </span>
                <a
                  href="mailto:kitobzor.help@gmail.com"
                  className="text-sm text-gray-700 hover-text-main-500"
                >
                  {tF("about.email")}
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="footer-item">
              <h6 className="footer-item__title mb-20">{tF("newsletter.title")}</h6>
              <p className="mb-20 text-sm text-gray-700">{tF("newsletter.follow")}</p>
              <div className="flex-align gap-12 mb-12">
                <span className="w-32 h-32 flex-center rounded-circle bg-main-500 text-white text-md flex-shrink-0">
                  <i className="ph-fill ph-paper-plane-tilt" />
                </span>
                <a
                  href="https://t.me/kitobzoruz_bot"
                  className="text-sm text-gray-700 hover-text-main-500"
                >
                  {tF("about.telegram")}
                </a>
              </div>
              <div className="flex-align gap-8 mb-24">
                <a href="https://www.apple.com/store" className="hover-opacity-80 transition-1">
                  <img src="assets/images/thumbs/store-img1.png" alt="" />
                </a>
                <a href="https://play.google.com/store/apps?hl=en" className="hover-opacity-80 transition-1">
                  <img src="assets/images/thumbs/store-img2.png" alt="" />
                </a>
              </div>
              <ul className="flex-align gap-12">
                <li>
                  <a
                    href="https://www.facebook.com"
                    className="w-40 h-40 flex-center bg-main-50 text-main-500 text-lg rounded-circle hover-bg-main-500 hover-text-white transition-1"
                  >
                    <i className="ph-fill ph-facebook-logo" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.twitter.com"
                    className="w-40 h-40 flex-center bg-main-50 text-main-500 text-lg rounded-circle hover-bg-main-500 hover-text-white transition-1"
                  >
                    <i className="ph-fill ph-twitter-logo" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com"
                    className="w-40 h-40 flex-center bg-main-50 text-main-500 text-lg rounded-circle hover-bg-main-500 hover-text-white transition-1"
                  >
                    <i className="ph-fill ph-instagram-logo" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.pinterest.com"
                    className="w-40 h-40 flex-center bg-main-50 text-main-500 text-lg rounded-circle hover-bg-main-500 hover-text-white transition-1"
                  >
                    <i className="ph-fill ph-linkedin-logo" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterOne;
