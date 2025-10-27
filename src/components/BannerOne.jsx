"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Slider from "react-slick";
import { getBanners } from "@/services/banners";
import Image from "next/image";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/**
 * BannerOne — yaxshilangan versiya
 * - next/image bilan ishlaydi (fallback qo'llab-quvvatlanadi)
 * - Link href to'g'ri formatda (/vendor-two?id=...)
 * - loading, empty-state va error handling qo'shildi
 */

const BannerOne = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // local fallback image (public papkada bo'lishi kerak)
  const FALLBACK_SRC = "/assets/images/bg/banner-bg.png";

  useEffect(() => {
    let mounted = true;
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await getBanners({ limit: 10 });
        if (!mounted) return;
        // normalize (agar API boshqa kalit bilan qaytarsa)
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

  // Slick arrows (stylingni saqlab qoldim)
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

  const settings = {
    dots: false,
    arrows: true,
    infinite: banners.length > 1, // 1 taga teng bo'lsa infinite false bo'lsa better UX
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
  };

  // BannerImage helper - next/image bilan fallback qilish
  const BannerImage = ({ src, alt, priority = false }) => {
    const [imgSrc, setImgSrc] = useState(src || FALLBACK_SRC);

    useEffect(() => {
      setImgSrc(src || FALLBACK_SRC);
    }, [src]);

    return (
      <div style={{ position: "relative", width: "100%", height: 380 }}>
        {/* Using fill ensures responsive cover-like behaviour */}
        <Image
          src={imgSrc}
          alt={alt || "Banner"}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          style={{ objectFit: "cover", borderRadius: 12 }}
          onError={() => {
            // agar rasm yuklanmasa fallbackga o'tadi
            if (imgSrc !== FALLBACK_SRC) setImgSrc(FALLBACK_SRC);
          }}
          priority={priority}
        />
      </div>
    );
  };

  // Empty / loading state
  if (loading) {
    return (
      <div className="banner">
        <div className="container container-lg">
          <div className="banner-item rounded-24 overflow-hidden position-relative">
            <div className="d-flex align-items-center justify-content-center" style={{ height: 380 }}>
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

  // Agar bannerlar bo'lmasa - fallback single slide
  const slides = banners.length ? banners : [{ id: "empty-1", title: "Welcome", image: FALLBACK_SRC }];

  return (
    <div className="banner">
      <div className="container container-lg">
        <div className="banner-item rounded-24 overflow-hidden position-relative arrow-center">
          {/* scroll button (saqladim) */}
          <a
            href="#featureSection"
            className="scroll-down w-84 h-84 text-center flex-center bg-main-600 rounded-circle border-5 text-white border-white position-absolute start-50 translate-middle-x bottom-0 hover-bg-main-800"
            aria-label="Scroll down to features"
          >
            <span className="icon line-height-0">
              <i className="ph ph-caret-double-down" />
            </span>
          </a>

          {/* background fallback image (absolute) */}
          <img
            src={FALLBACK_SRC}
            alt=""
            className="banner-img position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 z-n1 object-fit-cover rounded-24"
            aria-hidden="true"
            style={{ zIndex: -1 }}
          />

          <div className="banner-slider">
            <Slider {...settings}>
              {slides.map((banner, index) => {
                const idKey = banner.id ?? index;
                const href = `/vendor-two-details?id=${encodeURIComponent(banner.id ?? "")}`;

                return (
                  <div className="banner-slider__item" key={idKey}>
                    <div className="banner-slider__inner flex-between position-relative" style={{ gap: 24 }}>
                      {/* Left content */}
                      <div className="banner-item__content" style={{ flex: 1, minWidth: 260 }}>
                        <h1 className="banner-item__title bounce" style={{ marginBottom: 16 }}>
                          {banner.title || banner.heading || "Shop"}
                        </h1>

                        <div style={{ marginTop: 12 }}>
                          <Link
                            href={href}
                            className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
                          >
                            Explore Shop
                            <span className="icon text-xl d-flex">
                              <i className="ph ph-shopping-cart-simple" />
                            </span>
                          </Link>
                        </div>
                      </div>

                      {/* Right thumbnail */}
                      <div className="banner-item__thumb" style={{ width: "45%", minWidth: 320 }}>
                        {/* BannerImage uses next/image with fallback */}
                        <BannerImage
                          src={banner.picture || banner.imageUrl || FALLBACK_SRC}
                          alt={banner.title || "Banner image"}
                          priority={index === 0}
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

export default BannerOne;

