"use client";
import React from "react";
import Link from "next/link";

const BookCard = ({ book }) => {
  if (!book) return null;

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "";
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  const sellerName = book.shop?.name || `${book.posted_by?.first_name || 'Noma\'lum'} ${book.posted_by?.last_name || ''}`.trim();

  return (
    <div className='product-card h-100 p-8 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2'>
      {book.percentage && (
        <span className='product-card__badge bg-danger-600 px-8 py-4 text-sm text-white'>
          -{book.percentage}%
        </span>
      )}
      
      <Link href={`/product-details?id=${book.id}`} className='product-card__thumb flex-center' style={{ height: '220px' }}>
        <img 
          src={book.picture || 'assets/images/thumbs/product-img7.png'} 
          alt={book.name}
          style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain' }}
        />
      </Link>

      <div className='product-card__content p-sm-2'>
        <h6 className='title text-lg fw-semibold mt-12 mb-8'>
          <Link href={`/product-details?id=${book.id}`} className='link text-line-2'>
            {book.name || 'Kitob Nomi Mavjud Emas'}
          </Link>
        </h6>

        <div className='flex-align gap-4 mb-8'>
          <span className='text-main-600 text-md d-flex'>
            <i className='ph-fill ph-user' />
          </span>
          <span className='text-gray-500 text-xs'>
            {book.author || "Noma'lum muallif"}
          </span>
        </div>
        
        <div className='flex-align gap-4 mb-8'>
          <span className='text-main-600 text-md d-flex'>
            <i className='ph-fill ph-book-open' />
          </span>
          <span className='text-gray-500 text-xs'>
            {book.publisher || 'Noma\'lum nashriyot'}
          </span>
        </div>

        <div className='product-card__content mt-12'>
          <div className='product-card__price mb-8'>
            <span className='text-heading text-md fw-semibold'>
              {formatPrice(book.discount_price || book.price)}
            </span>
            {book.discount_price && (
              <span className='text-gray-400 text-md fw-semibold text-decoration-line-through ms-8'>
                {formatPrice(book.price)}
              </span>
            )}
          </div>
          
          <div className='flex-align gap-6'>
            <span className='text-xs fw-bold text-gray-600'>
              4.5 {/* Hardcoded star rating */}
            </span>
            <span className='text-15 fw-bold text-warning-600 d-flex'>
              <i className='ph-fill ph-star' />
            </span>
            <span className='text-xs fw-bold text-gray-600'>
              ({book.view_count || 0}) {/* Using view_count as review count */}
            </span>
          </div>

          <div className='product-card__progress-bar mt-16'>
            <div className='progress h-8 rounded-pill'>
              <div
                className='progress-bar bg-main-600 rounded-pill'
                style={{ width: "65%" }}
              />
            </div>
            <span className='text-gray-900 text-xs fw-medium mt-8 d-block'>
              Sold: 22/35
            </span>
          </div>

          <Link
            href={`/product-details?id=${book.id}`}
            className='product-card__cart btn bg-main-50 text-main-600 hover-bg-main-600 hover-text-white py-11 px-24 rounded-pill flex-align gap-8 mt-16 w-100 justify-content-center'
          >
            Batafsil ko'rish <i className='ph ph-arrow-right' />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
