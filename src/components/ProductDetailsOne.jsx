"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { getBookById } from "@/services/books";
import Slider from "react-slick";
import Spin from "./Spin";

const ProductDetailsOne = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Hardcoded future date for countdown
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 10); 

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (id) {
      const fetchBookDetails = async () => {
        try {
          setLoading(true);
          const response = await getBookById(id);
          setBook(response.book);
        } catch (err) {
          setError("Failed to fetch book details.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchBookDetails();
    }
  }, [id]);

  // Dummy images for the slider as they are not in the API response
  const productImages = [
    book?.picture || "assets/images/thumbs/product-details-thumb1.png",
    "assets/images/thumbs/product-details-thumb2.png",
    "assets/images/thumbs/product-details-thumb3.png",
    "assets/images/thumbs/product-details-thumb2.png",
  ];

  const [mainImage, setMainImage] = useState(productImages[0]);
  useEffect(() => {
    setMainImage(book?.picture || "assets/images/thumbs/product-details-thumb1.png");
  }, [book]);

  const [quantity, setQuantity] = useState(1);
  const incrementQuantity = () => setQuantity(quantity + 1);
  const decrementQuantity = () => setQuantity(quantity > 1 ? quantity - 1 : quantity);

  const settingsThumbs = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    focusOnSelect: true,
  };

  if (loading) return (
    <div className="text-center py-80">
      <Spin text="Kitob ma'lumotlari yuklanmoqda..." />
    </div>
  );
  if (error) return <div className="text-center py-80 text-danger">{error}</div>;
  if (!book) return <div className="text-center py-80">Book not found.</div>;

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "";
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };
  
  const sellerName = book.shop?.name || `${book.posted_by?.first_name || 'Noma\'lum'} ${book.posted_by?.last_name || ''}`.trim();

  return (
    <section className='product-details py-80'>
      <div className='container container-lg'>
        <div className='row gy-4'>
          <div className='col-lg-9'>
            <div className='row gy-4'>
              <div className='col-xl-6'>
                <div className='product-details__left'>
                  <div className='product-details__thumb-slider border border-gray-100 rounded-16'>
                    <div className='product-details__thumb flex-center h-100'>
                      <img src={mainImage} alt={book.name} style={{ maxHeight: '400px', width: 'auto' }} />
                    </div>
                  </div>
                  <div className='mt-24'>
                    <div className='product-details__images-slider'>
                      <Slider {...settingsThumbs}>
                        {productImages.map((image, index) => (
                          <div
                            className='center max-w-120 max-h-120 h-100 flex-center border border-gray-100 rounded-16 p-8'
                            key={index}
                            onClick={() => setMainImage(image)}
                          >
                            <img className='thum' src={image} alt={`Thumbnail ${index}`} />
                          </div>
                        ))}
                      </Slider>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-xl-6'>
                <div className='product-details__content'>
                  <h5 className='mb-12'>{book.name}</h5>
                  <div className='flex-align flex-wrap gap-12'>
                    <div className='flex-align gap-12 flex-wrap'>
                      <div className='flex-align gap-8'>
                        <span className='text-15 fw-medium text-warning-600 d-flex'><i className='ph-fill ph-star' /></span>
                        <span className='text-15 fw-medium text-warning-600 d-flex'><i className='ph-fill ph-star' /></span>
                        <span className='text-15 fw-medium text-warning-600 d-flex'><i className='ph-fill ph-star' /></span>
                        <span className='text-15 fw-medium text-warning-600 d-flex'><i className='ph-fill ph-star' /></span>
                        <span className='text-15 fw-medium text-warning-600 d-flex'><i className='ph-fill ph-star' /></span>
                      </div>
                      <span className='text-sm fw-medium text-neutral-600'>
                        4.7 Star Rating
                      </span>
                      <span className='text-sm fw-medium text-gray-500'>
                        ({book.view_count} Views)
                      </span>
                    </div>
                    <span className='text-sm fw-medium text-gray-500'>|</span>
                    <span className='text-gray-900'>
                      <span className='text-gray-400'>Muallif: </span>{book.author || "Noma'lum"}
                    </span>
                  </div>
                  <span className='mt-32 pt-32 text-gray-700 border-top border-gray-100 d-block' />
                  
                  <div className='mt-32 flex-align flex-wrap gap-32'>
                    <div className='flex-align gap-8'>
                      <h4 className='mb-0'>{formatPrice(book.discount_price || book.price)}</h4>
                      {book.discount_price && <span className='text-md text-gray-500 text-decoration-line-through'>{formatPrice(book.price)}</span>}
                    </div>
                  </div>
                  <span className='mt-32 pt-32 text-gray-700 border-top border-gray-100 d-block' />
                  <div className='flex-align flex-wrap gap-16 bg-color-one rounded-8 py-16 px-24'>
                    <div className='flex-align gap-16'>
                      <span className='text-main-600 text-sm'>
                        Maxsus taklif:
                      </span>
                    </div>
                    <div className='countdown' id='countdown11'>
                      <ul className='countdown-list flex-align flex-wrap'>
                        <li className='countdown-list__item text-heading flex-align gap-4 text-xs fw-medium w-28 h-28 rounded-4 border border-main-600 p-0 flex-center'>
                          {timeLeft.days} <span className='days' />
                        </li>
                        <li className='countdown-list__item text-heading flex-align gap-4 text-xs fw-medium w-28 h-28 rounded-4 border border-main-600 p-0 flex-center'>
                          {timeLeft.hours}
                          <span className='hours' />
                        </li>
                        <li className='countdown-list__item text-heading flex-align gap-4 text-xs fw-medium w-28 h-28 rounded-4 border border-main-600 p-0 flex-center'>
                          {timeLeft.minutes}
                          <span className='minutes' />
                        </li>
                        <li className='countdown-list__item text-heading flex-align gap-4 text-xs fw-medium w-28 h-28 rounded-4 border border-main-600 p-0 flex-center'>
                          {timeLeft.seconds}
                          <span className='seconds' />
                        </li>
                      </ul>
                    </div>
                    <span className='text-gray-900 text-xs'>
                      Taklifning tugashiga qoldi
                    </span>
                  </div>
                   <div className='mb-24'>
                    <div className='mt-32 flex-align gap-12 mb-16'>
                      <span className='w-32 h-32 bg-white flex-center rounded-circle text-main-600 box-shadow-xl'>
                        <i className='ph-fill ph-lightning' />
                      </span>
                      <h6 className='text-md mb-0 fw-bold text-gray-900'>
                        Mahsulotlar tugab bormoqda
                      </h6>
                    </div>
                    <div
                      className='progress w-100 bg-gray-100 rounded-pill h-8'
                      role='progressbar'
                      aria-label='Basic example'
                      aria-valuenow={32}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className='progress-bar bg-main-two-600 rounded-pill'
                        style={{ width: "32%" }}
                      />
                    </div>
                    <span className='text-sm text-gray-700 mt-8'>
                      Faqat mavjud: 45
                    </span>
                  </div>
                  <span className='text-gray-900 d-block mb-8'>Miqdori:</span>
                  <div className='flex-between gap-16 flex-wrap'>
                    <div className='flex-align flex-wrap gap-16'>
                      <div className='border border-gray-100 rounded-pill py-9 px-16 flex-align'>
                        <button
                          onClick={decrementQuantity}
                          type='button'
                          className='quantity__minus p-4 text-gray-700 hover-text-main-600 flex-center'
                        >
                          <i className='ph ph-minus' />
                        </button>
                        <input
                          type='number'
                          className='quantity__input border-0 text-center w-32'
                          value={quantity}
                          readOnly
                        />
                        <button
                          onClick={incrementQuantity}
                          type='button'
                          className='quantity__plus p-4 text-gray-700 hover-text-main-600 flex-center'
                        >
                          <i className='ph ph-plus' />
                        </button>
                      </div>
                      <Link
                        href='#'
                        className='btn btn-main rounded-pill flex-align d-inline-flex gap-8 px-48'
                      >
                        <i className='ph ph-shopping-cart' /> Savatga qo'shish
                      </Link>
                    </div>
                    <div className='flex-align gap-12'>
                      <Link
                        href='#'
                        className='w-52 h-52 bg-main-50 text-main-600 text-xl hover-bg-main-600 hover-text-white flex-center rounded-circle'
                      >
                        <i className='ph ph-heart' />
                      </Link>
                      <Link
                        href='#'
                        className='w-52 h-52 bg-main-50 text-main-600 text-xl hover-bg-main-600 hover-text-white flex-center rounded-circle'
                      >
                        <i className='ph ph-shuffle' />
                      </Link>
                      <Link
                        href='#'
                        className='w-52 h-52 bg-main-50 text-main-600 text-xl hover-bg-main-600 hover-text-white flex-center rounded-circle'
                      >
                        <i className='ph ph-share-network' />
                      </Link>
                    </div>
                  </div>
                  <span className='mt-32 pt-32 text-gray-700 border-top border-gray-100 d-block' />
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-3'>
            <div className='product-details__sidebar border border-gray-100 rounded-16 overflow-hidden'>
               <div className='p-24'>
                <div className='flex-between bg-main-600 rounded-pill p-8'>
                  <div className='flex-align gap-8'>
                    <span className='w-44 h-44 bg-white rounded-circle flex-center text-2xl'>
                      <i className='ph ph-storefront' />
                    </span>
                    <span className='text-white'>by {sellerName}</span>
                  </div>
                  <Link
                    href={`/vendor-two-details?id=${book.shop?.id || book.posted_by?.id}`}
                    className='btn btn-white rounded-pill text-uppercase'
                  >
                    Do'kon
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='pt-80'>
          <div className='product-dContent border rounded-24'>
            <div className='product-dContent__header border-bottom border-gray-100 flex-between flex-wrap gap-16'>
              <ul
                className='nav common-tab nav-pills mb-3'
                id='pills-tab'
                role='tablist'
              >
                <li className='nav-item' role='presentation'>
                  <button
                    className='nav-link active'
                    id='pills-description-tab'
                    data-bs-toggle='pill'
                    data-bs-target='#pills-description'
                    type='button'
                    role='tab'
                    aria-controls='pills-description'
                    aria-selected='true'
                  >
                    Tavsif
                  </button>
                </li>
                <li className='nav-item' role='presentation'>
                  <button
                    className='nav-link'
                    id='pills-specs-tab'
                    data-bs-toggle='pill'
                    data-bs-target='#pills-specs'
                    type='button'
                    role='tab'
                    aria-controls='pills-specs'
                    aria-selected='false'
                  >
                    Xususiyatlari
                  </button>
                </li>
              </ul>
            </div>
            <div className='product-dContent__box'>
              <div className='tab-content' id='pills-tabContent'>
                <div
                  className='tab-pane fade show active'
                  id='pills-description'
                  role='tabpanel'
                  aria-labelledby='pills-description-tab'
                  tabIndex={0}
                >
                  <div className='mb-40' dangerouslySetInnerHTML={{ __html: book.description || '<p>Tavsif mavjud emas.</p>' }}>
                  </div>
                </div>
                <div
                  className='tab-pane fade'
                  id='pills-specs'
                  role='tabpanel'
                  aria-labelledby='pills-specs-tab'
                  tabIndex={0}
                >
                    <div className='mb-40'>
                    <h6 className='mb-24'>Kitob xususiyatlari</h6>
                    <ul className='mt-32'>
                        <li className='text-gray-400 mb-14 flex-align gap-14'>
                          <span className='text-heading fw-medium'>
                            Til: <span className='text-gray-500'>{book.language || "Noma'lum"}</span>
                          </span>
                        </li>
                        <li className='text-gray-400 mb-14 flex-align gap-14'>
                          <span className='text-heading fw-medium'>
                            Muqova: <span className='text-gray-500'>{book.cover_type || "Noma'lum"}</span>
                          </span>
                        </li>
                        <li className='text-gray-400 mb-14 flex-align gap-14'>
                           <span className='text-heading fw-medium'>
                            Nashr yili: <span className='text-gray-500'>{book.publication_year || "Noma'lum"}</span>
                          </span>
                        </li>
                        <li className='text-gray-400 mb-14 flex-align gap-14'>
                           <span className='text-heading fw-medium'>
                            Sahifalar soni: <span className='text-gray-500'>{book.pages || "Noma'lum"}</span>
                          </span>
                        </li>
                        <li className='text-gray-400 mb-14 flex-align gap-14'>
                           <span className='text-heading fw-medium'>
                            ISBN: <span className='text-gray-500'>{book.isbn || "Noma'lum"}</span>
                          </span>
                        </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsOne;
