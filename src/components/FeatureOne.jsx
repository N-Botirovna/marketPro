"use client";
import React, { useState, useEffect, memo, useMemo, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getBookCategories } from "@/services/categories";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

const FeatureOne = () => {
  const [categories, setCategories] = useState([]);
  const sliderRef = useRef(null);
  const tVendor = useTranslations("VendorTwoSideBar");

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const response = await getBookCategories({ limit: 12 });
        if (mounted) {
          setCategories(response.categories || []);
        }
      } catch (err) {
        console.error("Kategoriyalar yuklashda xatolik:", err);
      }
    };

    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const SampleNextArrow = memo((props) => {
    const { className, onClick, style } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} slick-next slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
        style={style}
        aria-label="Next"
      >
        <i className="ph ph-caret-right" />
      </button>
    );
  });
  SampleNextArrow.displayName = "SampleNextArrow";

  const SamplePrevArrow = memo((props) => {
    const { className, onClick, style } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} slick-prev slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
        style={style}
        aria-label="Previous"
      >
        <i className="ph ph-caret-left" />
      </button>
    );
  });
  SamplePrevArrow.displayName = "SamplePrevArrow";

  const settings = useMemo(
    () => {
      // Kategoriyalar sonini tekshiramiz - infinite uchun kamida slidesToShow dan ko'p bo'lishi kerak
      const canInfinite = categories.length > 10;
      // Autoplay uchun kamida 2 ta slide bo'lishi kerak
      const canAutoplay = categories.length > 1;
      
      return {
        dots: false,
        arrows: true,
        infinite: true, // Har doim true qilamiz, autoplay uchun kerak
        speed: 800,
        slidesToShow: Math.min(10, categories.length || 1),
        slidesToScroll: 1,
        initialSlide: 0,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        autoplay: canAutoplay,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        pauseOnFocus: true,
        pauseOnDotsHover: true,
        swipe: true,
        swipeToSlide: true,
        touchMove: true,
        cssEase: "ease-in-out",
        adaptiveHeight: false,
        lazyLoad: "ondemand",
        waitForAnimate: false,
        responsive: [
          {
            breakpoint: 1699,
            settings: {
              slidesToShow: Math.min(9, categories.length),
              infinite: true,
              autoplay: categories.length > 1,
              autoplaySpeed: 3000,
            },
          },
          {
            breakpoint: 1599,
            settings: {
              slidesToShow: Math.min(8, categories.length),
              infinite: true,
              autoplay: categories.length > 1,
              autoplaySpeed: 3000,
            },
          },
          {
            breakpoint: 1399,
            settings: {
              slidesToShow: Math.min(6, categories.length),
              infinite: true,
              autoplay: categories.length > 1,
              autoplaySpeed: 3000,
            },
          },
          {
            breakpoint: 992,
            settings: {
              slidesToShow: Math.min(5, categories.length),
              infinite: true,
              autoplay: categories.length > 1,
              autoplaySpeed: 3000,
            },
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: Math.min(4, categories.length),
              infinite: true,
              autoplay: categories.length > 1,
              autoplaySpeed: 3000,
            },
          },
          {
            breakpoint: 575,
            settings: {
              slidesToShow: Math.min(3, categories.length),
              infinite: true,
              autoplay: categories.length > 1,
              autoplaySpeed: 3000,
            },
          },
          {
            breakpoint: 424,
            settings: {
              slidesToShow: Math.min(2, categories.length),
              infinite: true,
              autoplay: categories.length > 1,
              autoplaySpeed: 3000,
            },
          },
          {
            breakpoint: 359,
            settings: {
              slidesToShow: 1,
              infinite: categories.length > 1,
              autoplay: categories.length > 1,
              autoplaySpeed: 3000,
            },
          },
        ],
      };
    },
    [categories.length]
  );
  return (
    <div className="feature" id="featureSection">
      <div className="container container-lg">
        <div className="position-relative arrow-center">
          <div className="feature-item-wrapper">
            <Slider {...settings} ref={sliderRef}>
              {categories.map((category) => (
                <div key={category.id} className="feature-item text-center">
                  <div
                    className="feature-item__thumb rounded-circle overflow-hidden"
                    style={{
                      width: 100,
                      height: 100,
                      margin: "0 auto",
                      position: "relative",
                    }}
                  >
                    <Link
                      href={`/vendor-two?category=${encodeURIComponent(category.name)}`}
                      className="w-100 h-100 flex-center"
                    >
                      <Image
                        src={
                          category.picture ||
                          "/assets/images/thumbs/feature-img1.png"
                        }
                        alt={category.name}
                        fill
                        sizes="100px"
                        style={{ objectFit: "cover" }}
                        loading="lazy"
                      />
                    </Link>
                  </div>
                  <div className="feature-item__content mt-16">
                    <h6 className="text-lg mb-8">
                      <Link
                        href={`/vendor-two?category=${encodeURIComponent(category.name)}`}
                        className="text-inherit hover-text-main-600 transition-1"
                      >
                        {category.name}
                      </Link>
                    </h6>
                    <span className="text-sm text-gray-400">
                      {category.books_count || category.book_count || 0} {tVendor("booksCount")}
                    </span>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(FeatureOne);
