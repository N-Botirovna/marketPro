"use client";
import React, { useEffect, useState, useMemo, memo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getBooksByType, getNewBooks, getUsedBooks } from "@/services/books";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

// Slick navigation arrows as separate components
function SampleNextArrow(props) {
  const { className, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} slick-next slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1`}
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
      className={`${className} slick-prev slick-arrow flex-center rounded-circle border border-gray-100 hover-border-main-600 text-xl hover-bg-main-600 hover-text-white transition-1`}
    >
      <i className="ph ph-caret-left" />
    </button>
  );
}

const ShortProductOne = () => {
  // 🔹 Memoized Slick settings
  const settings = useMemo(
    () => ({
      dots: false,
      arrows: true,
      infinite: true,
      speed: 800,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
      responsive: [
        { breakpoint: 768, settings: { arrows: false } },
        { breakpoint: 575, settings: { arrows: true } },
      ],
    }),
    []
  );

  // 🔹 State
  const [newBooks, setNewBooks] = useState([]);
  const [usedBooks, setUsedBooks] = useState([]);
  const [giftBooks, setGiftBooks] = useState([]);
  const [topRatedBooks, setTopRatedBooks] = useState([]);

  // 🔹 Fetch all book types
  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        const [newRes, usedRes, giftRes, topRes] = await Promise.all([
          getNewBooks(8),
          getUsedBooks(8),
          getBooksByType("gift", 8),
          getBooksByType("exchange", 8),
        ]);

        setNewBooks(
          Array.isArray(newRes?.books || newRes?.result)
            ? newRes.books || newRes.result
            : []
        );
        setUsedBooks(Array.isArray(usedRes?.books) ? usedRes.books : []);
        setGiftBooks(Array.isArray(giftRes?.books) ? giftRes.books : []);
        setTopRatedBooks(Array.isArray(topRes?.books) ? topRes.books : []);
      } catch (err) {
        console.error("Kitoblarni yuklashda xatolik:", err);
      }
    };

    fetchAllBooks();
  }, []);

  // 🔹 Helper — format books into slides (4 per slide)
  const formatBooksToSlides = (books = []) => {
    if (!Array.isArray(books) || books.length === 0) {
      return [
        [
          {
            id: "placeholder",
            picture: "/assets/images/thumbs/short-product-img3.png",
            star: "-",
            num: "-",
            desc: "No books available yet",
            price1: "-",
            price2: "",
          },
        ],
      ];
    }

    const slides = [];
    for (let i = 0; i < books.length; i += 4) {
      const group = books.slice(i, i + 4).map((book, idx) => ({
        id: book.id || book._id || `book-${i}-${idx}`,
        picture: book.picture || "/assets/images/thumbs/short-product-img3.png",
        star: book.rating || book.averageRating || "4.8",
        num: book.reviewCount || book.numReviews || "17k",
        desc: book.title || book.name || "No title",
        price1: book.price ? `$${book.price}` : "-",
        price2: book.originalPrice ? `$${book.originalPrice}` : "",
      }));

      while (group.length < 4) {
        group.push({
          id: `placeholder-${i}-${group.length}`,
          picture: "/assets/images/thumbs/short-product-img3.png",
          star: "-",
          num: "-",
          desc: "Coming soon...",
          price1: "-",
          price2: "",
        });
      }

      slides.push(group);
    }
    if (slides.length === 1) slides.push(slides[0]);

    return slides;
  };

  // 🔹 Product card
  const ProductCard = memo(({ product }) => {
    return (
      <div className="flex-align gap-16 mb-24" key={product.id}>
        <div
          className="w-90 h-90 rounded-12 border border-gray-100 shrink-0 overflow-hidden"
          style={{ position: "relative", width: 90, height: 90 }}
        >
          <Link href={`/product-details?id=${product.id}`} className="link">
            <Image
              src={product.picture}
              alt="product"
              fill
              sizes="90px"
              style={{ objectFit: "cover" }}
              loading="lazy"
            />
          </Link>
        </div>
        <div className="flex-1">
          <div className="flex-align gap-6">
            <span className="text-xs fw-bold text-gray-500">
              {product.star}
            </span>
            <span className="text-warning-600 text-xs">
              <i className="ph-fill ph-star" />
            </span>
            <span className="text-xs fw-bold text-gray-500">
              ({product.num})
            </span>
          </div>
          <h6 className="text-sm fw-semibold mt-8 mb-8 text-line-1">
            <Link href={`/product-details?id=${product.id}`} className="link">
              {product.desc}
            </Link>
          </h6>
          <div className="flex-align gap-8">
            <span className="text-heading text-md fw-semibold">
              {product.price1}
            </span>
            <span className="text-gray-400 text-md fw-semibold">
              {product.price2}
            </span>
          </div>
        </div>
      </div>
    );
  });

  ProductCard.displayName = "ProductCard";

  // 🔹 Categories (title + data)
  const productCategories = [
    { title: "Yangi kitoblar", slides: formatBooksToSlides(usedBooks) },
    { title: "Yangidek kitoblar", slides: formatBooksToSlides(newBooks) },
    { title: "Sovg'a kitoblar", slides: formatBooksToSlides(giftBooks) },
    {
      title: "Almashtirish kitoblar",
      slides: formatBooksToSlides(topRatedBooks),
    },
  ];

  return (
    <div className="short-product">
      <div className="container container-lg">
        <div className="row gy-4">
          {productCategories.map((category, categoryIndex) => {
            // 🔹 Yo‘naltirish uchun filter query
            let filterQuery = "";
            if (category.title === "Yangi kitoblar")
              filterQuery = "?is_used=false";
            else if (category.title === "Yangidek kitoblar")
              filterQuery = "?is_used=true";
            else if (category.title === "Sovg'a kitoblar")
              filterQuery = "?type=gift";
            else if (category.title === "Almashtirish kitoblar")
              filterQuery = "?type=exchange";

            return (
              <div key={category.title} className="col-xxl-3 col-lg-4 col-sm-6">
                <div className="p-16 border border-gray-100 hover-border-main-600 rounded-16 transition-2">
                  <div className="p-16 bg-main-50 rounded-16 mb-24 flex items-center w-full justify-between">
                    <Link
                      href={{
                        pathname: "/vendor-two",
                        query:
                          category.title === "Yangi kitoblar"
                            ? { is_used: "false" }
                            : category.title === "Yangidek kitoblar"
                            ? { is_used: "true" }
                            : category.title === "Sovg'a kitoblar"
                            ? { type: "gift" }
                            : category.title === "Almashtirish kitoblar"
                            ? { type: "exchange" }
                            : {},
                      }}
                      className="underlined-line mb-0 pb-16 d-inline-block text-main-600 hover:text-main-700 font-bold transition"
                    >
                      {category.title}
                    </Link>
                    <i className="ph ph-arrow-up-right text-main-600 text-lg"></i>
                  </div>

                  <div className="short-product-list arrow-style-two">
                    <Slider {...settings} key={`slider-${categoryIndex}`}>
                      {category.slides.map((slideProducts, slideIndex) => (
                        <div key={`${categoryIndex}-${slideIndex}`}>
                          {slideProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      ))}
                    </Slider>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default memo(ShortProductOne);
