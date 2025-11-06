"use client";
import React, { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const tBread = useTranslations("Breadcrumb")
  const [filters, setFilters] = useState({
    region: "",
    district: "",
    star_min: "",
    star_max: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Initialize filters from URL parameters
  useEffect(() => {
    const region = searchParams.get("region") || "";
    const district = searchParams.get("district") || "";
    const search = searchParams.get("q") || "";
    const starMin = searchParams.get("star_min") || "";
    const starMax = searchParams.get("star_max") || "";

    setFilters((prev) => ({
      ...prev,
      region: region,
      district: district,
      star_min: starMin,
      star_max: starMax,
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
        console.log("🔄 Fetching shops with params:", {
          q: searchQuery,
          region: filters.region,
          district: filters.district,
          star_min: filters.star_min,
          star_max: filters.star_max,
          page: currentPage,
          limit: 12,
        });

        const [shopsRes, regionsRes] = await Promise.all([
          getShops({
            q: searchQuery,
            region: filters.region,
            district: filters.district,
            star_min: filters.star_min,
            star_max: filters.star_max,
            page: currentPage,
            limit: 12,
          }),
          getRegions({ limit: 50 }),
        ]);

        console.log("📦 Shops response:", shopsRes);
        console.log("🌍 Regions response:", regionsRes);

        // Debug: Check if shops data exists
        console.log("🔍 Shops data check:", {
          hasShops: !!shopsRes.shops,
          shopsLength: shopsRes.shops?.length || 0,
          shopsType: typeof shopsRes.shops,
          rawData: shopsRes.raw,
        });

        setShops(shopsRes.shops || []);
        setTotalCount(shopsRes.count || 0);
        setRegions(regionsRes.regions || []);
      } catch (err) {
        console.error("❌ Ma'lumotlarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      star_min: "",
      star_max: "",
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  if (loading) {
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <input
              type="number"
              className="common-input w-100"
              placeholder="Min star"
              value={filters.star_min}
              onChange={(e) => handleFilterChange("star_min", e.target.value)}
              min="0"
              max="5"
              step="0.1"
            />
          </div>
          <div className="col-lg-2 col-md-6 mb-16">
            <input
              type="number"
              className="common-input w-100"
              placeholder="Max star"
              value={filters.star_max}
              onChange={(e) => handleFilterChange("star_max", e.target.value)}
              min="0"
              max="5"
              step="0.1"
            />
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
        <div className="row gy-4 vendor-card-wrapper">
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

                    {/* Star Rating */}
                    {shop.star && (
                      <div className="flex-center gap-4 mt-8 mb-8">
                        <span className="text-warning-600 text-sm fw-bold">
                          {parseFloat(shop.star).toFixed(1)}
                        </span>
                        <i className="ph-fill ph-star text-warning-600 text-sm" />
                      </div>
                    )}

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
                      {tBread("Breadcrumb")}
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
