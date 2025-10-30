"use client";
import React, { useState, useEffect, memo, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getBookCategories } from "@/services/categories";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

const FeatureOne = () => {
  const [categories, setCategories] = useState([]);

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
    const { className, onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={` ${className} slick-next slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
      >
        <i className="ph ph-caret-right" />
      </button>
    );
  });

  const SamplePrevArrow = memo((props) => {
    const { className, onClick } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} slick-prev slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
      >
        <i className="ph ph-caret-left" />
      </button>
    );
  });

  const settings = useMemo(
    () => ({
      dots: false,
      arrows: true,
      infinite: true,
      speed: 1000,
      slidesToShow: 10,
      slidesToScroll: 1,
      initialSlide: 0,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      responsive: [
        {
          breakpoint: 1699,
          settings: {
            slidesToShow: 9,
          },
        },
        {
          breakpoint: 1599,
          settings: {
            slidesToShow: 8,
          },
        },
        {
          breakpoint: 1399,
          settings: {
            slidesToShow: 6,
          },
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 5,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 4,
          },
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 424,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 359,
          settings: {
            slidesToShow: 1,
          },
        },
      ],
    }),
    []
  );
  return (
    <div className="feature" id="featureSection">
      <div className="container container-lg">
        <div className="position-relative arrow-center">
          <div className="flex-align">
            <button
              type="button"
              id="feature-item-wrapper-prev"
              className="slick-prev slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1"
            >
              <i className="ph ph-caret-left" />
            </button>
            <button
              type="button"
              id="feature-item-wrapper-next"
              className="slick-next slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1"
            >
              <i className="ph ph-caret-right" />
            </button>
          </div>
          <div className="feature-item-wrapper">
            <Slider {...settings}>
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
                      href={`/vendor-two?category=${category.name}`}
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
                        href={`/vendor-two?category=${category.name}`}
                        className="text-inherit"
                      >
                        {category.name}
                      </Link>
                    </h6>
                    <span className="text-sm text-gray-400">125+ Products</span>
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
