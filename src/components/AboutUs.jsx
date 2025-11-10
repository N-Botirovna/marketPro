"use client";
import React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import TopVendorsOne from "./TopVendorsOne";
import Contact from "./Contact";

const AboutUs = () => {
  const tAbout = useTranslations("AboutUs");
  const tCommon = useTranslations("Common");
  const tFooter = useTranslations("Footer");
  const tButtons = useTranslations("Buttons");

  const stats = [
    {
      icon: "ph-fill ph-book",
      number: "10,000+",
      label: tAbout("stats.books"),
      color: "text-main-600",
    },
    {
      icon: "ph-fill ph-storefront",
      number: "500+",
      label: tAbout("stats.shops"),
      color: "text-success-600",
    },
    {
      icon: "ph-fill ph-users",
      number: "50,000+",
      label: tAbout("stats.users"),
      color: "text-warning-600",
    },
    {
      icon: "ph-fill ph-handshake",
      number: "5,000+",
      label: tAbout("stats.exchanges"),
      color: "text-info-600",
    },
  ];

  const features = [
    {
      icon: "ph-fill ph-magnifying-glass",
      title: tAbout("features.search.title"),
      description: tAbout("features.search.description"),
    },
    {
      icon: "ph-fill ph-map-pin",
      title: tAbout("features.location.title"),
      description: tAbout("features.location.description"),
    },
    {
      icon: "ph-fill ph-arrows-clockwise",
      title: tAbout("features.exchange.title"),
      description: tAbout("features.exchange.description"),
    },
    {
      icon: "ph-fill ph-gift",
      title: tAbout("features.giveaway.title"),
      description: tAbout("features.giveaway.description"),
    },
  ];

  return (
    <div className="about-us">
      {/* Hero Section */}
      <section className="about-hero py-48 position-relative">
        <div className="container container-lg">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-6">
              <div className="about-hero__content">
                <h1 className="text-3xl fw-bold mb-16 text-heading">
                  {tAbout("hero.title")}
                </h1>
                <p className="text-gray-700 mb-24 line-height-1-7">
                  {tAbout("hero.description")}
                </p>
                <div className="d-flex gap-12 flex-wrap">
                  <Link
                    href="/become-seller"
                    className="btn btn-main px-24 py-12 rounded-pill"
                  >
                    <i className="ph ph-storefront me-8" />
                    {tButtons("becomeSeller")}
                  </Link>
                  <Link
                    href="/contact"
                    className="btn btn-outline-main px-24 py-12 rounded-pill"
                  >
                    <i className="ph ph-envelope me-8" />
                    {tAbout("hero.contactUs")}
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-hero__image position-relative">
                <div
                  className="rounded-12 overflow-hidden"
                  style={{ position: "relative", height: "350px" }}
                >
                  <Image
                    src="/assets/images/thumbs/banner-img1.png"
                    alt="Kitobzor"
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </div>
                <div className="position-absolute bottom-0 start-0 bg-main-500 text-white px-20 py-12 rounded-12 m-12">
                  <div className="d-flex align-items-center gap-8">
                    <i className="ph-fill ph-book text-lg" />
                    <div className="text-sm fw-medium">
                      {tAbout("hero.slogan")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="about-stats py-48 bg-gray-50">
        <div className="container container-lg">
          <div className="section-heading text-center mb-32">
            <h5 className="text-2xl fw-bold mb-8 text-heading">
              {tAbout("stats.title") || "Bizning raqamlarimiz"}
            </h5>
            <p className="text-gray-600">
              {tAbout("stats.subtitle") || "Platformamizning muvaffaqiyati"}
            </p>
          </div>
          <div className="row gy-3">
            {stats.map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="stat-card text-center p-24 bg-white rounded-12 border border-gray-100 hover-border-main-500 transition-2 h-100">
                  <div className={`${stat.color} text-3xl mb-12`}>
                    <i className={stat.icon} />
                  </div>
                  <h3 className="text-2xl fw-bold text-heading mb-8">
                    {stat.number}
                  </h3>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="about-mission py-48">
        <div className="container container-lg">
          <div className="row gy-4">
            <div className="col-lg-6">
              <div className="mission-card p-32 bg-main-50 rounded-12 h-100 border border-main-100">
                <div className="w-64 h-64 flex-center bg-main-500 text-white rounded-circle mb-20">
                  <i className="ph-fill ph-target text-2xl" />
                </div>
                <h3 className="text-xl fw-bold mb-12 text-heading">{tAbout("mission.title")}</h3>
                <p className="text-gray-700 line-height-1-7">
                  {tAbout("mission.description")}
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="vision-card p-32 bg-warning-50 rounded-12 h-100 border border-warning-100">
                <div className="w-64 h-64 flex-center bg-warning-500 text-white rounded-circle mb-20">
                  <i className="ph-fill ph-eye text-2xl" />
                </div>
                <h3 className="text-xl fw-bold mb-12 text-heading">{tAbout("vision.title")}</h3>
                <p className="text-gray-700 line-height-1-7">
                  {tAbout("vision.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="about-features py-48 bg-white">
        <div className="container container-lg">
          <div className="section-heading text-center mb-32">
            <h5 className="text-2xl fw-bold mb-8 text-heading">{tAbout("features.title")}</h5>
            <p className="text-gray-600">
              {tAbout("features.subtitle")}
            </p>
          </div>
          <div className="row gy-3">
            {features.map((feature, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="feature-card p-24 bg-gray-50 rounded-12 border border-gray-100 hover-border-main-500 transition-2 h-100">
                  <div className="w-56 h-56 flex-center bg-main-50 text-main-500 rounded-circle mb-16">
                    <i className={`${feature.icon} text-2xl`} />
                  </div>
                  <h6 className="text-md fw-semibold mb-8 text-heading">{feature.title}</h6>
                  <p className="text-gray-600 text-sm line-height-1-6">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Shops Section */}
      <section className="about-shops py-48">
        <div className="container container-lg">
          <div className="section-heading text-center mb-32">
            <h5 className="text-2xl fw-bold mb-8 text-heading">{tAbout("shops.title")}</h5>
            <p className="text-gray-600">
              {tAbout("shops.subtitle")}
            </p>
          </div>
          <TopVendorsOne />
        </div>
      </section>

      {/* Contact Section */}
      <section className="about-contact py-48 bg-gray-50">
        <div className="container container-lg">
          <div className="section-heading text-center mb-32">
            <h5 className="text-2xl fw-bold mb-8 text-heading">{tAbout("contact.title")}</h5>
            <p className="text-gray-600">
              {tAbout("contact.subtitle")}
            </p>
          </div>
          <Contact />
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta py-48">
        <div className="container container-lg">
          <div className="cta-box bg-main-500 text-white rounded-12 p-32 text-center">
            <h3 className="text-2xl fw-bold mb-12">{tAbout("cta.title")}</h3>
            <p className="mb-24" style={{ maxWidth: '500px', margin: '0 auto', opacity: 0.95 }}>
              {tAbout("cta.description")}
            </p>
            <div className="d-flex gap-12 justify-content-center flex-wrap">
              <Link
                href="/become-seller"
                className="btn bg-white text-main-500 px-24 py-12 rounded-pill hover-bg-gray-100 fw-medium"
              >
                <i className="ph ph-storefront me-8" />
                {tButtons("becomeSeller")}
              </Link>
              <Link
                href="/vendor-two"
                className="btn btn-outline-white px-24 py-12 rounded-pill hover-bg-white hover-text-main-500 fw-medium"
              >
                <i className="ph ph-magnifying-glass me-8" />
                {tAbout("cta.exploreShops")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;

