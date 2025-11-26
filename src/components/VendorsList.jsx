"use client";
import React, { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { getShops } from "@/services/shops";
import { getRegions } from "@/services/regions";
import Spin from "./Spin";
import { useTranslations } from "next-intl";

const VendorsList = () => {
  const searchParams = useSearchParams();
  const [shops, setShops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const debounceTimerRef = useRef(null);
  const regionsLoadedRef = useRef(false);
  const tBread = useTranslations("Breadcrumb")
  const [filters, setFilters] = useState({
    region: "",
    district: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Initialize filters from URL parameters
  useEffect(() => {
    const region = searchParams.get("region") || "";
    const district = searchParams.get("district") || "";
    const search = searchParams.get("q") || "";

    setFilters((prev) => ({
      ...prev,
      region: region,
      district: district,
    }));

    if (search) {
      setSearchQuery(search);
      setInputValue(search);
    }
  }, [searchParams]);

  // Debounce search input - only update searchQuery after user stops typing
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only search if input has at least 3 characters or is empty
    const trimmedInput = inputValue.trim();
    if (trimmedInput.length === 0 || trimmedInput.length >= 3) {
      debounceTimerRef.current = setTimeout(() => {
        setSearchQuery(trimmedInput);
        setCurrentPage(1); // Reset to first page when search changes
      }, 500); // Wait 500ms after user stops typing
    }

    // Cleanup timer on unmount or when inputValue changes
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue]);

  // Load regions only once on mount
  useEffect(() => {
    if (!regionsLoadedRef.current) {
      const loadRegions = async () => {
        try {
          const regionsRes = await getRegions({ limit: 50 });
          setRegions(regionsRes.regions || []);
          regionsLoadedRef.current = true;
        } catch (err) {
          console.error("❌ Regions yuklashda xatolik:", err);
        }
      };
      loadRegions();
    }
  }, []);

  // Fetch shops data
  useEffect(() => {
    const fetchShops = async () => {
      try {
        // Show loading only for search/filter changes, not initial load
        if (initialLoading) {
          setInitialLoading(true);
        } else {
          setSearchLoading(true);
        }

        console.log("🔄 Fetching shops with params:", {
          q: searchQuery,
          region: filters.region,
          district: filters.district,
          page: currentPage,
          limit: 12,
        });

        const shopsRes = await getShops({
          q: searchQuery,
          region: filters.region,
          district: filters.district,
          page: currentPage,
          limit: 12,
        });

        console.log("📦 Shops response:", shopsRes);

        // Debug: Check if shops data exists
        console.log("🔍 Shops data check:", {
          hasShops: !!shopsRes.shops,
          shopsLength: shopsRes.shops?.length || 0,
          shopsType: typeof shopsRes.shops,
          rawData: shopsRes.raw,
        });

        setShops(shopsRes.shops || []);
        setTotalCount(shopsRes.count || 0);
      } catch (err) {
        console.error("❌ Ma'lumotlarni yuklashda xatolik:", err);
      } finally {
        setInitialLoading(false);
        setSearchLoading(false);
      }
    };

    fetchShops();
  }, [searchQuery, filters, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      region: "",
      district: "",
    });
    setSearchQuery("");
    setInputValue("");
    setCurrentPage(1);
  };

  // Show full page loading only on initial load
  if (initialLoading) {
    return (
      <section className="vendors-list py-80">
        <div className="container container-lg">
          <div className="text-center py-80">
            <Spin text="Ma'lumotlar yuklanmoqda..." />
            <p className="mt-16">Ma'lumotlar yuklanmoqda...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="vendors-list py-80">
      <div className="container container-lg">
        <div className="flex-between flex-wrap gap-8 mb-40">
          <span className="text-neutral-600 fw-medium px-40 py-12 rounded-pill border border-neutral-100">
            {totalCount > 0
              ? `Showing ${(currentPage - 1) * 12 + 1}-${Math.min(
                  currentPage * 12,
                  totalCount
                )} of ${totalCount} results`
              : "No shops found"}
          </span>
          <div className="flex-align gap-16">
            <form
              onSubmit={handleSearch}
              className="search-form__wrapper position-relative d-block"
            >
              <input
                type="text"
                className="search-form__input common-input py-13 ps-16 pe-18 rounded-pill pe-44"
                placeholder="Search shops by name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                type="submit"
                className="w-32 h-32 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8"
              >
                <i className="ph ph-magnifying-glass" />
              </button>
            </form>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-40">
          <div className="col-lg-3 col-md-6 mb-16">
            <select
              className="common-input form-select w-100"
              value={filters.region}
              onChange={(e) => handleFilterChange("region", e.target.value)}
            >
              <option value="">Barcha viloyatlar</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-lg-3 col-md-6 mb-16">
            <select
              className="common-input form-select w-100"
              value={filters.district}
              onChange={(e) => handleFilterChange("district", e.target.value)}
            >
              <option value="">Barcha tumanlar</option>
              {regions
                .find((r) => r.id === parseInt(filters.region))
                ?.districts?.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="col-lg-2 col-md-6 mb-16">
            <button
              onClick={clearFilters}
              className="btn btn-outline-secondary w-100"
            >
              Tozalash
            </button>
          </div>
        </div>
        <div className="row gy-4 vendor-card-wrapper position-relative">
          {searchLoading && (
            <div 
              className="position-absolute top-0 start-0 w-100 d-flex align-items-center justify-content-center" 
              style={{ 
                zIndex: 10, 
                minHeight: '400px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(2px)'
              }}
            >
              <div className="text-center">
                <Spin text="Qidirilmoqda..." />
                <p className="mt-16 text-neutral-600">Qidiruv natijalari yuklanmoqda...</p>
              </div>
            </div>
          )}
          {shops.length > 0 ? (
            shops.map((shop) => (
              <div key={shop.id} className="col-xxl-3 col-lg-4 col-sm-6">
                <div className="vendor-card text-center px-16 pb-24">
                  <div className="">
                    <img
                      src={
                        shop.picture ||
                        shop.logo ||
                        "assets/images/thumbs/vendor-logo1.png"
                      }
                      alt={shop.name}
                      className="vendor-card__logo m-12"
                      style={{
                        height: "80px",
                        width: "80px",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                    <h6 className="title mt-32">
                      <Link
                        href={`/vendor-two-details?id=${shop.id}`}
                        className=""
                      >
                        {shop.name}
                      </Link>
                    </h6>

                    {/* Product Count */}
                    <span className="text-heading text-sm d-block">
                      {shop.book_count} mahsulot
                    </span>

                    {/* Location */}
                    {(shop.region || shop.district) && (
                      <span className="text-gray-600 text-xs d-block mt-4">
                        {shop.region?.name && shop.district?.name
                          ? `${shop.district.name}, ${shop.region.name}`
                          : shop.region?.name || shop.district?.name}
                      </span>
                    )}

                    {/* Working Hours */}
                    {shop.working_days && shop.working_hours && (
                      <span className="text-gray-600 text-xs d-block mt-4">
                        {shop.working_days} {shop.working_hours}
                      </span>
                    )}

                    {/* Post Service Badge */}
                    {shop.has_post_service && (
                      <span className="bg-main-50 text-main-600 px-12 py-4 rounded-pill text-xs d-inline-block mt-8 mb-8">
                        <i className="ph ph-truck d-inline mr-4" />
                        Yetkazib berish
                      </span>
                    )}

                    <Link
                      href={`/vendor-two-details?id=${shop.id}`}
                      className="bg-white text-neutral-600 hover-bg-main-600 hover-text-white rounded-pill py-6 px-16 text-12 mt-8 inline-block"
                    >
                      {tBread("exploreShop")}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-80">
              <div className="text-gray-500">
                <i className="ph ph-store text-6xl mb-16"></i>
                <h5 className="mb-8">Hech qanday do'kon topilmadi</h5>
                <p>
                  Qidiruv mezonlarini o'zgartiring yoki barcha filtrlarni
                  tozalang
                </p>
              </div>
            </div>
          )}
        </div>
        {shops.length > 0 && (
          <ul className="pagination flex-center flex-wrap gap-16">
            <li className="page-item">
              <button
                className="page-link h-64 w-64 flex-center text-xxl rounded-circle fw-medium text-neutral-600 border border-gray-100"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <i className="ph-bold ph-arrow-left" />
              </button>
            </li>
            {Array.from(
              { length: Math.ceil(totalCount / 12) },
              (_, i) => i + 1
            ).map((page) => (
              <li
                key={page}
                className={`page-item ${currentPage === page ? "active" : ""}`}
              >
                <button
                  className="page-link h-64 w-64 flex-center text-md rounded-circle fw-medium text-neutral-600 border border-gray-100"
                  onClick={() => setCurrentPage(page)}
                >
                  {page.toString().padStart(2, "0")}
                </button>
              </li>
            ))}
            <li className="page-item">
              <button
                className="page-link h-64 w-64 flex-center text-xxl rounded-circle fw-medium text-neutral-600 border border-gray-100"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(Math.ceil(totalCount / 12), prev + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(totalCount / 12)}
              >
                <i className="ph-bold ph-arrow-right" />
              </button>
            </li>
          </ul>
        )}
      </div>
    </section>
  );
};

export default VendorsList;
