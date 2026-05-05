"use client";
import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { getBookCategories } from "@/services/categories";
import { useTranslations } from "next-intl";

const MaterialCategoryDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(false);
  const [loading, setLoading] = useState(true);
  const tCat = useTranslations("Categories");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getBookCategories({ limit: 20 });
        setCategories(res.categories || []);
      } catch (error) {
        console.error("Kategoriya ma'lumotlarini olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="category on-hover-item">
        <button
          type="button"
          className="category__button flex-align gap-8 fw-medium p-16 border-end border-start border-gray-100 text-heading"
          disabled
        >
          <span className="icon text-2xl d-xs-flex d-none">
            <i className="ph ph-dots-nine" />
          </span>
          Yuklanmoqda...
        </button>
      </div>
    );
  }

  return (
    <div className="category on-hover-item">
      <button
        onClick={() => setActiveCategory((prev) => !prev)}
        type="button"
        className="category__button flex-align gap-8 fw-medium p-16 border-end border-start border-gray-100 text-heading"
      >
        <span className="icon text-2xl d-xs-flex d-none">
          <i className="ph ph-dots-nine" />
        </span>
        <span className="d-sm-flex d-none">{tCat("allCat")}</span>
        <span className="arrow-icon text-xl d-flex">
          <i className="ph ph-caret-down" />
        </span>
      </button>

      <div
        className={`responsive-dropdown cat on-hover-dropdown common-dropdown nav-submenu p-0 submenus-submenu-wrapper ${
          activeCategory ? "active" : ""
        }`}
        style={{
          zIndex: 99999,
          display: activeCategory ? "block" : undefined,
        }}
      >
        <button
          onClick={() => {
            setActiveCategory(false);
            setActiveIndexCat(null);
          }}
          type="button"
          className="close-responsive-dropdown rounded-circle text-xl position-absolute inset-inline-end-0 inset-block-start-0 mt-4 me-8 d-lg-none d-flex"
        >
          <i className="ph ph-x" />
        </button>

        <div className="logo px-16 d-lg-none d-block">
          <Link href="/" className="link">
            <img src="/assets/images/logo1.png" alt="Logo" />
          </Link>
        </div>

        <ul className="scroll-sm p-0 py-8 w-300 max-h-400 overflow-y-auto" style={{ listStyle: "none" }}>
          {categories.map((cat) => (
            <li key={cat.id} className="has-submenus-submenu">
              <Link
                href={`/vendor-two?category=${encodeURIComponent(cat.name)}`}
                className="common-dropdown__link nav-submenu__link flex-align gap-8"
                onClick={() => setActiveCategory(false)}
              >
                {cat.picture ? (
                  <img
                    src={cat.picture}
                    alt={cat.name}
                    className="w-20 h-20 object-contain rounded-4"
                  />
                ) : (
                  <span className="text-xl d-flex">
                    <i className="ph ph-book" />
                  </span>
                )}
                {cat.name}
                {cat.subcategories?.length > 0 && (
                  <span className="icon text-md d-flex ms-auto">
                    <i className="ph ph-caret-right" />
                  </span>
                )}
              </Link>

              {cat.subcategories?.length > 0 && (
                <div className="submenus-submenu py-16">
                  <h6 className="text-sm px-16 submenus-submenu__title mb-8 fw-semibold">
                    {cat.name}
                  </h6>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {cat.subcategories.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={`/vendor-two?subcategory=${sub.id}`}
                          className="common-dropdown__link nav-submenu__link"
                          onClick={() => setActiveCategory(false)}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MaterialCategoryDropdown;
