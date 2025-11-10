"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getBooks } from "@/services/books";
import { getBookCategories } from "@/services/categories";
import { getRegions } from "@/services/regions";
import BookCard from "./BookCard";
import Spin from "./Spin";

const VendorTwo = () => {
  const t = useTranslations("VendorTwo");
  const tBookShop = useTranslations("BookShop");
  const tCommon = useTranslations("Common");
  const tLocation = useTranslations("Location");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [grid, setGrid] = useState(false);
  const [active, setActive] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filters state
  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    region: "",
    district: "",
    cover_type: "",
    price_min: "",
    price_max: "",
    rating_min: "",
    rating_max: "",
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const itemsPerPage = 12;

  const sidebarController = () => {
    setActive(!active);
  };

  // Initialize filters and search query from URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const subcategoryParam = searchParams.get("subcategory");
    const regionParam = searchParams.get("region");
    const districtParam = searchParams.get("district");
    const coverTypeParam = searchParams.get("cover_type");
    const priceMinParam = searchParams.get("price_min");
    const priceMaxParam = searchParams.get("price_max");
    const ratingMinParam = searchParams.get("rating_min");
    const ratingMaxParam = searchParams.get("rating_max");
    const searchParam = searchParams.get("q") || searchParams.get("search");
    
    // Set filters from URL params (category will be converted to ID after categories are loaded)
    if (categoryParam || subcategoryParam || regionParam || districtParam || 
        coverTypeParam || priceMinParam || priceMaxParam || ratingMinParam || ratingMaxParam) {
      setFilters({
        category: categoryParam || "",
        subcategory: subcategoryParam || "",
        region: regionParam || "",
        district: districtParam || "",
        cover_type: coverTypeParam || "",
        price_min: priceMinParam || "",
        price_max: priceMaxParam || "",
        rating_min: ratingMinParam || "",
        rating_max: ratingMaxParam || "",
      });
    }
    
    // Set search query from URL params
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert category and subcategory name to ID when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      let updatedFilters = { ...filters };
      let needsUpdate = false;

      // Convert category name to ID
      if (filters.category) {
        const isNumeric = /^\d+$/.test(filters.category);
        if (!isNumeric) {
          const foundCategory = categories.find(
            cat => cat.name === decodeURIComponent(filters.category)
          );
          if (foundCategory && foundCategory.id.toString() !== filters.category) {
            updatedFilters.category = foundCategory.id.toString();
            needsUpdate = true;
          }
        }
      }

      // Convert subcategory name to ID
      if (filters.subcategory) {
        const isNumeric = /^\d+$/.test(filters.subcategory);
        if (!isNumeric) {
          // Find subcategory by name in all categories
          for (const cat of categories) {
            if (cat.subcategories && cat.subcategories.length > 0) {
              const foundSub = cat.subcategories.find(
                sub => sub.name === decodeURIComponent(filters.subcategory)
              );
              if (foundSub && foundSub.id.toString() !== filters.subcategory) {
                updatedFilters.subcategory = foundSub.id.toString();
                needsUpdate = true;
                break;
              }
            }
          }
        }
      }

      if (needsUpdate) {
        setFilters(updatedFilters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  // Set districts when region is selected and regions are loaded
  useEffect(() => {
    if (filters.region && regions.length > 0) {
      const selectedRegion = regions.find(r => r.name === filters.region);
      if (selectedRegion) {
        setDistricts(selectedRegion.districts || []);
      }
    }
  }, [filters.region, regions]);

  // Fetch categories and regions
  useEffect(() => {
    fetchCategories();
    fetchRegions();
  }, []);

  // Fetch books from API
  useEffect(() => {
    fetchBooks();
  }, [currentPage, filters, searchQuery]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        is_active: true,
      };

      if (searchQuery) {
        params.q = searchQuery;
      }
      if (filters.category) {
        // API expects category as integer (ID), not string (name)
        const categoryId = parseInt(filters.category);
        if (!isNaN(categoryId)) {
          params.category = categoryId;
        }
      }
      if (filters.subcategory) {
        // API expects subcategory as integer (ID), not string (name)
        // Try to find subcategory ID from categories
        let subcategoryId = filters.subcategory;
        const isNumeric = /^\d+$/.test(filters.subcategory);
        if (!isNumeric && categories.length > 0) {
          // Find subcategory by name
          for (const cat of categories) {
            if (cat.subcategories && cat.subcategories.length > 0) {
              const foundSub = cat.subcategories.find(
                sub => sub.name === decodeURIComponent(filters.subcategory)
              );
              if (foundSub) {
                subcategoryId = foundSub.id.toString();
                break;
              }
            }
          }
        }
        const subcategoryIdInt = parseInt(subcategoryId);
        if (!isNaN(subcategoryIdInt)) {
          params.subcategory = subcategoryIdInt;
        }
      }
      // API expects region and district by name, not ID
      if (filters.region) {
        params.region = filters.region; // region name
      }
      if (filters.district) {
        params.district = filters.district; // district name
      }
      if (filters.cover_type) {
        params.cover_type = filters.cover_type;
      }
      if (filters.price_min) {
        params.price_min = filters.price_min;
      }
      if (filters.price_max) {
        params.price_max = filters.price_max;
      }
      if (filters.rating_min) {
        params.rating_min = filters.rating_min;
      }
      if (filters.rating_max) {
        params.rating_max = filters.rating_max;
      }

      const response = await getBooks(params);
      const allBooks = response.books || [];
      
      // Calculate pagination
      const totalCount = response.count || allBooks.length;
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const paginatedBooks = allBooks.slice(startIdx, endIdx);
      
      setBooks(paginatedBooks);
      setTotalCount(totalCount);
      
      // Calculate if there's a next/previous page
      setHasNextPage((currentPage * itemsPerPage) < totalCount);
      setHasPreviousPage(currentPage > 1);
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getBookCategories({ limit: 50 });
      setCategories(response.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await getRegions();
      setRegions(response.regions || response || []);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // Update URL with search query
    updateURL(filters, searchQuery, 1);
    fetchBooks();
  };

  // Update URL with current filters
  const updateURL = (newFilters, newSearchQuery = searchQuery, newPage = 1) => {
    const params = new URLSearchParams();
    
    if (newSearchQuery) {
      params.set("q", newSearchQuery);
    }
    if (newFilters.category) {
      // Use category name if it's not numeric, otherwise try to find name from categories
      const isNumeric = /^\d+$/.test(newFilters.category);
      if (isNumeric && categories.length > 0) {
        const category = categories.find(cat => cat.id.toString() === newFilters.category);
        if (category) {
          params.set("category", category.name);
        } else {
          // If category not found, keep the ID (shouldn't happen normally)
          params.set("category", newFilters.category);
        }
      } else {
        // If it's already a name or categories not loaded yet, use as is
        params.set("category", newFilters.category);
      }
    }
    if (newFilters.subcategory) {
      // Use subcategory name if it's not numeric, otherwise try to find name from categories
      const isNumeric = /^\d+$/.test(newFilters.subcategory);
      if (isNumeric && categories.length > 0) {
        // Find subcategory by ID
        for (const cat of categories) {
          if (cat.subcategories && cat.subcategories.length > 0) {
            const foundSub = cat.subcategories.find(
              sub => sub.id.toString() === newFilters.subcategory
            );
            if (foundSub) {
              params.set("subcategory", foundSub.name);
              break;
            }
          }
        }
        // If not found, keep the ID
        if (!params.has("subcategory")) {
          params.set("subcategory", newFilters.subcategory);
        }
      } else {
        // If it's already a name or categories not loaded yet, use as is
        params.set("subcategory", newFilters.subcategory);
      }
    }
    if (newFilters.region) {
      params.set("region", newFilters.region);
    }
    if (newFilters.district) {
      params.set("district", newFilters.district);
    }
    if (newFilters.cover_type) {
      params.set("cover_type", newFilters.cover_type);
    }
    if (newFilters.price_min) {
      params.set("price_min", newFilters.price_min);
    }
    if (newFilters.price_max) {
      params.set("price_max", newFilters.price_max);
    }
    if (newFilters.rating_min) {
      params.set("rating_min", newFilters.rating_min);
    }
    if (newFilters.rating_max) {
      params.set("rating_max", newFilters.rating_max);
    }
    if (newPage > 1) {
      params.set("page", newPage.toString());
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    
    // Special handling for region filter
    if (filterType === "region") {
      // If region is being cleared, clear districts too
      if (!value) {
        setDistricts([]);
      } else {
        // Find the selected region and get its districts
        const selectedRegion = regions.find(r => r.name === value);
        if (selectedRegion) {
          setDistricts(selectedRegion.districts || []);
        }
      }
    }
    
    // Update filters
    let updatedFilters;
    if (filterType === "region") {
      updatedFilters = {
        ...filters,
        region: value,
        district: "",
      };
    } else {
      updatedFilters = {
        ...filters,
        [filterType]: value,
      };
    }
    
    setFilters(updatedFilters);
    
    // Update URL
    updateURL(updatedFilters, searchQuery, 1);
  };

  const handleClearFilters = () => {
    setCurrentPage(1);
    const clearedFilters = {
      category: "",
      subcategory: "",
      region: "",
      district: "",
      cover_type: "",
      price_min: "",
      price_max: "",
      rating_min: "",
      rating_max: "",
    };
    setFilters(clearedFilters);
    setSearchQuery("");
    
    // Update URL - clear all params
    router.replace(pathname, { scroll: false });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Update URL with page number
    updateURL(filters, searchQuery, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <section className="vendor-two py-80">
      <div className={`side-overlay ${active && "show"}`}></div>
      <div className="container container-lg">
        {/* Top Search */}
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-48 gap-16">
          <form onSubmit={handleSearch} className="input-group w-100 max-w-418">
            <input
              type="text"
              className="form-control common-input rounded-start-3"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="input-group-text border-0 bg-main-two-600 rounded-end-3 text-white text-2xl hover-bg-main-two-700 px-24"
            >
              <i className="ph ph-magnifying-glass" />
            </button>
          </form>
          <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-16 flex-grow-1">
            <div className="text-gray-600 text-md flex-shrink-0">
              <span className="text-neutral-900 fw-semibold">{totalCount}</span> {t("resultsFound")}
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
                    {t("productCategory")}
                  </h6>
                  <ul className="max-h-540 overflow-y-auto scroll-sm">
                    <li className="mb-24">
                      <button
                        onClick={() => handleFilterChange("category", "")}
                        className={`text-gray-900 hover-text-main-600 text-start border-0 bg-transparent w-100 ${!filters.category && "text-main-600 fw-semibold"}`}
                      >
                        {tCommon("all")}
                      </button>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.id} className="mb-24">
                        <button
                          onClick={() => handleFilterChange("category", cat.id)}
                          className={`text-gray-900 hover-text-main-600 text-start border-0 bg-transparent w-100 ${filters.category === cat.id.toString() && "text-main-600 fw-semibold"}`}
                        >
                          {cat.name} ({cat.books_count || 0})
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cover Type Filter */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                    {t("filterByCover")}
                  </h6>
                  <div className="d-flex flex-column gap-8">
                    <label className="d-flex align-items-center gap-8 cursor-pointer">
                      <input
                        type="radio"
                        name="cover_type"
                        value=""
                        checked={filters.cover_type === ""}
                        onChange={(e) => handleFilterChange("cover_type", e.target.value)}
                        className="form-check-input"
                      />
                      <span>{tCommon("all")}</span>
                    </label>
                    <label className="d-flex align-items-center gap-8 cursor-pointer">
                      <input
                        type="radio"
                        name="cover_type"
                        value="hard"
                        checked={filters.cover_type === "hard"}
                        onChange={(e) => handleFilterChange("cover_type", e.target.value)}
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
                        onChange={(e) => handleFilterChange("cover_type", e.target.value)}
                        className="form-check-input"
                      />
                      <span>{tBookShop("softCover")}</span>
                    </label>
                  </div>
                </div>

                {/* Price Filter */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                    {t("filterByPrice")}
                  </h6>
                  <div className="d-flex gap-8">
                    <input
                      type="number"
                      className="common-input"
                      placeholder={t("minPrice")}
                      value={filters.price_min}
                      onChange={(e) => handleFilterChange("price_min", e.target.value)}
                    />
                    <input
                      type="number"
                      className="common-input"
                      placeholder={t("maxPrice")}
                      value={filters.price_max}
                      onChange={(e) => handleFilterChange("price_max", e.target.value)}
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                    {t("filterByRating")}
                  </h6>
                  <div className="d-flex gap-8">
                    <input
                      type="number"
                      className="common-input"
                      placeholder={t("minRating")}
                      min="0"
                      max="5"
                      step="0.1"
                      value={filters.rating_min}
                      onChange={(e) => handleFilterChange("rating_min", e.target.value)}
                    />
                    <input
                      type="number"
                      className="common-input"
                      placeholder={t("maxRating")}
                      min="0"
                      max="5"
                      step="0.1"
                      value={filters.rating_max}
                      onChange={(e) => handleFilterChange("rating_max", e.target.value)}
                    />
                  </div>
                </div>

                {/* Location Filter */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
                    {t("filterByLocation")}
                  </h6>
                  <div className="d-flex flex-column gap-12">
                    <div>
                      <label className="text-sm text-gray-600 mb-8 d-block fw-medium">
                        {tLocation("region")}
                      </label>
                      <select
                        className="common-input form-select"
                        value={filters.region}
                        onChange={(e) => {
                          handleFilterChange("region", e.target.value);
                        }}
                      >
                        <option value="">{tBookShop("allLocations")}</option>
                        {regions.map((region) => (
                          <option key={region.id} value={region.name}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {filters.region && districts.length > 0 && (
                      <div>
                        <label className="text-sm text-gray-600 mb-8 d-block fw-medium">
                          {tLocation("district")}
                        </label>
                        <select
                          className="common-input form-select"
                          value={filters.district}
                          onChange={(e) => handleFilterChange("district", e.target.value)}
                        >
                          <option value="">{tLocation("selectDistrict")}</option>
                          {districts.map((district) => (
                            <option key={district.id} value={district.name}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="border border-gray-50 rounded-8 p-24">
                  <button
                    onClick={handleClearFilters}
                    className="btn btn-outline-main w-100"
                  >
                    {t("clearFilters")}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-9 col-lg-8">
            {/* Books Start */}
            {loading ? (
              <div className="text-center py-80">
                <Spin text={t("loading")} />
              </div>
            ) : books.length > 0 ? (
              <>
                <div
                  className={`list-grid-wrapper books-grid-wrapper grid-cols-3 ${
                    grid && "list-view"
                  }`}
                >
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <ul className="pagination flex-center flex-wrap gap-16 mt-48">
                    <li className="page-item">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPreviousPage}
                        className={`page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium border border-gray-100 ${
                          !hasPreviousPage
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-neutral-600 hover-bg-main-600 hover-text-white hover-border-main-600"
                        }`}
                      >
                        <i className="ph-bold ph-arrow-left" />
                      </button>
                    </li>
                    {getPageNumbers().map((pageNum) => (
                      <li key={pageNum} className="page-item">
                        <button
                          onClick={() => handlePageChange(pageNum)}
                          className={`page-link h-64 w-64 flex-center text-md rounded-8 fw-medium border border-gray-100 ${
                            currentPage === pageNum
                              ? "text-white bg-main-600 border-main-600"
                              : "text-neutral-600 hover-bg-main-600 hover-text-white hover-border-main-600"
                          }`}
                        >
                          {String(pageNum).padStart(2, "0")}
                        </button>
                      </li>
                    ))}
                    <li className="page-item">
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNextPage}
                        className={`page-link h-64 w-64 flex-center text-xxl rounded-8 fw-medium border border-gray-100 ${
                          !hasNextPage
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-neutral-600 hover-bg-main-600 hover-text-white hover-border-main-600"
                        }`}
                      >
                        <i className="ph-bold ph-arrow-right" />
                      </button>
                    </li>
                  </ul>
                )}
              </>
            ) : (
              <div className="text-center py-80">
                <i className="ph ph-books text-gray-300 text-5xl mb-16"></i>
                <h5 className="text-gray-500 mb-8">{t("noBooks")}</h5>
                <p className="text-gray-400 text-sm mb-24">{t("noBooksMessage")}</p>
                <button
                  onClick={handleClearFilters}
                  className="btn btn-main d-inline-flex align-items-center gap-8"
                >
                  <i className="ph ph-arrow-counter-clockwise"></i>
                  {t("clearFilters")}
                </button>
              </div>
            )}
            {/* Books End */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VendorTwo;
