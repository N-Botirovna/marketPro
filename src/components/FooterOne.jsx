import React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const FooterOne = () => {
  const tF = useTranslations('Footer');
  return (
    <footer className="footer py-120">
      <img
        src="assets/images/bg/body-bottom-bg.png"
        alt="BG"
        className="body-bottom-bg"
      />
      <div className="container container-lg">
        <div className="footer-item-wrapper d-flex align-items-start flex-wrap">
          <div className="footer-item">
            <div className="footer-item__logo">
              <Link href="/">
                {" "}
                <img src="assets/images/logo1.png" alt="" />
              </Link>
            </div>
            <p className="mb-24">
              {tF('about.blurb')}
            </p>
            <div className="flex-align gap-16 mb-16">
              <span className="w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0">
                <i className="ph-fill ph-map-pin" />
              </span>
              <span className="text-md text-gray-900 ">
                {tF('about.address')}
              </span>
            </div>
            <div className="flex-align gap-16 mb-16">
              <span className="w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0">
                <i className="ph-fill ph-phone-call" />
              </span>
              <div className="flex-align gap-16 flex-wrap">
                <a
                  href="tel:+00123456789"
                  className="text-md text-gray-900 hover-text-main-600"
                >
                  +00 123 456 789
                </a>
                <span className="text-md text-main-600 ">{tF('about.or')}</span>
                <Link
                  href="tel:+00987654012"
                  className="text-md text-gray-900 hover-text-main-600"
                >
                  +00 987 654 012
                </Link>
              </div>
            </div>
            <div className="flex-align gap-16 mb-16">
              <span className="w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0">
                <i className="ph-fill ph-envelope" />
              </span>
              <Link
                href="/t.me/kitobzoruz_bot"
                className="text-md text-gray-900 hover-text-main-600"
              >
                {tF('about.telegram')}
              </Link>
            </div>
            <div className="flex-align gap-16 mb-16">
              <span className="w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0">
                <i className="ph-fill ph-envelope" />
              </span>
              <Link
                href="/mailto:support24@marketpro.com"
                className="text-md text-gray-900 hover-text-main-600"
              >
                {tF('about.email')}
              </Link>
            </div>
          </div>
          <div className="footer-item">
            <h6 className="footer-item__title">{tF('info.title')}</h6>
            <ul className="footer-menu">
              <li className="mb-16">
                <Link
                  href="/shop"
                  className="text-gray-600 hover-text-main-600"
                >
                  {tF('info.becomeSeller')}
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  href="/shop"
                  className="text-gray-600 hover-text-main-600"
                >
                  {tF('info.aboutUs')}
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  href="/shop"
                  className="text-gray-600 hover-text-main-600"
                >
                  {tF('info.privacy')}
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  href="/shop"
                  className="text-gray-600 hover-text-main-600"
                >
                  {tF('info.faq')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-item">
            <h6 className="footer-item__title">{tF('categories.title')}</h6>
            <ul className="footer-menu">
              <li className="mb-16">
                <Link
                  href="/shop"
                  className="text-gray-600 hover-text-main-600"
                >
                  {tF('categories.religious')}
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  href="/shop"
                  className="text-gray-600 hover-text-main-600"
                >
                  {tF('categories.fiction')}
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  href="/shop"
                  className="text-gray-600 hover-text-main-600"
                >
                  {tF('categories.children')}
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  href="/shop"
                  className="text-gray-600 hover-text-main-600"
                >
                  {tF('categories.education')}
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  href="/shop"
                  className="text-gray-600 hover-text-main-600"
                >
                  {tF('categories.science')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-item">
            <h6 className="footer-item__title">{tF('help.title')}</h6>
            <ul className="footer-menu">
              <li className="mb-16">
                <Link
                  href="/contact"
                  className="text-gray-600 hover-text-main-600"
                >
                  {tF('help.contact')}
                </Link>
              </li>
              <li className="mb-16">
                <Link
                  href="/shop"
                  className="text-gray-600 hover-text-main-600"
                >
                  {tF('help.becomeSeller')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-item">
            <h6 className="">{tF('newsletter.title')} </h6>
            <p className="mb-16">{tF('newsletter.follow')}</p>
            <div className="flex-align gap-8 my-32">
              <Link href="/https://www.apple.com/store" className="">
                <img src="assets/images/thumbs/store-img1.png" alt="" />
              </Link>
              <Link
                href="/https://play.google.com/store/apps?hl=en"
                className=""
              >
                <img src="assets/images/thumbs/store-img2.png" alt="" />
              </Link>
            </div>
            <ul className="flex-align gap-16">
              <li>
                <Link
                  href="/https://www.facebook.com"
                  className="w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white"
                >
                  <i className="ph-fill ph-facebook-logo" />
                </Link>
              </li>
              <li>
                <Link
                  href="/https://www.twitter.com"
                  className="w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white"
                >
                  <i className="ph-fill ph-twitter-logo" />
                </Link>
              </li>
              <li>
                <Link
                  href="/https://www.linkedin.com"
                  className="w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white"
                >
                  <i className="ph-fill ph-instagram-logo" />
                </Link>
              </li>
              <li>
                <Link
                  href="/https://www.pinterest.com"
                  className="w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white"
                >
                  <i className="ph-fill ph-linkedin-logo" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterOne;
