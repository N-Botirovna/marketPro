import React from "react";
import Link from "next/link";

const VendorsList = () => {
  return (
    <section className='vendors-list py-80'>
      <div className='container container-lg'>
        <div className='flex-between flex-wrap gap-8 mb-40'>
          <span className='text-neutral-600 fw-medium px-40 py-12 rounded-pill border border-neutral-100'>
            Showing 1-20 of 85 results
          </span>
          <div className='flex-align gap-16'>
            <form
              action='#'
              className='search-form__wrapper position-relative d-block'
            >
              <input
                type='text'
                className='search-form__input common-input py-13 ps-16 pe-18 rounded-pill pe-44'
                placeholder='Search vendors by name or ID...'
              />
              <button
                type='submit'
                className='w-32 h-32 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8'
              >
                <i className='ph ph-magnifying-glass' />
              </button>
            </form>
            <div className='flex-align gap-8'>
              <span className='text-gray-900 flex-shrink-0'>Sort by:</span>
              <select
                className='common-input form-select rounded-pill border border-gray-100 d-inline-block ps-20 pe-36 h-48 py-0 fw-medium'
                defaultValue={1}
              >
                <option value={1}>Latest</option>
                <option value={1}>Old</option>
              </select>
            </div>
          </div>
        </div>
        <div className='row gy-4 vendor-card-wrapper'>
          <div className='col-xxl-3 col-lg-4 col-sm-6'>
            <div className='vendor-card text-center px-16 pb-24'>
              <div className=''>
                <img
                  src='assets/images/thumbs/vendor-logo1.png'
                  alt=''
                  className='vendor-card__logo m-12'
                />
                <h6 className='title mt-32'>
                  <Link href='/vendor-details' className=''>
                    Organic Market
                  </Link>
                </h6>
                <span className='text-heading text-sm d-block'>
                  Delivery by 6:15am
                </span>
                <Link
                  href='/shop'
                  className='bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8'
                >
                  $5 off Snack &amp; Candy
                </Link>
              </div>
              <div className='vendor-card__list mt-22 flex-center flex-wrap gap-8'>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img1.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img2.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img3.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img4.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img5.png' alt='' />
                </div>
              </div>
            </div>
          </div>
          <div className='col-xxl-3 col-lg-4 col-sm-6'>
            <div className='vendor-card text-center px-16 pb-24'>
              <div className=''>
                <img
                  src='assets/images/thumbs/vendor-logo2.png'
                  alt=''
                  className='vendor-card__logo m-12'
                />
                <h6 className='title mt-32'>
                  <Link href='/vendor-details' className=''>
                    Safeway
                  </Link>
                </h6>
                <span className='text-heading text-sm d-block'>
                  Delivery by 6:15am
                </span>
                <Link
                  href='/shop'
                  className='bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8'
                >
                  $5 off Snack &amp; Candy
                </Link>
              </div>
              <div className='vendor-card__list mt-22 flex-center flex-wrap gap-8'>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img1.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img2.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img3.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img4.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img5.png' alt='' />
                </div>
              </div>
            </div>
          </div>
          <div className='col-xxl-3 col-lg-4 col-sm-6'>
            <div className='vendor-card text-center px-16 pb-24'>
              <div className=''>
                <img
                  src='assets/images/thumbs/vendor-logo3.png'
                  alt=''
                  className='vendor-card__logo m-12'
                />
                <h6 className='title mt-32'>
                  <Link href='/vendor-details' className=''>
                    Food Max
                  </Link>
                </h6>
                <span className='text-heading text-sm d-block'>
                  Delivery by 6:15am
                </span>
                <Link
                  href='/shop'
                  className='bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8'
                >
                  $5 off Snack &amp; Candy
                </Link>
              </div>
              <div className='vendor-card__list mt-22 flex-center flex-wrap gap-8'>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img1.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img2.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img3.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img4.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img5.png' alt='' />
                </div>
              </div>
            </div>
          </div>
          <div className='col-xxl-3 col-lg-4 col-sm-6'>
            <div className='vendor-card text-center px-16 pb-24'>
              <div className=''>
                <img
                  src='assets/images/thumbs/vendor-logo4.png'
                  alt=''
                  className='vendor-card__logo m-12'
                />
                <h6 className='title mt-32'>
                  <Link href='/vendor-details' className=''>
                    HRmart
                  </Link>
                </h6>
                <span className='text-heading text-sm d-block'>
                  Delivery by 6:15am
                </span>
                <Link
                  href='/shop'
                  className='bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8'
                >
                  $5 off Snack &amp; Candy
                </Link>
              </div>
              <div className='vendor-card__list mt-22 flex-center flex-wrap gap-8'>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img1.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img2.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img3.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img4.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img5.png' alt='' />
                </div>
              </div>
            </div>
          </div>
          <div className='col-xxl-3 col-lg-4 col-sm-6'>
            <div className='vendor-card text-center px-16 pb-24'>
              <div className=''>
                <img
                  src='assets/images/thumbs/vendor-logo5.png'
                  alt=''
                  className='vendor-card__logo m-12'
                />
                <h6 className='title mt-32'>
                  <Link href='/vendor-details' className=''>
                    Lucky Supermarket
                  </Link>
                </h6>
                <span className='text-heading text-sm d-block'>
                  Delivery by 6:15am
                </span>
                <Link
                  href='/shop'
                  className='bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8'
                >
                  $5 off Snack &amp; Candy
                </Link>
              </div>
              <div className='vendor-card__list mt-22 flex-center flex-wrap gap-8'>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img1.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img2.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img3.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img4.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img5.png' alt='' />
                </div>
              </div>
            </div>
          </div>
          <div className='col-xxl-3 col-lg-4 col-sm-6'>
            <div className='vendor-card text-center px-16 pb-24'>
              <div className=''>
                <img
                  src='assets/images/thumbs/vendor-logo6.png'
                  alt=''
                  className='vendor-card__logo m-12'
                />
                <h6 className='title mt-32'>
                  <Link href='/vendor-details' className=''>
                    Arico Farmer
                  </Link>
                </h6>
                <span className='text-heading text-sm d-block'>
                  Delivery by 6:15am
                </span>
                <Link
                  href='/shop'
                  className='bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8'
                >
                  $5 off Snack &amp; Candy
                </Link>
              </div>
              <div className='vendor-card__list mt-22 flex-center flex-wrap gap-8'>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img1.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img2.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img3.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img4.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img5.png' alt='' />
                </div>
              </div>
            </div>
          </div>
          <div className='col-xxl-3 col-lg-4 col-sm-6'>
            <div className='vendor-card text-center px-16 pb-24'>
              <div className=''>
                <img
                  src='assets/images/thumbs/vendor-logo7.png'
                  alt=''
                  className='vendor-card__logo m-12'
                />
                <h6 className='title mt-32'>
                  <Link href='/vendor-details' className=''>
                    Farmer Market
                  </Link>
                </h6>
                <span className='text-heading text-sm d-block'>
                  Delivery by 6:15am
                </span>
                <Link
                  href='/shop'
                  className='bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8'
                >
                  $5 off Snack &amp; Candy
                </Link>
              </div>
              <div className='vendor-card__list mt-22 flex-center flex-wrap gap-8'>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img1.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img2.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img3.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img4.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img5.png' alt='' />
                </div>
              </div>
            </div>
          </div>
          <div className='col-xxl-3 col-lg-4 col-sm-6'>
            <div className='vendor-card text-center px-16 pb-24'>
              <div className=''>
                <img
                  src='assets/images/thumbs/vendor-logo8.png'
                  alt=''
                  className='vendor-card__logo m-12'
                />
                <h6 className='title mt-32'>
                  <Link href='/vendor-details' className=''>
                    Foodsco
                  </Link>
                </h6>
                <span className='text-heading text-sm d-block'>
                  Delivery by 6:15am
                </span>
                <Link
                  href='/shop'
                  className='bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8'
                >
                  $5 off Snack &amp; Candy
                </Link>
              </div>
              <div className='vendor-card__list mt-22 flex-center flex-wrap gap-8'>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img1.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img2.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img3.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img4.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img5.png' alt='' />
                </div>
              </div>
            </div>
          </div>
          <div className='col-xxl-3 col-lg-4 col-sm-6'>
            <div className='vendor-card text-center px-16 pb-24'>
              <div className=''>
                <img
                  src='assets/images/thumbs/vendor-logo1.png'
                  alt=''
                  className='vendor-card__logo m-12'
                />
                <h6 className='title mt-32'>
                  <Link href='/vendor-details' className=''>
                    Organic Market
                  </Link>
                </h6>
                <span className='text-heading text-sm d-block'>
                  Delivery by 6:15am
                </span>
                <Link
                  href='/shop'
                  className='bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8'
                >
                  $5 off Snack &amp; Candy
                </Link>
              </div>
              <div className='vendor-card__list mt-22 flex-center flex-wrap gap-8'>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img1.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img2.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img3.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img4.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img5.png' alt='' />
                </div>
              </div>
            </div>
          </div>
          <div className='col-xxl-3 col-lg-4 col-sm-6'>
            <div className='vendor-card text-center px-16 pb-24'>
              <div className=''>
                <img
                  src='assets/images/thumbs/vendor-logo2.png'
                  alt=''
                  className='vendor-card__logo m-12'
                />
                <h6 className='title mt-32'>
                  <Link href='/vendor-details' className=''>
                    Safeway
                  </Link>
                </h6>
                <span className='text-heading text-sm d-block'>
                  Delivery by 6:15am
                </span>
                <Link
                  href='/shop'
                  className='bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8'
                >
                  $5 off Snack &amp; Candy
                </Link>
              </div>
              <div className='vendor-card__list mt-22 flex-center flex-wrap gap-8'>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img1.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img2.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img3.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img4.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img5.png' alt='' />
                </div>
              </div>
            </div>
          </div>
          <div className='col-xxl-3 col-lg-4 col-sm-6'>
            <div className='vendor-card text-center px-16 pb-24'>
              <div className=''>
                <img
                  src='assets/images/thumbs/vendor-logo3.png'
                  alt=''
                  className='vendor-card__logo m-12'
                />
                <h6 className='title mt-32'>
                  <Link href='/vendor-details' className=''>
                    Food Max
                  </Link>
                </h6>
                <span className='text-heading text-sm d-block'>
                  Delivery by 6:15am
                </span>
                <Link
                  href='/shop'
                  className='bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8'
                >
                  $5 off Snack &amp; Candy
                </Link>
              </div>
              <div className='vendor-card__list mt-22 flex-center flex-wrap gap-8'>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img1.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img2.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img3.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img4.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img5.png' alt='' />
                </div>
              </div>
            </div>
          </div>
          <div className='col-xxl-3 col-lg-4 col-sm-6'>
            <div className='vendor-card text-center px-16 pb-24'>
              <div className=''>
                <img
                  src='assets/images/thumbs/vendor-logo4.png'
                  alt=''
                  className='vendor-card__logo m-12'
                />
                <h6 className='title mt-32'>
                  <Link href='/vendor-details' className=''>
                    HRmart
                  </Link>
                </h6>
                <span className='text-heading text-sm d-block'>
                  Delivery by 6:15am
                </span>
                <Link
                  href='/shop'
                  className='bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8'
                >
                  $5 off Snack &amp; Candy
                </Link>
              </div>
              <div className='vendor-card__list mt-22 flex-center flex-wrap gap-8'>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img1.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img2.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img3.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img4.png' alt='' />
                </div>
                <div className='vendor-card__item bg-white rounded-circle flex-center'>
                  <img src='assets/images/thumbs/vendor-img5.png' alt='' />
                </div>
              </div>
            </div>
          </div>
        </div>
        <ul className='pagination flex-center flex-wrap gap-16'>
          <li className='page-item'>
            <Link
              className='page-link h-64 w-64 flex-center text-xxl rounded-circle fw-medium text-neutral-600 border border-gray-100'
              href='#'
            >
              <i className='ph-bold ph-arrow-left' />
            </Link>
          </li>
          <li className='page-item active'>
            <Link
              className='page-link h-64 w-64 flex-center text-md rounded-circle fw-medium text-neutral-600 border border-gray-100'
              href='#'
            >
              01
            </Link>
          </li>
          <li className='page-item'>
            <Link
              className='page-link h-64 w-64 flex-center text-md rounded-circle fw-medium text-neutral-600 border border-gray-100'
              href='#'
            >
              02
            </Link>
          </li>
          <li className='page-item'>
            <Link
              className='page-link h-64 w-64 flex-center text-md rounded-circle fw-medium text-neutral-600 border border-gray-100'
              href='#'
            >
              03
            </Link>
          </li>
          <li className='page-item'>
            <Link
              className='page-link h-64 w-64 flex-center text-md rounded-circle fw-medium text-neutral-600 border border-gray-100'
              href='#'
            >
              04
            </Link>
          </li>
          <li className='page-item'>
            <Link
              className='page-link h-64 w-64 flex-center text-md rounded-circle fw-medium text-neutral-600 border border-gray-100'
              href='#'
            >
              05
            </Link>
          </li>
          <li className='page-item'>
            <Link
              className='page-link h-64 w-64 flex-center text-md rounded-circle fw-medium text-neutral-600 border border-gray-100'
              href='#'
            >
              06
            </Link>
          </li>
          <li className='page-item'>
            <Link
              className='page-link h-64 w-64 flex-center text-md rounded-circle fw-medium text-neutral-600 border border-gray-100'
              href='#'
            >
              07
            </Link>
          </li>
          <li className='page-item'>
            <Link
              className='page-link h-64 w-64 flex-center text-xxl rounded-circle fw-medium text-neutral-600 border border-gray-100'
              href='#'
            >
              <i className='ph-bold ph-arrow-right' />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default VendorsList;
