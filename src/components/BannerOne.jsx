"use client";

import React, { useEffect, useState, useMemo, memo } from "react";
import { Link } from "@/i18n/navigation";
import Slider from "react-slick";
import { getBanners } from "@/services/banners";
import Image from "next/image";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslations } from "next-intl";

// Separate BannerImage component (no hooks inside parent component)
const BannerImage = memo(({ src, alt, priority, fallbackSrc }) => (
  <div style={{ position: "relative", width: "100%", height: 380 }}>
    <Image
      src={src || fallbackSrc}
      alt={alt || "Banner"}
      fill
      sizes="(max-width: 768px) 100vw, 1200px"
      style={{ objectFit: "cover", borderRadius: 12 }}
      priority={priority}
    />
  </div>
));

BannerImage.displayName = "BannerImage";

const BannerOne = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const FALLBACK_SRC = "/assets/images/bg/banner-bg.png";
  const tCommon = useTranslations("Common")
  const tBread = useTranslations("Breadcrumb")

  useEffect(() => {
    let mounted = true;
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await getBanners({ limit: 10 });
        if (!mounted) return;
        const items = response?.banners || response?.data || [];
        setBanners(Array.isArray(items) ? items : []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Xatolik yuz berdi");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBanners();
    return () => {
      mounted = false;
    };
  }, []);

  // Slick arrows
  function SampleNextArrow({ className, onClick }) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Next slide"
        className={`${className} slick-next slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
      >
        <i className="ph ph-caret-right" />
      </button>
    );
  }

  function SamplePrevArrow({ className, onClick }) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Previous slide"
        className={`${className} slick-prev slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
      >
        <i className="ph ph-caret-left" />
      </button>
    );
  }

  // Memoized settings
  const settings = useMemo(
    () => ({
      dots: false,
      arrows: true,
      infinite: banners.length > 1,
      speed: 800,
      slidesToShow: 1,
      slidesToScroll: 1,
      initialSlide: 0,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      autoplay: banners.length > 1,
      autoplaySpeed: 6000,
      responsive: [
        { breakpoint: 992, settings: { arrows: false } },
        { breakpoint: 576, settings: { arrows: false, dots: true } },
      ],
    }),
    [banners.length]
  );

  // Memoized slides
  const slides = useMemo(
    () =>
      banners.length
        ? banners
        : [{ id: "empty-1", title: "Welcome", image: FALLBACK_SRC }],
    [banners, FALLBACK_SRC]
  );

  // Early returns AFTER all hooks
  if (loading) {
    return (
      <div className="banner">
        <div className="container container-lg">
          <div className="banner-item rounded-24 overflow-hidden position-relative">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ height: 380 }}
            >
              <div>Yuklanmoqda...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="banner">
        <div className="container container-lg">
          <div className="banner-item rounded-24 overflow-hidden position-relative">
            <div className="p-24 text-center">
              <p>Xatolik: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="banner">
      <div className="container container-lg">
        <div className="banner-item rounded-24 overflow-hidden position-relative arrow-center">
          <a
            href="#featureSection"
            className="scroll-down w-84 h-84 text-center flex-center bg-main-600 rounded-circle border-5 text-white border-white position-absolute start-50 translate-middle-x bottom-0 hover-bg-main-800"
            aria-label="Scroll down to features"
          >
            <span className="icon line-height-0">
              <i className="ph ph-caret-double-down" />
            </span>
          </a>

          <Image
            src={FALLBACK_SRC}
            alt=""
            fill
            className="banner-img position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 z-n1 object-fit-cover rounded-24"
            aria-hidden="true"
            style={{ zIndex: -1 }}
            priority={false}
          />

          <div className="banner-slider">
            <Slider {...settings}>
              {slides.map((banner, index) => {
                const idKey = banner.id ?? index;
                const href = `/vendor-two-details?id=${encodeURIComponent(
                  banner.id ?? ""
                )}`;

                return (
                  <div className="banner-slider__item" key={idKey}>
                    <div
                      className="banner-slider__inner flex-between position-relative"
                      style={{ gap: 24 }}
                    >
                      <div
                        className="banner-item__content "
                        style={{ flex: 1, minWidth: 260 }}
                      >
                        <h1
                          className="banner-item__title bounce"
                          style={{ marginBottom: 24 }}
                        >
                          {/* {banner.title  || "Shop"} */}
                          Bu yerda uzunroq tekst tursin!
                        </h1>

                        <div style={{ marginTop: 12 }}>
                          <Link
                            href={href}
                            className="btn btn-main d-inline-flex align-items-center rounded-pill pt-8 gap-8"
                          >
                            {tBread("exploreShop")}
                            <span className="icon text-xl d-flex">
                              <i className="ph ph-shopping-cart-simple" />
                            </span>
                          </Link>
                        </div>
                      </div>

                      <div
                        className="banner-item__thumb"
                        style={{ width: "45%", minWidth: 320 }}
                      >
                        <BannerImage
                          src={banner.picture || banner.imageUrl}
                          alt={banner.title || "Banner image"}
                          priority={index === 0}
                          fallbackSrc={FALLBACK_SRC}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(BannerOne);
