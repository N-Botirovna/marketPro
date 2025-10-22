"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BookCard from "./BookCard";
import { getBooks } from "@/services/books";
import Spin from "./Spin";

const BookShopSection = () => {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    category: searchParams.get("category") || "",
    cover_type: searchParams.get("cover_type") || "",
    is_used: searchParams.get("is_used") || "",
    price_min: searchParams.get("price_min") || "",
    price_max: searchParams.get("price_max") || "",
    q: searchParams.get("q") || "",
    ordering: searchParams.get("ordering") || "-created_at",
    limit: 20,
    offset: 0,
  });
  const [grid, setGrid] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [filters]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await getBooks(filters);
      setBooks(response.books);
    } catch (err) {
      console.error("Kitoblar yuklashda xatolik:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      offset: 0, // Reset to first page when filtering
    }));
  };

  const sidebarController = () => {
    setActive(!active);
  };

  if (loading) {
    return (
      <section className="shop py-80">
        <div className="container container-lg">
          <div className="text-center">
            <Spin text="Kitoblar yuklanmoqda..." />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="shop py-80">
        <div className="container container-lg">
          <div className="text-center">
            <p className="text-danger">Kitoblar yuklashda xatolik yuz berdi</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="shop py-80">
      <div className={`side-overlay ${active && "show"}`}></div>
      <div className="container container-lg">
        <div className="row">
          {/* Sidebar Start */}
          <div className="col-lg-3">
            <div className={`shop-sidebar ${active && "active"}`}>
              <button
                onClick={sidebarController}
                type="button"
                className="shop-sidebar__close d-lg-none d-flex w-32 h-32 flex-center border border-gray-100 rounded-circle hover-bg-main-600 position-absolute inset-inline-end-0 me-10 mt-8 hover-text-white hover-border-main-600"
              >
                <i className="ph ph-x" />
              </button>

              {/* Type Filter */}
              <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                  Kitob turi
                </h6>
                <div className="form-check mb-16">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="type"
                    id="type_all"
                    checked={filters.type === ""}
                    onChange={() => handleFilterChange("type", "")}
                  />
                  <label className="form-check-label" htmlFor="type_all">
                    Barchasi
                  </label>
                </div>
                <div className="form-check mb-16">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="type"
                    id="type_seller"
                    checked={filters.type === "seller"}
                    onChange={() => handleFilterChange("type", "seller")}
                  />
                  <label className="form-check-label" htmlFor="type_seller">
                    Sotish
                  </label>
                </div>
                <div className="form-check mb-16">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="type"
                    id="type_exchange"
                    checked={filters.type === "exchange"}
                    onChange={() => handleFilterChange("type", "exchange")}
                  />
                  <label className="form-check-label" htmlFor="type_exchange">
                    Almashtirish
                  </label>
                </div>
                <div className="form-check mb-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="type"
                    id="type_gift"
                    checked={filters.type === "gift"}
                    onChange={() => handleFilterChange("type", "gift")}
                  />
                  <label className="form-check-label" htmlFor="type_gift">
                    Sovg'a
                  </label>
                </div>
              </div>

              {/* Cover Type Filter */}
              <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                  Muqova turi
                </h6>
                <div className="form-check mb-16">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="cover_type"
                    id="cover_all"
                    checked={filters.cover_type === ""}
                    onChange={() => handleFilterChange("cover_type", "")}
                  />
                  <label className="form-check-label" htmlFor="cover_all">
                    Barchasi
                  </label>
                </div>
                <div className="form-check mb-16">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="cover_type"
                    id="cover_hard"
                    checked={filters.cover_type === "hard"}
                    onChange={() => handleFilterChange("cover_type", "hard")}
                  />
                  <label className="form-check-label" htmlFor="cover_hard">
                    Qattiq muqova
                  </label>
                </div>
                <div className="form-check mb-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="cover_type"
                    id="cover_soft"
                    checked={filters.cover_type === "soft"}
                    onChange={() => handleFilterChange("cover_type", "soft")}
                  />
                  <label className="form-check-label" htmlFor="cover_soft">
                    Yumshoq muqova
                  </label>
                </div>
              </div>

              {/* Used Books Filter */}
              <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                  Holati
                </h6>
                <div className="form-check mb-16">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="is_used"
                    id="used_all"
                    checked={filters.is_used === ""}
                    onChange={() => handleFilterChange("is_used", "")}
                  />
                  <label className="form-check-label" htmlFor="used_all">
                    Barchasi
                  </label>
                </div>
                <div className="form-check mb-16">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="is_used"
                    id="used_new"
                    checked={filters.is_used === "false"}
                    onChange={() => handleFilterChange("is_used", "false")}
                  />
                  <label className="form-check-label" htmlFor="used_new">
                    Yangi
                  </label>
                </div>
                <div className="form-check mb-0">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="is_used"
                    id="used_used"
                    checked={filters.is_used === "true"}
                    onChange={() => handleFilterChange("is_used", "true")}
                  />
                  <label className="form-check-label" htmlFor="used_used">
                    Yangidek
                  </label>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                  Narx oralig'i
                </h6>
                <div className="row gy-2">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Min"
                      value={filters.price_min}
                      onChange={(e) =>
                        handleFilterChange("price_min", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Max"
                      value={filters.price_max}
                      onChange={(e) =>
                        handleFilterChange("price_max", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Search Filter */}
              <div className="shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32">
                <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                  Qidirish
                </h6>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Kitob nomi, muallif..."
                  value={filters.q}
                  onChange={(e) => handleFilterChange("q", e.target.value)}
                />
              </div>
            </div>
          </div>
          {/* Sidebar End */}

          {/* Content Start */}
          <div className="col-lg-9">
            {/* Top Start */}
            <div className="flex-between gap-16 flex-wrap mb-40">
              <span className="text-gray-900">
                {books.length} ta kitob topildi
              </span>
              <div className="position-relative flex-align gap-16 flex-wrap">
                <div className="list-grid-btns flex-align gap-16">
                  <button
                    onClick={() => setGrid(true)}
                    type="button"
                    className={`w-44 h-44 flex-center border rounded-6 text-2xl list-btn border-gray-100 ${
                      grid === true && "border-main-600 text-white bg-main-600"
                    }`}
                  >
                    <i className="ph-bold ph-list-dashes" />
                  </button>
                  <button
                    onClick={() => setGrid(false)}
                    type="button"
                    className={`w-44 h-44 flex-center border rounded-6 text-2xl grid-btn border-gray-100 ${
                      grid === false && "border-main-600 text-white bg-main-600"
                    }`}
                  >
                    <i className="ph ph-squares-four" />
                  </button>
                </div>
                <div className="position-relative text-gray-500 flex-align gap-4 text-14">
                  <label
                    htmlFor="sorting"
                    className="text-inherit flex-shrink-0"
                  >
                    Tartiblash:{" "}
                  </label>
                  <select
                    value={filters.ordering}
                    onChange={(e) =>
                      handleFilterChange("ordering", e.target.value)
                    }
                    className="form-control common-input px-14 py-14 text-inherit rounded-6 w-auto"
                    id="sorting"
                  >
                    <option value="-created_at">Eng yangi</option>
                    <option value="created_at">Eng eski</option>
                    <option value="-price">Narx: yuqoridan pastga</option>
                    <option value="price">Narx: pastdan yuqoriga</option>
                    <option value="-publication_year">
                      Nashr yili: yuqoridan pastga
                    </option>
                    <option value="publication_year">
                      Nashr yili: pastdan yuqoriga
                    </option>
                  </select>
                </div>
                <button
                  onClick={sidebarController}
                  type="button"
                  className="w-44 h-44 d-lg-none d-flex flex-center border border-gray-100 rounded-6 text-2xl sidebar-btn"
                >
                  <i className="ph-bold ph-funnel" />
                </button>
              </div>
            </div>
            {/* Top End */}

            {/* Books Grid */}
            <div className={`list-grid-wrapper ${grid && "list-view"}`}>
              {books.length === 0 ? (
                <div className="text-center py-80">
                  <p className="text-muted">Hech qanday kitob topilmadi</p>
                </div>
              ) : (
                <div className="row gy-4">
                  {books.map((book) => (
                    <div
                      key={book.id}
                      className="col-xl-3 col-lg-4 col-md-6 col-sm-6"
                    >
                      <BookCard book={book} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Content End */}
        </div>
      </div>
    </section>
  );
};

export default BookShopSection;
