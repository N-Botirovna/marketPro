import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getBookCategories } from "@/services/categories";

const VendorTwoSideBar = ({ shop, onCategorySelect }) => {
  const starNumber = Math.max(
    0,
    Math.min(5, Math.floor(parseFloat(shop?.star) || 0))
  );
  const stars = Array.from({ length: 5 }, (_, i) => i < starNumber);
  const address =
    shop?.location_text ||
    [shop?.region?.name, shop?.district?.name].filter(Boolean).join(", ");

  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  useEffect(() => {
    getBookCategories()
      .then((res) => {
        setCategories(res.categories || []);
      })
      .catch(() => {});
  }, []);

  const handleCategoryClick = (e, id) => {
    e.preventDefault();
    setActiveCategoryId(id);
    if (onCategorySelect) onCategorySelect(id);
  };

  return (
    <div className="d-flex flex-column gap-12 px-lg-0 px-3 py-lg-0 py-4">
      <div className="bg-neutral-600 rounded-8 p-24">
        <div className="d-flex align-items-center justify-content-between">
          <span className="w-80 h-80 flex-center bg-white rounded-8 flex-shrink-0">
            <img
              src={
                shop?.picture || "assets/images/thumbs/vendors-two-icon1.png"
              }
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </span>
          <div className="d-flex flex-column gap-24">
            <button
              type="button"
              className="text-uppercase group border border-white px-16 py-8 rounded-pill text-white text-sm hover-bg-main-two-600 hover-text-white hover-border-main-two-600 transition-2 flex-center gap-8 w-100"
            >
              FOLLOW
              <span className="text-xl d-flex text-main-two-600 group-item-white transition-2">
                {" "}
                <i className="ph ph-storefront" />
              </span>
            </button>
            <button
              type="button"
              className="text-uppercase group border border-white px-16 py-8 rounded-pill text-white text-sm hover-bg-main-two-600 hover-text-white hover-border-main-two-600 transition-2 flex-center gap-8 w-100"
            >
              Chat Now
              <span className="text-xl d-flex text-main-two-600 group-item-white transition-2">
                {" "}
                <i className="ph ph-storefront" />
              </span>
            </button>
          </div>
        </div>
        <div className="mt-32">
          <h6 className="text-white fw-semibold mb-12">
            <Link href="/vendor-two-details" className="">
              {shop?.name || "Baishakhi Plus"}
            </Link>
          </h6>
          <span className="text-xs text-white mb-12">
            {typeof shop?.book_count !== "undefined" && (
              <span className="text-xs fw-medium text-white">
                {shop.book_count} Books
              </span>
            )}
          </span>
          <div className="flex-align gap-6">
            <div className="flex-align gap-8">
              {stars.map((filled, idx) => (
                <span
                  key={idx}
                  className="text-15 fw-medium text-warning-600 d-flex"
                >
                  <i className={filled ? "ph-fill ph-star" : "ph ph-star"} />
                </span>
              ))}
            </div>
            <span className="text-xs fw-medium text-white">
              {shop?.star || "0.0"}
            </span>
          </div>
          {shop?.bio && (
            <p className="text-white mt-16 mb-0" style={{ opacity: 0.9 }}>
              {shop.bio}
            </p>
          )}
          {(address || shop?.phone_number) && (
            <div className="mt-16 d-flex flex-column gap-6">
              {address && (
                <div
                  className="text-white d-flex gap-8 align-items-center"
                  style={{ opacity: 0.9 }}
                >
                  <i className="ph ph-map-pin" />
                  <span className="text-sm">{address}</span>
                </div>
              )}
              {shop?.phone_number && (
                <div
                  className="text-white d-flex gap-8 align-items-center"
                  style={{ opacity: 0.9 }}
                >
                  <i className="ph ph-phone" />
                  <span className="text-sm">{shop.phone_number}</span>
                </div>
              )}
            </div>
          )}
          {(shop?.working_days || shop?.working_hours) && (
            <div className="mt-12 text-white" style={{ opacity: 0.9 }}>
              <div className="d-flex gap-8 align-items-center">
                <i className="ph ph-clock" />
                <span className="text-sm">
                  {shop?.working_days || "Working Days"}
                  {shop?.working_hours ? ` • ${shop.working_hours}` : ""}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-32 d-flex flex-column gap-8">
          <Link
            href="#"
            className="px-16 py-12 border text-white border-neutral-500 w-100 rounded-4 hover-bg-main-600 hover-border-main-600"
          >
            About Store
          </Link>
          <Link
            href="#"
            className="px-16 py-12 border text-white border-neutral-500 w-100 rounded-4 hover-bg-main-600 hover-border-main-600"
          >
            Products
          </Link>
          <Link
            href="#"
            className="px-16 py-12 border text-white border-neutral-500 w-100 rounded-4 hover-bg-main-600 hover-border-main-600"
          >
            Contact Seller
          </Link>
        </div>
      </div>
      <div className="border border-gray-50 rounded-8 p-24">
        <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
          Product Category
        </h6>
        <ul className="max-h-540 overflow-y-auto scroll-sm">
          {categories.map((cat) => (
            <li key={cat.id} className="mb-24">
              <a
                href="#"
                onClick={(e) => handleCategoryClick(e, cat.id)}
                className={`text-gray-900 hover-text-main-600 ${activeCategoryId === cat.id ? "text-main-600" : ""}`}
              >
                {cat.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VendorTwoSideBar;
