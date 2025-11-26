"use client";
import { Link } from "@/i18n/navigation";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getBookCategories } from "@/services/categories";
import { useToast } from "./Toast";

const VendorTwoSideBar = ({ shop, onCategorySelect }) => {
  const tVendor = useTranslations("VendorTwoSideBar");
  const { showToast, ToastContainer } = useToast();
  
  // Address ma'lumotlarini to'g'ri formatlash
  const addressParts = [];
  if (shop?.region?.name) addressParts.push(shop.region.name);
  if (shop?.district?.name) addressParts.push(shop.district.name);
  if (shop?.location_text) addressParts.push(shop.location_text);
  const address = addressParts.length > 0 ? addressParts.join(", ") : null;

  // Linklarni tayyorlash va formatlash
  const formatUrl = (url, type) => {
    if (!url) return null;
    
    // Agar URL allaqachon http:// yoki https:// bilan boshlansa, qaytaradi
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Telegram uchun
    if (type === 'telegram') {
      // Agar @ bilan boshlansa yoki faqat username bo'lsa
      const username = url.replace('@', '').trim();
      return `https://t.me/${username}`;
    }
    
    // Instagram uchun
    if (type === 'instagram') {
      // Agar @ bilan boshlansa yoki faqat username bo'lsa
      const username = url.replace('@', '').trim();
      return `https://instagram.com/${username}`;
    }
    
    // Boshqa holatlar uchun
    return url;
  };

  const websiteUrl = shop?.website ? formatUrl(shop.website, 'website') : null;
  const phoneUrl = shop?.phone_number ? `tel:${shop.phone_number}` : null;
  const instagramUrl = shop?.instagram ? formatUrl(shop.instagram, 'instagram') : null;
  const telegramUrl = shop?.telegram ? formatUrl(shop.telegram, 'telegram') : null;

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

  const handleLinkClick = (e, url, type) => {
    if (!url) {
      e.preventDefault();
      let message = "";
      switch (type) {
        case "instagram":
          message = tVendor("instagramNotAvailable");
          break;
        case "telegram":
          message = tVendor("telegramNotAvailable");
          break;
        case "website":
          message = tVendor("websiteNotAvailable");
          break;
        case "phone":
          message = tVendor("phoneNotAvailable");
          break;
        default:
          message = tVendor("infoNotAvailable");
      }
      showToast({
        type: "info",
        title: tVendor("infoTitle"),
        message: message,
        duration: 3000,
      });
      return;
    }
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
            <a
              href={instagramUrl || "#"}
              target={instagramUrl ? "_blank" : undefined}
              rel={instagramUrl ? "noopener noreferrer" : undefined}
              className="text-uppercase group border border-white px-16 py-8 rounded-pill text-white text-sm hover-bg-main-two-600 hover-text-white hover-border-main-two-600 transition-2 flex-center gap-8 w-100 text-decoration-none"
              onClick={(e) => handleLinkClick(e, instagramUrl, "instagram")}
            >
              {tVendor("follow")}
              <span className="text-xl d-flex text-main-two-600 group-item-white transition-2">
                <i className="ph ph-instagram-logo" />
              </span>
            </a>
            <a
              href={telegramUrl || "#"}
              target={telegramUrl ? "_blank" : undefined}
              rel={telegramUrl ? "noopener noreferrer" : undefined}
              className="text-uppercase group border border-white px-16 py-8 rounded-pill text-white text-sm hover-bg-main-two-600 hover-text-white hover-border-main-two-600 transition-2 flex-center gap-8 w-100 text-decoration-none"
              onClick={(e) => handleLinkClick(e, telegramUrl, "telegram")}
            >
              {tVendor("sendMessage")}
              <span className="text-xl d-flex text-main-two-600 group-item-white transition-2">
                <i className="ph ph-paper-plane-tilt" />
              </span>
            </a>
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
                {shop.book_count} {tVendor("booksCount")}
              </span>
            )}
          </span>
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
                  {shop?.working_days || tVendor("workingDays")}
                  {shop?.working_hours ? ` • ${shop.working_hours}` : ""}
                  {shop?.lunch ? ` • ${tVendor("lunch")}: ${shop.lunch}` : ""}
                </span>
              </div>
            </div>
          )}
          {shop?.has_post_service && (
            <div className="mt-8 text-white" style={{ opacity: 0.9 }}>
              <div className="d-flex gap-8 align-items-center">
                <i className="ph ph-package" />
                <span className="text-sm">{tVendor("postService")}</span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-32 d-flex flex-column gap-8">
          <a
            href={websiteUrl || "#"}
            target={websiteUrl ? "_blank" : undefined}
            rel={websiteUrl ? "noopener noreferrer" : undefined}
            className="px-16 py-12 border text-white border-neutral-500 w-100 rounded-4 hover-bg-main-600 hover-border-main-600 text-decoration-none text-center"
            onClick={(e) => handleLinkClick(e, websiteUrl, "website")}
          >
            {tVendor("aboutShop")}
          </a>
          <Link
            href="#"
            className="px-16 py-12 border text-white border-neutral-500 w-100 rounded-4 hover-bg-main-600 hover-border-main-600 text-decoration-none text-center"
            onClick={(e) => {
              e.preventDefault();
              // Scroll to products section
              const productsSection = document.querySelector('.vendor-two-details__contents');
              if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            {tVendor("products")}
          </Link>
          <a
            href={phoneUrl || "#"}
            className="px-16 py-12 border text-white border-neutral-500 w-100 rounded-4 hover-bg-main-600 hover-border-main-600 text-decoration-none text-center"
            onClick={(e) => handleLinkClick(e, phoneUrl, "phone")}
          >
            {tVendor("contactSeller")}
          </a>
        </div>
      </div>
      <div className="border border-gray-50 rounded-8 p-24">
        <h6 className="text-xl border-bottom border-gray-100 pb-24 mb-24">
          {tVendor("productCategory")}
        </h6>
        <ul className="max-h-540 overflow-y-auto scroll-sm">
          {categories.map((cat) => (
            <li key={cat.id} className="mb-24">
              <a
                href="#"
                onClick={(e) => handleCategoryClick(e, cat.id)}
                className={`text-gray-900 hover-text-main-600 ${
                  activeCategoryId === cat.id ? "text-main-600" : ""
                }`}
              >
                {cat.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <ToastContainer />
    </div>
  );
};

export default VendorTwoSideBar;
