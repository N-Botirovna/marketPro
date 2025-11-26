"use client";
import React, { useEffect, useState, memo } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { getBookById, getBooks, likeBook } from "@/services/books";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "./Toast";
import dynamic from "next/dynamic";
import Spin from "./Spin";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

// Carousel CSS Styles
const sliderStyles = `
  .recommended .slick-slider {
    padding: 0;
    margin: 0;
    position: relative;
  }
  
  .recommended .slick-track {
    display: flex !important;
    gap: 0;
  }
  
  .recommended .slick-slide {
    height: auto !important;
    padding: 0;
    margin: 0;
  }
  
  .recommended .slick-arrow {
    width: 44px !important;
    height: 44px !important;
    border-radius: 50% !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    z-index: 10 !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: absolute !important;
  }
  
  .recommended .slick-prev {
    left: 10px !important;
  }
  
  .recommended .slick-next {
    right: 10px !important;
  }
  
  .recommended .slick-prev:hover,
  .recommended .slick-next:hover {
    background-color: #299E60 !important;
    border-color: #299E60 !important;
    color: white !important;
  }
  
  .recommended .slick-prev:before,
  .recommended .slick-next:before {
    content: '' !important;
  }
  
  .recommended .product-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .recommended .product-card__thumb {
    flex-shrink: 0;
  }
  
  .recommended .product-card__content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .recommended .product-card .title {
    line-height: 1.3;
    min-height: 2.6em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  @media (max-width: 768px) {
    .recommended .slick-prev {
      left: 5px !important;
    }
    
    .recommended .slick-next {
      right: 5px !important;
    }
  }
  
  @media (max-width: 576px) {
    .recommended .slick-prev {
      left: 0px !important;
      width: 36px !important;
      height: 36px !important;
    }
    
    .recommended .slick-next {
      right: 0px !important;
      width: 36px !important;
      height: 36px !important;
    }
  }
`;

// Custom Next Arrow
const SampleNextArrow = memo((props) => {
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
});

// Custom Prev Arrow
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

const RecommendedOne = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { isAuthenticated } = useAuth();
  const { showToast, ToastContainer } = useToast();

  const [currentBook, setCurrentBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState(["category"]); // Default: category tanlangan
  const [sliderRef, setSliderRef] = useState(null);
  const [likedBooks, setLikedBooks] = useState({});
  const [liking, setLiking] = useState({});

  // Fetch current book details
  useEffect(() => {
    if (id) {
      const fetchCurrentBook = async () => {
        try {
          const response = await getBookById(id);
          setCurrentBook(response.book);
        } catch (err) {
          console.error("Error fetching current book:", err);
        }
      };
      fetchCurrentBook();
    }
  }, [id]);

  // Toggle filter selection
  const toggleFilter = (filterType) => {
    setSelectedFilters((prev) => {
      if (prev.includes(filterType)) {
        // Agar allaqachon tanlangan bo'lsa, chiqar
        return prev.filter((f) => f !== filterType);
      } else {
        // Agar tanlanmagan bo'lsa, qo'sh
        return [...prev, filterType];
      }
    });
  };

  // Fetch recommended books based on selected filters
  useEffect(() => {
    if (!currentBook || selectedFilters.length === 0) {
      setBooks([]);
      setLoading(false);
      return;
    }

    const fetchRecommendedBooks = async () => {
      try {
        setLoading(true);
        let params = { is_active: true, limit: 20 };

  // Har bir tanlangan filter uchun parametr qo'sh
        if (selectedFilters.includes("category") && currentBook.category) {
          params.category = currentBook.category;
        }

        if (selectedFilters.includes("price") && currentBook.price) {
          const price = currentBook.discount_price || currentBook.price;
          const minPrice = Math.floor(price * 0.8); // -20%
          const maxPrice = Math.ceil(price * 1.2); // +20%
          params.price_min = minPrice;
          params.price_max = maxPrice;
        }

        if (selectedFilters.includes("location") && currentBook.region) {
          params.region = currentBook.region;
        }

        if (selectedFilters.includes("shop") && currentBook.shop?.id) {
          params.shop = currentBook.shop.id;
        }

        const response = await getBooks(params);
        // Filter out the current book from recommendations
        const filteredBooks = response.books.filter(
          (book) => book.id !== currentBook.id
        );
        setBooks(filteredBooks);
        
        // Initialize liked state with local storage
        const likedState = {};
        let likedMap = {};
        try {
          const stored = localStorage.getItem('liked_books_map');
          likedMap = stored ? JSON.parse(stored) : {};
        } catch {}
        
        filteredBooks.forEach(book => {
          if (book.id) {
            const stored = likedMap[book.id];
            likedState[book.id] = {
              isLiked: stored?.isLiked ?? (book.is_liked === true),
              likeCount: stored?.likeCount ?? (book.like_count || 0)
            };
          }
        });
        setLikedBooks(prev => ({ ...prev, ...likedState }));
      } catch (err) {
        console.error("Error fetching recommended books:", err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedBooks();
  }, [currentBook, selectedFilters]);

  const sliderSettings = {
    dots: false,
    infinite: books.length > 6,
    speed: 600,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: false,
    pauseOnHover: true,
    arrows: true,
    prevArrow: <SamplePrevArrow />,
    nextArrow: <SampleNextArrow />,
    centerMode: false,
    swipeToSlide: true,
    touchMove: true,
    draggable: true,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const handleLike = async (bookId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showToast({
        type: 'info',
        title: "Ma'lumot",
        message: "Like qilish uchun tizimga kiring",
        duration: 3000
      });
      return;
    }

    if (liking[bookId]) return;

    const previousState = likedBooks[bookId] || { isLiked: false, likeCount: 0 };
    const newLiked = !previousState.isLiked;
    const newCount = newLiked ? previousState.likeCount + 1 : Math.max(0, previousState.likeCount - 1);
    
    setLikedBooks(prev => ({
      ...prev,
      [bookId]: { isLiked: newLiked, likeCount: newCount }
    }));

    try {
      setLiking(prev => ({ ...prev, [bookId]: true }));
      const response = await likeBook(bookId);
      
      if (response.success) {
        const finalCount = response.is_liked ? newCount : Math.max(0, newCount);
        const updatedState = {
          isLiked: response.is_liked,
          likeCount: finalCount
        };
        
        setLikedBooks(prev => ({
          ...prev,
          [bookId]: updatedState
        }));
        
        // Local storage'ga saqlash
        if (typeof window !== 'undefined') {
          const likedMap = localStorage.getItem('liked_books_map');
          const map = likedMap ? JSON.parse(likedMap) : {};
          
          if (response.is_liked) {
            map[bookId] = updatedState;
          } else {
            delete map[bookId];
          }
          
          localStorage.setItem('liked_books_map', JSON.stringify(map));
        }
        
        window.dispatchEvent(new Event(response.is_liked ? 'bookLiked' : 'bookUnliked'));
      }
    } catch (error) {
      console.error("Like error:", error);
      setLikedBooks(prev => ({
        ...prev,
        [bookId]: previousState
      }));
      
      showToast({
        type: 'error',
        title: "Xatolik",
        message: "Like qilishda xatolik yuz berdi",
        duration: 3000
      });
    } finally {
      setLiking(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const BookCard = ({ book }) => (
    <div className="px-6">
      <div className="product-card h-100 p-12 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2">
        {/* Like Button */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={(e) => handleLike(book.id, e)}
            disabled={liking[book.id]}
            className={`position-absolute top-0 end-0 m-12 w-44 h-44 flex-center rounded-circle border-0 transition-1 z-2 ${
              likedBooks[book.id]?.isLiked 
                ? 'bg-danger-600 text-white hover-bg-danger-700' 
                : 'bg-white text-gray-600 hover-bg-danger-50 hover-text-danger-600 shadow-sm'
            }`}
            title={likedBooks[book.id]?.isLiked ? "Like olib tashlash" : "Like qo'shish"}
          >
            <i className={`${likedBooks[book.id]?.isLiked ? 'ph-fill' : 'ph'} ph-heart text-md`} />
          </button>
        )}
        {book.discount_price && (
          <span className="product-card__badge bg-danger-600 px-8 py-4 text-sm text-white position-absolute">
            {Math.round(
              ((book.price - book.discount_price) / book.price) * 100
            )}
            %
          </span>
        )}
        <Link
          href={`/product-details?id=${book.id}`}
          className="product-card__thumb flex-center mb-12"
          style={{ minHeight: "160px" }}
        >
          <img
            src={book.picture || "assets/images/thumbs/product-img7.png"}
            alt={book.name}
            style={{ maxHeight: "140px", width: "auto", objectFit: "contain" }}
          />
        </Link>
        <div className="product-card__content">
          <h6 className="title text-sm fw-semibold mb-8">
            <Link
              href={`/product-details?id=${book.id}`}
              className="link text-line-2"
              title={book.name}
            >
              {book.name}
            </Link>
          </h6>
          <div className="flex-align gap-4 mb-10">
            <span className="text-main-600 text-sm d-flex">
              <i className="ph-fill ph-storefront" />
            </span>
            <span className="text-gray-500 text-xs line-clamp-1">
              {book.shop?.name ||
                `${book.posted_by?.first_name || ""} ${
                  book.posted_by?.last_name || ""
                }`.trim() ||
                "Noma'lum"}
            </span>
          </div>
          <div className="product-card__price mb-8">
            <span className="text-heading text-md fw-semibold d-block">
              {new Intl.NumberFormat("uz-UZ").format(
                book.discount_price || book.price
              )}{" "}
              so'm
            </span>
            {book.discount_price && (
              <span className="text-gray-400 text-xs fw-semibold text-decoration-line-through">
                {new Intl.NumberFormat("uz-UZ").format(book.price)} so'm
              </span>
            )}
          </div>
          <div className="flex-align gap-6">
            <span className="text-xs fw-bold text-gray-600">
              👁 {book.view_count || 0}
            </span>
            {likedBooks[book.id]?.likeCount > 0 && (
              <span className="text-xs fw-bold text-gray-500 d-flex align-items-center gap-2">
                <i className="ph ph-heart text-xs" />
                {likedBooks[book.id].likeCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!currentBook) {
    return (
      <section className="recommended">
        <div className="container container-lg">
          <div className="text-center py-40">
            <Spin text="Kitob yuklanmoqda..." />
                    </div>
                      </div>
      </section>
    );
  }

  const getFilterLabel = () => {
    if (selectedFilters.length === 0) {
      return "Filter tanlang";
    }
    const labels = {
      category: "Kategoriya",
      price: "Narx (±20%)",
      location: "Manzil",
      shop: "Do'kon",
    };
    return selectedFilters.map((f) => labels[f]).join(" + ");
  };

  return (
    <>
      <style>{sliderStyles}</style>
      <section className="recommended">
      <div className="container container-lg">
        <div className="section-heading flex-between flex-wrap gap-16">
          <h5 className="mb-0">Sizga tavsiya qilingan kitoblar</h5>
          <ul
            className="nav common-tab nav-pills"
            id="pills-tab"
            role="tablist"
          >
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  selectedFilters.includes("category") ? "active" : ""
                }`}
                onClick={() => toggleFilter("category")}
                type="button"
                title="Kategoriya bo'yicha filtrla"
              >
                <i className="ph ph-list me-2" />
                Kategoriya
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  selectedFilters.includes("price") ? "active" : ""
                }`}
                onClick={() => toggleFilter("price")}
                type="button"
                title="Narx oraliqda filtrla (±20%)"
              >
                <i className="ph ph-tag me-2" />
                Narx (±20%)
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  selectedFilters.includes("location") ? "active" : ""
                }`}
                onClick={() => toggleFilter("location")}
                type="button"
                title="Manzil bo'yicha filtrla"
              >
                <i className="ph ph-map-pin me-2" />
                Manzil
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  selectedFilters.includes("shop") ? "active" : ""
                }`}
                onClick={() => toggleFilter("shop")}
                type="button"
                title="Do'kon bo'yicha filtrla"
              >
                <i className="ph ph-storefront me-2" />
                Do'kon
              </button>
            </li>
          </ul>
        </div>

        {selectedFilters.length === 0 ? (
          <div className="text-center py-60">
            <div className="mb-16">
              <i
                className="ph ph-magnifying-glass"
                style={{ fontSize: "48px", color: "#ccc" }}
              />
                      </div>
            <p className="text-gray-600 text-lg">
              Kitoblarni ko'rish uchun yuqoridan filter tanlang
            </p>
                      </div>
        ) : loading ? (
          <div className="text-center py-40">
            <Spin text="Kitoblar yuklanmoqda..." />
                    </div>
        ) : books.length > 0 ? (
          <div className="overflow-hidden">
            <Slider ref={setSliderRef} {...sliderSettings}>
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </Slider>
                  </div>
        ) : (
          <div className="text-center py-60">
            <div className="mb-16">
              <i
                className="ph ph-binoculars"
                style={{ fontSize: "48px", color: "#ccc" }}
              />
                </div>
            <p className="text-gray-600 text-lg mb-16">
              {selectedFilters.includes("category") &&
                selectedFilters.includes("price") &&
                selectedFilters.includes("location") &&
                selectedFilters.includes("shop") &&
                "Bu shartlarga mos kitoblar topilmadi."}
              {selectedFilters.includes("category") &&
                !selectedFilters.includes("price") &&
                !selectedFilters.includes("location") &&
                !selectedFilters.includes("shop") &&
                "Bu kategoriyada boshqa kitoblar topilmadi."}
              {selectedFilters.includes("price") &&
                !selectedFilters.includes("category") &&
                !selectedFilters.includes("location") &&
                !selectedFilters.includes("shop") &&
                "Bu narx oraliqda boshqa kitoblar topilmadi."}
              {selectedFilters.includes("location") &&
                !selectedFilters.includes("category") &&
                !selectedFilters.includes("price") &&
                !selectedFilters.includes("shop") &&
                "Bu manzilda boshqa kitoblar topilmadi."}
              {selectedFilters.includes("shop") &&
                !selectedFilters.includes("category") &&
                !selectedFilters.includes("price") &&
                !selectedFilters.includes("location") &&
                "Bu do'konda boshqa kitoblar topilmadi."}
              {selectedFilters.length > 1 &&
                "Tanlangan shartlarga mos kitoblar topilmadi."}
            </p>
            <button
              onClick={() => setSelectedFilters(["category"])}
              className="btn btn-main rounded-pill"
            >
              <i className="ph ph-arrow-clockwise me-2" />
              Kategoriya filtriga qaytish
            </button>
                    </div>
        )}

        {books.length > 0 && (
          <div className="text-center mt-32">
            <p className="text-gray-600 text-sm">
              Jami {books.length} ta kitob topildi
            </p>
                      </div>
        )}
      </div>
      </section>
      <ToastContainer />
    </>
  );
};

export default RecommendedOne;
