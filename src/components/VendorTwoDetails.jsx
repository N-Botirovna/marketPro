"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import VendorTwoSideBar from "./VendorTwoSideBar";
import { useSearchParams } from "next/navigation";
import { getBooks } from "@/services/books";
import { getShopDetails } from "@/services/shop";

const VendorTwoDetails = () => {
  let [grid, setGrid] = useState(false);
  const searchParams = useSearchParams();
  const [books, setBooks] = useState([]);
  const [shop, setShop] = useState(null);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);

  let [active, setActive] = useState(false);
  let sidebarController = () => {
    setActive(!active);
  };
  const fetchBooks = (shopId, catId = categoryId, q = query) => {
    setLoading(true);
    const params = { shop: shopId, is_active: true, limit: 12 };
    if (catId) params.category = catId;
    if (q) params.q = q;
    getBooks(params)
      .then((res) => {
        setBooks(res.books || res.result || []);
      })
      .catch((err) => {
        const message = err?.normalized?.message || err?.message;
        console.error("Failed to fetch shop books:", message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const shopId = searchParams.get("id");
    if (!shopId) return;
    fetchBooks(shopId);

    getShopDetails(shopId)
      .then((data) => {
        const s = data?.result || data || null;
        setShop(s);
      })
      .catch(() => {});
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const shopId = searchParams.get("id");
    if (!shopId) return;
    fetchBooks(shopId, categoryId, query);
  };

  const handleCategorySelect = (catId) => {
    setCategoryId(catId);
    const shopId = searchParams.get("id");
    if (!shopId) return;
    fetchBooks(shopId, catId, query);
  };

  const handleResetFilters = () => {
    setQuery("");
    setCategoryId(null);
    const shopId = searchParams.get("id");
    if (!shopId) return;
    fetchBooks(shopId, null, "");
  };

  return (
    <section className="vendor-two-details py-80">
      <div className={`side-overlay ${active && "show"}`}></div>
      <div className="container container-lg">
        <div className="vendor-two-details-wrapper d-flex flex-wrap align-items-start gap-24">
          {/* Shop Sidebar Start */}
          <div className={`shop-sidebar ${active && "active"}`}>
            <button
              onClick={sidebarController}
              type="button"
              className="shop-sidebar__close d-lg-none d-flex w-32 h-32 flex-center border border-gray-100 rounded-circle hover-bg-main-600 bg-main-600 position-absolute inset-inline-end-0 me-10 mt-8 text-white border-main-600"
            >
              <i className="ph ph-x" />
            </button>
            <VendorTwoSideBar grid={grid} shop={shop} onCategorySelect={handleCategorySelect} />
          </div>
          {/* Shop Sidebar End */}
          <div className="vendor-two-details__contents">
            {/* Inner Banner Start */}
            <div
              className="inner-banner-two bg-img rounded-16 overflow-hidden"
              style={{
                backgroundImage: `url('assets/images/thumbs/inner-banner-two-bg.png')`,
              }}
            >
              <div className="row">
                <div className="col-6 d-xl-block d-none" />
                <div className="col-xl-6 d-xl-flex">
                  <div className="text-center py-32">
                    <h6 className="text-white">Daily Offer</h6>
                    <h3 className="my-32 text-white">SALE 48% OFF</h3>
                    <Link
                      href="/shop"
                      className="btn btn-main d-inline-flex align-items-center rounded-8 gap-8"
                    >
                      Shop Now
                      <span className="icon text-xl d-flex">
                        <i className="ph ph-shopping-cart" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/* Inner Banner End */}
            {/* Search Filter Start */}
            <div className="d-flex align-items-center justify-content-between flex-wrap mt-40 mb-32 gap-16">
              <form onSubmit={handleSearchSubmit} className="input-group w-100 max-w-418">
                <input
                  type="text"
                  className="form-control common-input rounded-start-3"
                  placeholder="Searching..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="input-group-text border-0 bg-main-two-600 rounded-end-3 text-white text-2xl hover-bg-main-two-700 px-24"
                >
                  <i className="ph ph-magnifying-glass" />
                </button>
              </form>
              <button
                type="button"
                onClick={handleResetFilters}
                className="default-btn btn btn-main d-inline-flex align-items-center rounded-pill gap-8"
                disabled={!query && !categoryId}
                aria-disabled={!query && !categoryId}
              >
                Reset filters
              </button>
              <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-16 flex-grow-1">
                <span className="text-gray-900">Showing 1-20 of 85 result</span>
                <div className="d-flex align-items-center gap-8 d-sm-flex d-none">
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
                <div className="flex-align gap-8">
                  <span className="text-gray-900 flex-shrink-0 d-sm-block d-none">
                    Sort by:
                  </span>
                  <select
                    className="common-input form-select rounded-pill border border-gray-100 d-inline-block ps-20 pe-36 h-48 py-0 fw-medium"
                    defaultValue={1}
                  >
                    <option value={1}>Latest</option>
                    <option value={1}>Old</option>
                  </select>
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
            {/* Search Filter End */}
            {/* Products Start */}
            <div
              className={`list-grid-wrapper grid-cols-4 ${grid && "list-view"}`}
            >
              {!loading && Array.isArray(books) && books.length === 0 && (
                <div className="w-100 text-center py-40">
                  <h6 className="text-lg mb-8">No items found</h6>
                  <p className="text-gray-500 mb-12">Try adjusting your filters or search query.</p>
                  <button type="button" onClick={handleResetFilters} className="default-btn btn btn-main d-inline-flex align-items-center rounded-pill gap-8">
                    Reset filters
                  </button>
                </div>
              )}
              {Array.isArray(books) && books.length > 0 && books.map((item) => {
                const title =
                  item?.name || "Instax Mini 12 Instant Film Camera - Green";
                const imgSrc =
                  item?.picture ||
                  "assets/images/thumbs/trending-three-img1.png";
                const percentage =
                  typeof item?.percentage === "number"
                    ? `-${item.percentage}%`
                    : "-29%";
                const hasDiscount = !!item?.discount_price;
                const priceCurrent =
                  item?.discount_price || item?.price || "$14.99";
                const priceOld = hasDiscount ? item?.price : "$28.99";

                return (
                  <div
                    key={item.id}
                    className="product-card h-100 p-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2"
                  >
                    <div className="product-card__thumb rounded-8 bg-gray-50 position-relative">
                      <Link
                        href="/product-details-two"
                        className="w-100 h-100 flex-center !bg-transparent
                      "
                      >
                        <img
                          src={imgSrc}
                          alt=""
                          className="img-fluid"
                          style={{
                            maxWidth: "100%",
                            maxHeight: 220,
                            height: "auto",
                            width: "auto",
                            objectFit: "contain",
                          }}
                        />
                      </Link>
                      <div className="position-absolute inset-block-start-0 inset-inline-start-0 mt-16 ms-16 z-1 d-flex flex-column gap-8">
                        <span className="text-main-two-600 w-40 h-40 d-flex justify-content-center align-items-center bg-white rounded-circle shadow-sm text-xs fw-semibold">
                          {percentage}
                        </span>
                        <span className="text-neutral-600 w-40 h-40 d-flex justify-content-center align-items-center bg-white rounded-circle shadow-sm text-xs fw-semibold">
                          HOT
                        </span>
                      </div>
                      <div className="group bg-white p-2 rounded-pill z-1 position-absolute inset-inline-end-0 inset-block-start-0 me-16 mt-16 shadow-sm">
                        <button
                          type="button"
                          className="expand-btn w-40 h-40 text-md d-flex justify-content-center align-items-center rounded-circle hover-bg-main-two-600 hover-text-white"
                        >
                          <i className="ph ph-plus" />
                        </button>
                        <div className="expand-icons gap-20 my-20">
                          <button
                            type="button"
                            className="text-neutral-600 text-xl flex-center hover-text-main-two-600 wishlist-btn"
                          >
                            <i className="ph ph-heart" />
                          </button>
                          <button
                            type="button"
                            className="text-neutral-600 text-xl flex-center hover-text-main-two-600"
                          >
                            <i className="ph ph-eye" />
                          </button>
                          <button
                            type="button"
                            className="text-neutral-600 text-xl flex-center hover-text-main-two-600"
                          >
                            <i className="ph ph-shuffle" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="product-card__content mt-16 w-100">
                      <h6 className="title text-lg fw-semibold my-16">
                        <Link
                          href="/product-details-two"
                          className="link text-line-2"
                          tabIndex={0}
                        >
                          {title}
                        </Link>
                      </h6>
                      <div className="flex-align gap-6">
                        <div className="flex-align gap-8">
                          <span className="text-15 fw-medium text-warning-600 d-flex">
                            <i className="ph-fill ph-star" />
                          </span>
                          <span className="text-15 fw-medium text-warning-600 d-flex">
                            <i className="ph-fill ph-star" />
                          </span>
                          <span className="text-15 fw-medium text-warning-600 d-flex">
                            <i className="ph-fill ph-star" />
                          </span>
                          <span className="text-15 fw-medium text-warning-600 d-flex">
                            <i className="ph-fill ph-star" />
                          </span>
                          <span className="text-15 fw-medium text-warning-600 d-flex">
                            <i className="ph-fill ph-star" />
                          </span>
                        </div>
                        <span className="text-xs fw-medium text-gray-500">
                          4.8
                        </span>
                        <span className="text-xs fw-medium text-gray-500">
                          (12K)
                        </span>
                      </div>
                      <span className="py-2 px-8 text-xs rounded-pill text-main-two-600 bg-main-two-50 mt-16">
                        Fulfilled by Marketpro
                      </span>
                      <div className="product-card__price mt-16 mb-30">
                        <span className="text-gray-400 text-md fw-semibold text-decoration-line-through">
                          {priceOld}
                        </span>
                        <span className="text-heading text-md fw-semibold ">
                          {priceCurrent}{" "}
                          <span className="text-gray-500 fw-normal">/Qty</span>{" "}
                        </span>
                      </div>
                      <Link
                        href="/cart"
                        className="product-card__cart btn bg-gray-50 text-heading hover-bg-main-600 hover-text-white py-11 px-24 rounded-8 flex-center gap-8 fw-medium"
                        tabIndex={0}
                      >
                        Batafsil ko'rish
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Products End */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VendorTwoDetails;
