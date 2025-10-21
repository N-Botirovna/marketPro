"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Slider from "react-slick";
import { getBanners } from "@/services/banners";
const BannerOne = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await getBanners({ limit: 10 });
        setBanners(response.banners);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  function SampleNextArrow(props) {
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
  }
  function SamplePrevArrow(props) {
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
  }
  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 1500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };
  return (
    <div className="banner">
      <div className="container container-lg">
        <div className="banner-item rounded-24 overflow-hidden position-relative arrow-center">
          <a
            href="#featureSection"
            className="scroll-down w-84 h-84 text-center flex-center bg-main-600 rounded-circle  border-5 text-white border-white position-absolute start-50 translate-middle-x bottom-0 hover-bg-main-800"
          >
            <span className="icon line-height-0">
              <i className="ph ph-caret-double-down" />
            </span>
          </a>
          <img
            src="/assets/images/bg/banner-bg.png"
            alt=""
            className="banner-img position-absolute inset-block-start-0 inset-inline-start-0 w-100 h-100 z-n1 object-fit-cover rounded-24"
          />
          <div className="flex-align"></div>
          <div className="banner-slider">
            <Slider {...settings}>
              {banners.map((banner, index) => (
                <div className="banner-slider__item" key={banner.id || index}>  
                  <div className="banner-slider__inner flex-between position-relative">
                    <div className="banner-item__content">
                      <h1 className="banner-item__title bounce">
                        {banner.title}
                      </h1>
                      <Link
                        href="/vendor-two"
                        className="btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
                      >
                        Explore Shop{" "}
                        <span className="icon text-xl d-flex">
                          <i className="ph ph-shopping-cart-simple" />{" "}
                        </span>
                      </Link>
                    </div>
                    <div className="banner-item__thumb">
                      <img
                        src={banner.image || "/assets/images/bg/banner-bg.png"}
                        alt={banner.title || "Banner"}
                        className="object-cover rounded-lg w-100 h-auto"
                        onError={(e) => {
                          e.target.src = "/assets/images/bg/banner-bg.png";
                        }}
                      />
                    </div>
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

export default BannerOne;
