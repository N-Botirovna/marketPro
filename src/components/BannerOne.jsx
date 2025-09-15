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
        console.error('Banner yuklashda xatolik:', err);
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
        type='button'
        onClick={onClick}
        className={` ${className} slick-next slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
      >
        <i className='ph ph-caret-right' />
      </button>
    );
  }
  function SamplePrevArrow(props) {
    const { className, onClick } = props;

    return (
      <button
        type='button'
        onClick={onClick}
        className={`${className} slick-prev slick-arrow flex-center rounded-circle bg-white text-xl hover-bg-main-600 hover-text-white transition-1`}
      >
        <i className='ph ph-caret-left' />
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
  // Loading state
  if (loading) {
    return (
      <div className='banner'>
        <div className='container container-lg'>
          <div className='banner-item rounded-24 overflow-hidden position-relative arrow-center'>
            <div className='d-flex justify-content-center align-items-center' style={{ height: '400px' }}>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='banner'>
        <div className='container container-lg'>
          <div className='banner-item rounded-24 overflow-hidden position-relative arrow-center'>
            <div className='d-flex justify-content-center align-items-center' style={{ height: '400px' }}>
              <div className='text-center'>
                <p className='text-danger'>Banner yuklashda xatolik yuz berdi</p>
                <button 
                  className='btn btn-outline-primary'
                  onClick={() => window.location.reload()}
                >
                  Qayta urinish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No banners
  if (!banners || banners.length === 0) {
    return (
      <div className='banner'>
        <div className='container container-lg'>
          <div className='banner-item rounded-24 overflow-hidden position-relative arrow-center'>
            <div className='d-flex justify-content-center align-items-center' style={{ height: '400px' }}>
              <div className='text-center'>
                <p className='text-muted'>Bannerlar topilmadi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='banner'>
      <div className='container container-lg'>
        <div className='banner-item rounded-24 overflow-hidden position-relative arrow-center'>
          <a
            href='#featureSection'
            className='scroll-down w-84 h-84 text-center flex-center bg-main-600 rounded-circle border-5 text-white border-white position-absolute start-50 translate-middle-x bottom-0 hover-bg-main-800'
          >
            <span className='icon line-height-0'>
              <i className='ph ph-caret-double-down' />
            </span>
          </a>
          <div className='banner-slider'>
            <Slider {...settings}>
              {banners.map((banner, index) => (
                <div key={banner.id || index} className='banner-slider__item'>
                  <div className='banner-slider__inner d-flex align-items-center justify-content-between position-relative'>
                    <div className='banner-item__content' style={{ flex: '0 0 55%', paddingRight: '30px' }}>
                      <h1 className='banner-item__title bounce'>
                        {banner.title || 'Daily Grocery Order and Get Express Delivery'}
                      </h1>
                      <Link
                        href='/shop'
                        className='btn btn-main d-inline-flex align-items-center rounded-pill gap-8'
                      >
                        Explore Shop{" "}
                        <span className='icon text-xl d-flex'>
                          <i className='ph ph-shopping-cart-simple' />{" "}
                        </span>
                      </Link>
                    </div>
                    <div className='banner-item__thumb' style={{ flex: '0 0 45%' }}>
                      <img 
                        src={banner.picture || 'assets/images/thumbs/banner-img1.png'} 
                        alt={banner.title || 'Banner'} 
                        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.src = 'assets/images/thumbs/banner-img1.png';
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
