"use client";
import React, { memo, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getActiveGiveaway } from "@/services/giveaway";
import { formatPrice } from "@/utils/formatPrice";
import { useLocale } from "next-intl";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

const SampleNextArrow = memo((props) => {
  const { className, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={` ${className} slick-next slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1`}
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
      className={`${className} slick-prev slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1`}
    >
      <i className="ph ph-caret-left" />
    </button>
  );
});

const HotDealsOne = () => {
  const locale = useLocale();
  const [giveaway, setGiveaway] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Countdown timer'ni hisoblash
  const calculateTimeLeft = (endDate) => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const distance = end - now;

    if (distance <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((distance / 1000 / 60) % 60),
      seconds: Math.floor((distance / 1000) % 60),
    };
  };

  // API'dan give-away ma'lumotlarini olish
  useEffect(() => {
    const fetchGiveaway = async () => {
      try {
        setLoading(true);
        console.log("🔄 Fetching give-away data from API...");
        
        const result = await getActiveGiveaway();
        console.log("✅ Give-away data received:", result.giveaway);
        
        if (result.giveaway) {
          setGiveaway(result.giveaway);
          
          // Birinchi countdownni set qilish
          if (result.giveaway?.end_date) {
            setTimeLeft(calculateTimeLeft(result.giveaway.end_date));
          }
        } else {
          throw new Error("No give-away data returned");
        }
      } catch (err) {
        console.error("❌ Error fetching giveaway:", err);
        
        // Development: Mock data for testing
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ Using mock data in development...");
          const mockData = {
            id: 1,
            title: "🎁 Special Giveaway - Fresh Vegetables",
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            is_completed: false,
            giveaway_books: [
              {
                id: 1,
                books: {
                  id: 1,
                  type: "gift",
                  is_used: false,
                  name: "Marcel's Modern Pantry Almond Unsweetened",
                  author: "Marcel's Brand",
                  price: "28.99",
                  discount_price: "14.99",
                  percentage: "50",
                  picture: "/assets/images/thumbs/product-img8.png",
                  owner_type: "user",
                  like_count: "1250",
                  view_count: "5420",
                  created_at: new Date().toISOString(),
                  shop: {
                    id: 1,
                    name: "Lucky Supermarket",
                    picture: "/assets/images/shop-logo.png",
                  },
                  posted_by: {
                    id: 1,
                    first_name: "John",
                    last_name: "Seller",
                    picture: "/assets/images/user-avatar.png",
                  },
                },
                participants_count: 1250,
              },
              {
                id: 2,
                books: {
                  id: 2,
                  type: "gift",
                  is_used: false,
                  name: "O Organics Milk, Whole, Vitamin D",
                  author: "O Organics",
                  price: "5.99",
                  discount_price: "3.99",
                  percentage: "33",
                  picture: "/assets/images/thumbs/product-img9.png",
                  owner_type: "user",
                  like_count: "890",
                  view_count: "3120",
                  created_at: new Date().toISOString(),
                  shop: {
                    id: 1,
                    name: "Lucky Supermarket",
                    picture: "/assets/images/shop-logo.png",
                  },
                  posted_by: {
                    id: 2,
                    first_name: "Jane",
                    last_name: "Vendor",
                    picture: "/assets/images/user-avatar.png",
                  },
                },
                participants_count: 890,
              },
            ],
          };
          setGiveaway(mockData);
          setTimeLeft(calculateTimeLeft(mockData.end_date));
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGiveaway();
  }, []);

  // Countdown interval
  useEffect(() => {
    if (!giveaway?.end_date) return;

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(giveaway.end_date));
    }, 1000);

    return () => clearInterval(interval);
  }, [giveaway?.end_date]);

  const settings = useMemo(
    () => ({
      dots: false,
      arrows: true,
      infinite: true,
      speed: 1000,
      slidesToShow: 4,
      slidesToScroll: 1,
      initialSlide: 0,
      autoplay: true,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      responsive: [
        {
          breakpoint: 1399,
          settings: {
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 1199,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 575,
          settings: {
            slidesToShow: 1,
          },
        },
      ],
    }),
    []
  );
  // Loading va error states
  if (loading) {
    return (
      <section className="hot-deals pt-80">
        <div className="container container-lg">
          <div className="flex-center p-40">
            <div className="spinner-border text-main-600" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error debugging UI
  if (error || !giveaway) {
    return (
      <section className="hot-deals pt-80">
        <div className="container container-lg">
          <div className="bg-danger-100 border border-danger-600 rounded-16 p-24 text-center">
            <div className="mb-16">
              <i className="ph ph-warning-circle text-danger-600 text-4xl" />
            </div>
            <h5 className="text-danger-600 mb-8">Failed to Load Hot Deals</h5>
            <p className="text-gray-600 mb-16">
              {error ? `Error: ${error}` : "No give-away data available"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-danger-600"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hot-deals pt-80">
      <div className="container container-lg">
        <div className="section-heading">
          <div className="flex-between flex-wrap gap-8">
            <h5 className="mb-0">{giveaway?.title || "Hot Deals Today"}</h5>
            <div className="flex-align mr-point gap-16">
              <Link
                href="/vendor-two?type=hot"
                className="text-sm fw-medium text-gray-700 hover-text-main-600 hover-text-decoration-underline"
              >
                View All Deals
              </Link>
            </div>
          </div>
        </div>
        <div className="row g-12">
          <div className="col-md-4">
            <div className="hot-deals position-relative rounded-16 bg-main-600 overflow-hidden p-28 z-1 text-center">
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: -1,
                  opacity: 0.6,
                }}
              >
                <Image
                  src="/assets/images/shape/offer-shape.png"
                  alt="marketpro"
                  fill
                  sizes="400px"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
              <div
                className="hot-deals__thumb"
                style={{ position: "relative", width: "100%", height: 200 }}
              >
                <Image
                  src="/assets/images/thumbs/hot-deals-img.png"
                  alt="marketpro"
                  fill
                  sizes="300px"
                  style={{ objectFit: "contain" }}
                  loading="lazy"
                />
              </div>
              <div className="py-xl-4">
                <h4 className="text-white mb-8">{giveaway?.title || "Special Offer"}</h4>
                <div className="countdown my-32" id="countdown4">
                  <ul className="countdown-list flex-center flex-wrap">
                    <li className="countdown-list__item text-heading flex-align gap-4 text-sm fw-medium colon-white">
                      <span className="days" />
                      {timeLeft.days} Days
                    </li>
                    <li className="countdown-list__item text-heading flex-align gap-4 text-sm fw-medium colon-white">
                      <span className="hours" />
                      {timeLeft.hours} Hours
                    </li>
                    <li className="countdown-list__item text-heading flex-align gap-4 text-sm fw-medium colon-white">
                      <span className="minutes" />
                      {timeLeft.minutes} Min
                    </li>
                    <li className="countdown-list__item text-heading flex-align gap-4 text-sm fw-medium colon-white">
                      <span className="seconds" />
                      {timeLeft.seconds} Sec
                    </li>
                  </ul>
                </div>
                <Link
                  href="/vendor-two?type=hot"
                  className="mt-16 btn btn-main-two fw-medium d-inline-flex align-items-center rounded-pill gap-8"
                >
                  Shop Now
                  <span className="icon text-xl d-flex">
                    <i className="ph ph-arrow-right" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="hot-deals-slider arrow-style-two">
              <Slider {...settings}>
                {giveaway?.giveaway_books && giveaway.giveaway_books.length > 0 ? (
                  giveaway.giveaway_books.map((giveawayBook, index) => {
                    const book = giveawayBook?.books;
                    const discountPercentage = book?.percentage ? parseInt(book.percentage) : 0;
                    const originalPrice = parseFloat(book?.price) || 0;
                    const discountedPrice = parseFloat(book?.discount_price) || 0;

                    return (
                      <div key={index}>
                        <div className="product-card h-100 p-8 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
                          <span className="product-card__badge bg-danger-600 px-8 py-4 text-sm text-white">
                            {discountPercentage > 0 ? `${discountPercentage}% Off` : "Sale"}
                          </span>
                          <Link
                            href={`/product-details/${book?.id}`}
                            className="product-card__thumb flex-center"
                          >
                            <div
                              style={{
                                position: "relative",
                                width: "100%",
                                height: 180,
                              }}
                            >
                              {book?.picture ? (
                                <Image
                                  src={book.picture}
                                  alt={book?.name || "Product"}
                                  fill
                                  sizes="200px"
                                  style={{ objectFit: "contain" }}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.src = "/assets/images/thumbs/product-img8.png";
                                  }}
                                />
                              ) : (
                                <Image
                                  src="/assets/images/thumbs/product-img8.png"
                                  alt="No image"
                                  fill
                                  sizes="200px"
                                  style={{ objectFit: "contain" }}
                                  loading="lazy"
                                />
                              )}
                            </div>
                          </Link>
                          <div className="product-card__content p-sm-2">
                            {/* Product Title */}
                            <h6 className="title text-lg fw-semibold mt-12 mb-8">
                              <Link
                                href={`/product-details/${book?.id}`}
                                className="link text-line-2"
                              >
                                {book?.name || "Unknown Product"}
                              </Link>
                            </h6>

                            {/* Author */}
                            {book?.author && (
                              <p className="text-gray-500 text-xs mb-8">
                                <span className="fw-medium">Muallif:</span> {book.author}
                              </p>
                            )}

                            {/* Shop Info */}
                            <div className="flex-align gap-4 mb-8">
                              {book?.shop?.picture ? (
                                <div style={{ position: "relative", width: 24, height: 24 }}>
                                  <Image
                                    src={book.shop.picture}
                                    alt={book?.shop?.name || "Shop"}
                                    fill
                                    sizes="24px"
                                    style={{ objectFit: "contain", borderRadius: "50%" }}
                                    loading="lazy"
                                  />
                                </div>
                              ) : (
                                <span className="text-main-600 text-md d-flex">
                                  <i className="ph-fill ph-storefront" />
                                </span>
                              )}
                              <span className="text-gray-500 text-xs">
                                {book?.shop?.name || "Shop"}
                              </span>
                            </div>

                            {/* Seller/Posted By */}
                            {book?.posted_by && (
                              <div className="flex-align gap-4 mb-8">
                                {book.posted_by?.picture ? (
                                  <div style={{ position: "relative", width: 20, height: 20 }}>
                                    <Image
                                      src={book.posted_by.picture}
                                      alt={`${book.posted_by?.first_name} ${book.posted_by?.last_name}`}
                                      fill
                                      sizes="20px"
                                      style={{ objectFit: "cover", borderRadius: "50%" }}
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-main-600 text-xs d-flex">
                                    <i className="ph-fill ph-user" />
                                  </span>
                                )}
                                <span className="text-gray-500 text-xs">
                                  {book.posted_by?.first_name} {book.posted_by?.last_name}
                                </span>
                              </div>
                            )}

                            {/* Price Section */}
                            <div className="product-card__content mt-12">
                              <div className="product-card__price mb-8">
                                <span className="text-heading text-md fw-semibold">
                                  {formatPrice(discountedPrice || originalPrice, locale)}{" "}
                                  <span className="text-gray-500 fw-normal">
                                    /Qty
                                  </span>
                                </span>
                                {originalPrice > discountedPrice && discountedPrice > 0 && (
                                  <span className="text-gray-400 text-md fw-semibold text-decoration-line-through">
                                    {formatPrice(originalPrice, locale)}
                                  </span>
                                )}
                              </div>

                              {/* Stats Row */}
                              <div className="flex-align gap-8 flex-wrap text-xs text-gray-600">
                                {/* Participants Count */}
                                <div className="flex-align gap-4">
                                  <i className="ph-fill ph-users text-main-600" />
                                  <span className="fw-semibold">
                                    {giveawayBook?.participants_count || 0} участников
                                  </span>
                                </div>

                                {/* Like Count */}
                                {book?.like_count && (
                                  <div className="flex-align gap-4">
                                    <i className="ph-fill ph-heart text-danger-600" />
                                    <span className="fw-semibold">{book.like_count}</span>
                                  </div>
                                )}

                                {/* View Count */}
                                {book?.view_count && (
                                  <div className="flex-align gap-4">
                                    <i className="ph-fill ph-eye text-blue-600" />
                                    <span className="fw-semibold">{book.view_count}</span>
                                  </div>
                                )}
                              </div>

                              {/* Book Type Badge */}
                              {book?.type && (
                                <div className="mt-8">
                                  <span className="badge bg-info-100 text-info-600 text-xs fw-semibold px-6 py-2 rounded-pill">
                                    {book.type === "gift" ? "🎁 Gift" : book.type}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-40">
                    <p className="text-gray-600">No products available</p>
                  </div>
                )}
              </Slider>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(HotDealsOne);
