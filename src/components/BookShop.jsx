"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import BookCard from "./BookCard";
import { getBooks } from "@/services/books";
import { getBookCategories } from "@/services/categories";
import { getShops } from "@/services/shops";
import { getRegions } from "@/services/regions";
import Spin from "./Spin";

const BookShop = () => {
  const searchParams = useSearchParams();
  const tBookShop = useTranslations("BookShop");
  const tCommon = useTranslations("Common");
  const tLocation = useTranslations("Location");
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grid, setGrid] = useState(false);
  const [active, setActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    region: "",
    district: "",
    cover_type: "",
    is_used: "",
    type: "",
    shop: "",
    publication_year_min: "",
    publication_year_max: "",
    price_min: "",
    price_max: "",
  });

  const sidebarController = () => {
    setActive(!active);
  };

  // Initialize filters from URL parameters
  useEffect(() => {
    const category = searchParams.get("category") || "";
    const subcategory = searchParams.get("subcategory") || "";
    const region = searchParams.get("region") || "";
    const district = searchParams.get("district") || "";
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";

    setFilters((prev) => ({
      ...prev,
      category: category,
      subcategory: subcategory,
      region: region,
      district: district,
      type: type,
    }));

    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksRes, categoriesRes, shopsRes, regionsRes] =
          await Promise.all([
            getBooks({ limit: 20 }),
            getBookCategories({ limit: 50 }),
            getShops({ limit: 50 }),
            getRegions({ limit: 50 }),
          ]);

        setBooks(booksRes.books || []);
        setCategories(categoriesRes.categories || []);
        setShops(shopsRes.shops || []);
        setRegions(regionsRes.regions || []);
      } catch (error) {
        console.error(tCommon("error"), error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter books based on search and filters
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      !searchQuery ||
      book.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !filters.category || book.category?.id === parseInt(filters.category);
    const matchesSubcategory =
      !filters.subcategory ||
      book.subcategory?.name === filters.subcategory;
    const matchesRegion =
      !filters.region || book.region?.name === filters.region;
    const matchesDistrict =
      !filters.district || book.district?.name === filters.district;
    const matchesCoverType =
      !filters.cover_type || book.cover_type === filters.cover_type;
    const matchesIsUsed =
      filters.is_used === "" || book.is_used === (filters.is_used === "true");
    const matchesType = !filters.type || book.type === filters.type;
    const matchesShop =
      !filters.shop || book.shop?.id === parseInt(filters.shop);

    const year = book.publication_year ? parseInt(book.publication_year) : 0;
    const matchesYearMin =
      !filters.publication_year_min ||
      year >= parseInt(filters.publication_year_min);
    const matchesYearMax =
      !filters.publication_year_max ||
      year <= parseInt(filters.publication_year_max);

    const price = book.price || 0;
    const matchesPriceMin =
      !filters.price_min || price >= parseInt(filters.price_min);
    const matchesPriceMax =
      !filters.price_max || price <= parseInt(filters.price_max);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSubcategory &&
      matchesRegion &&
      matchesDistrict &&
      matchesCoverType &&
      matchesIsUsed &&
      matchesType &&
      matchesShop &&
      matchesYearMin &&
      matchesYearMax &&
      matchesPriceMin &&
      matchesPriceMax
    );
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      subcategory: "",
      region: "",
      district: "",
      cover_type: "",
      is_used: "",
      type: "",
      shop: "",
      publication_year_min: "",
      publication_year_max: "",
      price_min: "",
      price_max: "",
    });
    setSearchQuery("");
  };

  if (loading) {
    return (
      <section className="book-shop py-80">
        <div className="container container-lg">
          <div className="text-center py-80">
            <Spin text={tBookShop("loading") || ""} />
            <p className="mt-16">{tBookShop("loading")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="book-shop py-80">
      <div className={`side-overlay ${active && "show"}`}></div>
      <div className="container container-lg">
        {/* Top Search */}
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-48 gap-16">
          <form className="input-group w-100 max-w-418">
            <input
              type="text"
              className="form-control common-input rounded-start-3"
              placeholder={tBookShop("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="input-group-text border-0 bg-main-600 rounded-end-3 text-white text-2xl hover-bg-main-700 px-24"
            >
              <i className="ph ph-magnifying-glass" />
            </button>
          </form>
          <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-16 grow">
            <div className="text-gray-600 text-md shrink-0">
              <span className="text-neutral-900 fw-semibold">
                {filteredBooks.length}
              </span>{" "}
              {tBookShop("booksFound")}
            </div>
            <div className="d-flex align-items-center gap-8 d-sm-flex d-none">
              <button
                onClick={() => setGrid(false)}
                type="button"
                className={`w-44 h-44 flex-center border rounded-6 text-2xl grid-btn border-gray-100 ${
                  grid === false && "border-main-600 text-white bg-main-600"
                }`}
              >
                <i className="ph ph-squares-four" />
              </button>
              <button
                onClick={() => setGrid(true)}
                type="button"
                className={`w-44 h-44 flex-center border rounded-6 text-2xl list-btn border-gray-100 ${
                  grid === true && "border-main-600 text-white bg-main-600"
                }`}
              >
                <i className="ph-bold ph-list-dashes" />
              </button>
            </div>
            <button
              onClick={sidebarController}
              type="button"
              className="w-48 h-48 d-lg-none d-flex flex-center border border-gray-100 rounded-6 text-2xl sidebar-btn"
            >
              <i className="ph-bold ph-funnel" />
            </button>
          </div>
        </div>
        {/* Top Search End */}

        <div className="row">
          <div className="col-xl-3 col-lg-4">
            <div className={`shop-sidebar ${active && "active"}`}>
              <button
                onClick={sidebarController}
                type="button"
                className="shop-sidebar__close d-lg-none d-flex w-32 h-32 flex-center border border-gray-100 rounded-circle hover-bg-main-600 position-absolute inset-inline-end-0 me-10 mt-8 hover-text-white hover-border-main-600"
              >
                <i className="ph ph-x" />
              </button>

              <div className="d-flex flex-column gap-12 px-lg-0 px-3 py-lg-0 py-4">
                {/* Categories Filter */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                    {tBookShop("categories")}
                  </h6>
                  <ul className="max-h-540 overflow-y-auto scroll-sm">
                    <li className="mb-24">
                      <button
                        onClick={() => handleFilterChange("category", "")}
                        className={`text-gray-900 hover-text-main-600 text-start w-100 ${
                          !filters.category ? "text-main-600 fw-semibold" : ""
                        }`}
                      >
                        {tBookShop("allCategories")}
                      </button>
                    </li>
                    {categories.map((category) => (
                      <li key={category.id} className="mb-24">
                        <button
                          onClick={() =>
                            handleFilterChange("category", category.id)
                          }
                          className={`text-gray-900 hover-text-main-600 text-start w-100 ${
                            filters.category === category.id.toString()
                              ? "text-main-600 fw-semibold"
                              : ""
                          }`}
                        >
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cover Type Filter */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                    {tBookShop("coverType")}
                  </h6>
                  <div className="d-flex flex-column gap-8">
                    <label className="d-flex align-items-center gap-8 cursor-pointer">
                      <input
                        type="radio"
                        name="cover_type"
                        value=""
                        checked={filters.cover_type === ""}
                        onChange={(e) =>
                          handleFilterChange("cover_type", e.target.value)
                        }
                        className="form-check-input"
                      />
                      <span>{tBookShop("all")}</span>
                    </label>
                    <label className="d-flex align-items-center gap-8 cursor-pointer">
                      <input
                        type="radio"
                        name="cover_type"
                        value="hard"
                        checked={filters.cover_type === "hard"}
                        onChange={(e) =>
                          handleFilterChange("cover_type", e.target.value)
                        }
                        className="form-check-input"
                      />
                      <span>{tBookShop("hardCover")}</span>
                    </label>
                    <label className="d-flex align-items-center gap-8 cursor-pointer">
                      <input
                        type="radio"
                        name="cover_type"
                        value="soft"
                        checked={filters.cover_type === "soft"}
                        onChange={(e) =>
                          handleFilterChange("cover_type", e.target.value)
                        }
                        className="form-check-input"
                      />
                      <span>{tBookShop("softCover")}</span>
                    </label>
                  </div>
                </div>

                {/* Condition Filter */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                    {tBookShop("condition")}
                  </h6>
                  <div className="d-flex flex-column gap-8">
                    <label className="d-flex align-items-center gap-8 cursor-pointer">
                      <input
                        type="radio"
                        name="is_used"
                        value=""
                        checked={filters.is_used === ""}
                        onChange={(e) =>
                          handleFilterChange("is_used", e.target.value)
                        }
                        className="form-check-input"
                      />
                      <span>{tBookShop("all")}</span>
                    </label>
                    <label className="d-flex align-items-center gap-8 cursor-pointer">
                      <input
                        type="radio"
                        name="is_used"
                        value="false"
                        checked={filters.is_used === "false"}
                        onChange={(e) =>
                          handleFilterChange("is_used", e.target.value)
                        }
                        className="form-check-input"
                      />
                      <span>{tBookShop("new")}</span>
                    </label>
                    <label className="d-flex align-items-center gap-8 cursor-pointer">
                      <input
                        type="radio"
                        name="is_used"
                        value="true"
                        checked={filters.is_used === "true"}
                        onChange={(e) =>
                          handleFilterChange("is_used", e.target.value)
                        }
                        className="form-check-input"
                      />
                      <span>{tBookShop("used")}</span>
                    </label>
                  </div>
                </div>

                {/* Shop Filter */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                    {tBookShop("shop")}
                  </h6>
                  <select
                    className="common-input form-select"
                    value={filters.shop}
                    onChange={(e) => handleFilterChange("shop", e.target.value)}
                  >
                    <option value="">{tBookShop("allShops")}</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                    {tBookShop("location")}
                  </h6>
                  <div className="position-relative">
                    <ul className="max-h-300 overflow-y-auto scroll-sm">
                      <li className="mb-16">
                        <button
                          onClick={() => {
                            handleFilterChange("region", "");
                            handleFilterChange("district", "");
                          }}
                          className={`text-gray-900 hover-text-main-600 text-start w-100 ${
                            !filters.region ? "text-main-600 fw-semibold" : ""
                          }`}
                        >
                          {tBookShop("allLocations")}
                        </button>
                      </li>
                      {regions.length > 0 ? (
                        regions.map((region) => (
                          <li
                            key={region.id}
                            className="mb-16 position-relative"
                          >
                            <button
                              onClick={() => {
                                handleFilterChange("region", region.id);
                                handleFilterChange("district", "");
                              }}
                              onMouseEnter={() => setHoveredRegionId(region.id)}
                              onMouseLeave={() => setHoveredRegionId(null)}
                              className={`text-gray-900 hover-text-main-600 text-start w-100 d-flex align-items-center justify-content-between ${
                                filters.region === region.id.toString()
                                  ? "text-main-600 fw-semibold"
                                  : ""
                              }`}
                            >
                              <span>{region.name}</span>
                              {region.districts &&
                                region.districts.length > 0 && (
                                  <i className="ph ph-caret-right text-sm text-gray-400" />
                                )}
                            </button>

                            {/* Districts dropdown on hover */}
                            {hoveredRegionId === region.id &&
                              region.districts &&
                              region.districts.length > 0 && (
                                <div
                                  className="position-absolute top-0 start-100 ml-1 bg-white shadow-lg border rounded-2 p-16"
                                  style={{ zIndex: 1000, minWidth: "200px" }}
                                >
                                  <ul className="list-unstyled mb-0">
                                    {region.districts.map((district) => (
                                      <li key={district.id}>
                                        <button
                                          onClick={() => {
                                            handleFilterChange(
                                              "region",
                                              region.id
                                            );
                                            handleFilterChange(
                                              "district",
                                              district.id
                                            );
                                          }}
                                          className={`text-gray-600 hover-text-main-600 text-start w-100 py-8 px-8 rounded-4 ${
                                            filters.district ===
                                            district.id.toString()
                                              ? "text-main-600 fw-semibold bg-main-50"
                                              : ""
                                          }`}
                                        >
                                          {district.name}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </li>
                        ))
                      ) : (
                        <li className="mb-16 text-center text-gray-500">
                          <Spin size="sm" text={tBookShop("loadingLocations") || ""} />
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Publication Year Filter */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                    {tBookShop("publicationYear")}
                  </h6>
                  <div className="d-flex gap-8">
                    <input
                      type="number"
                      className="common-input"
                      placeholder={tBookShop("min")}
                      value={filters.publication_year_min}
                      onChange={(e) =>
                        handleFilterChange(
                          "publication_year_min",
                          e.target.value
                        )
                      }
                    />
                    <input
                      type="number"
                      className="common-input"
                      placeholder={tBookShop("max")}
                      value={filters.publication_year_max}
                      onChange={(e) =>
                        handleFilterChange(
                          "publication_year_max",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                {/* Price Filter */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                    {tBookShop("price")}
                  </h6>
                  <div className="d-flex gap-8">
                    <input
                      type="number"
                      className="common-input"
                      placeholder={tBookShop("minPrice")}
                      value={filters.price_min}
                      onChange={(e) =>
                        handleFilterChange("price_min", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      className="common-input"
                      placeholder={tBookShop("maxPrice")}
                      value={filters.price_max}
                      onChange={(e) =>
                        handleFilterChange("price_max", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <button
                    onClick={clearFilters}
                    className="btn btn-outline-main w-100"
                  >
                    {tBookShop("clearFilters")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-9 col-lg-8">
            {/* Books Grid */}
            <div
              className={`list-grid-wrapper books-grid-wrapper grid-cols-3 ${
                grid && "list-view"
              }`}
            >
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <div className="col-12 text-center py-80">
                  <div className="text-gray-500">
                    <i className="ph ph-book text-6xl mb-16 d-block"></i>
                    <h5 className="mb-8">{tBookShop("noBooks")}</h5>
                    <p>{tBookShop("noBooksMessage")}</p>
                    <button
                      onClick={clearFilters}
                      className="btn btn-main mt-16"
                    >
                      {tBookShop("clearFilters")}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Books Grid End */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookShop;
