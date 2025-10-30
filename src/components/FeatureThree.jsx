"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { getBookCategories } from "@/services/categories";

import dynamic from "next/dynamic";
const Slider = dynamic(() => import("react-slick"), { ssr: false });

const FeatureThree = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getBookCategories({ limit: 12 });
        setCategories(response.categories);
      } catch (err) {
        console.error("Kategoriyalar yuklashda xatolik:", err);
      }
    };

    fetchCategories();
  }, []);

  const NextArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      type="button"
      id="feature-item-wrapper-next"
      className="slick-next slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1"
    >
      <i className="ph ph-caret-right" />
    </button>
  );

  const PrevArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      type="button"
      id="feature-item-wrapper-prev"
      className="slick-prev slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1"
    >
      <i className="ph ph-caret-left" />
    </button>
  );
  const settings = {
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 900,
    dots: false,
    pauseOnHover: true,
    arrows: true,
    draggable: true,
    infinite: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1599,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1399,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 2,
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
  };
  return (
    <div
      className="feature feature-three mt-0 py-120 overflow-hidden"
      id="featureSection"
    >
      <div className="container container-lg">
        <div className="section-heading text-center">
          <h5 className="mb-0  text-uppercase">Popular Categories</h5>
        </div>
        <div className="position-relative arrow-center">
          <div className="feature-three-item-wrapper">
            <Slider {...settings}>
              {categories.map((category) => (
                <div key={category.id} className="feature-item text-center">
                  <div className="feature-item__thumb bg-yellow-light max-w-260 max-h-260 rounded-circle w-100 h-100">
                    <Link
                      href={`/shop?category=${category.id}`}
                      className="w-100 h-100 flex-center"
                    >
                      <img
                        src={
                          category.picture ||
                          "assets/images/thumbs/features-three-img1.png"
                        }
                        alt={category.name}
                      />
                    </Link>
                  </div>
                  <div className="feature-item__content mt-20">
                    <h6 className="text-lg mb-8">
                      <Link
                        href={`/shop?category=${category.id}`}
                        className="text-inherit"
                      >
                        {category.name}
                      </Link>
                    </h6>
                    <span className="text-sm text-gray-900">180 Items</span>
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

export default FeatureThree;
