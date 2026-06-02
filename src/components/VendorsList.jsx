"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getShops } from "@/services/shops";
import { getRegions } from "@/services/regions";
import Icon from "@/components/Icon";
import ShopCard from "@/components/shop/ShopCard";
import ShopCardSkeleton from "@/components/shared/ShopCardSkeleton";
import Spin from "./Spin";

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
  // We need to know "is this the very first fetch?" without putting it in
  // the effect deps — otherwise the effect re-runs when the boolean flips,
  // causing a duplicate fetch. A ref carries the flag across renders
  // without triggering a re-render itself.
  const firstFetchRef = useRef(true);
  const tBread = useTranslations("Breadcrumb");
  const tBtn = useTranslations("Buttons");
  const tLoc = useTranslations("Location");
  const tVendor = useTranslations("Vendor");
  const tLoading = useTranslations("Loading");
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

  // Fetch shops data. First fetch shows the full-page spinner; subsequent
  // fetches (filter/search/page change) show the inline "searching" state.
  useEffect(() => {
    const fetchShops = async () => {
      try {
        if (firstFetchRef.current) {
          setInitialLoading(true);
        } else {
          setSearchLoading(true);
        }

        const shopsRes = await getShops({
          q: searchQuery,
          region: filters.region,
          district: filters.district,
          page: currentPage,
          limit: 12,
        });

        setShops(shopsRes.shops || []);
        setTotalCount(shopsRes.count || 0);
      } catch {
        // Non-critical for the UI — the list just stays empty and the
        // user can retry by adjusting filters. Surface to Sentry via the
        // axios interceptor, no need to log here.
      } finally {
        firstFetchRef.current = false;
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

  // Initial load: skeleton grid that mirrors the populated layout, so the
  // page doesn't jump from a centered spinner to a full grid.
  if (initialLoading) {
    return (
      <section className="vendors-list py-80">
        <div className="container container-lg">
          <div className="row g-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="col-12 col-md-6 col-xxl-4">
                <ShopCardSkeleton />
              </div>
            ))}
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
              ? tVendor("showingResults", {
                  start: (currentPage - 1) * 12 + 1,
                  end: Math.min(currentPage * 12, totalCount),
                  total: totalCount,
                })
              : tBread("noShopsFound")}
          </span>
          <div className="flex-align gap-16">
            <form
              onSubmit={handleSearch}
              className="search-form__wrapper position-relative d-block"
            >
              <input
                type="text"
                className="search-form__input common-input py-13 ps-16 pe-18 rounded-pill pe-44"
                placeholder={tVendor("searchPlaceholder")}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                type="submit"
                className="w-32 h-32 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8"
              >
                <Icon className="ph ph-magnifying-glass" />
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
              <option value="">{tLoc("allRegions")}</option>
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
              <option value="">{tLoc("allDistricts")}</option>
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
            <button onClick={clearFilters} className="btn btn-outline-secondary w-100">
              {tBtn("clear")}
            </button>
          </div>
        </div>
        <div className="row g-3 position-relative">
          {searchLoading && (
            <div
              className="position-absolute top-0 start-0 w-100 d-flex align-items-center justify-content-center"
              style={{
                zIndex: 10,
                minHeight: "400px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(2px)",
              }}
            >
              <div className="text-center">
                <Spin text={tLoading("searching")} />
                <p className="mt-16 text-neutral-600">{tLoading("searchResults")}</p>
              </div>
            </div>
          )}
          {shops.length > 0 ? (
            shops.map((shop) => (
              <div key={shop.id} className="col-12 col-md-6 col-xxl-4">
                <ShopCard shop={shop} />
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-80">
              <div className="text-gray-500">
                <Icon className="ph ph-store text-6xl mb-16"></Icon>
                <h5 className="mb-8">{tBread("noShopsFound")}</h5>
                <p>{tBread("adjustFilters")}</p>
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
                <Icon className="ph ph-arrow-left" />
              </button>
            </li>
            {Array.from({ length: Math.ceil(totalCount / 12) }, (_, i) => i + 1).map((page) => (
              <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
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
                  setCurrentPage((prev) => Math.min(Math.ceil(totalCount / 12), prev + 1))
                }
                disabled={currentPage >= Math.ceil(totalCount / 12)}
              >
                <Icon className="ph ph-arrow-right" />
              </button>
            </li>
          </ul>
        )}
      </div>
    </section>
  );
};

export default VendorsList;
