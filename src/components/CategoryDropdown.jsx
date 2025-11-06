"use client";
import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { getBookCategories } from "@/services/categories";

const CategoryDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [activeIndexCat, setActiveIndexCat] = useState(null);
  const [activeCategory, setActiveCategory] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleCategoryToggle = () => {
    setActiveCategory((prev) => !prev);
  };

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
      {/* Tugma */}
      <button
        onClick={handleCategoryToggle}
        type="button"
        className="category__button flex-align gap-8 fw-medium p-16 border-end border-start border-gray-100 text-heading"
      >
        <span className="icon text-2xl d-xs-flex d-none">
          <i className="ph ph-dots-nine" />
        </span>
        <span className="d-sm-flex d-none">Barcha</span> Kategoriyalar
        <span className="arrow-icon text-xl d-flex">
          <i className="ph ph-caret-down" />
        </span>
      </button>

      {/* Dropdown menyu */}
      <div
        className={`responsive-dropdown cat on-hover-dropdown common-dropdown nav-submenu p-0 submenus-submenu-wrapper ${
          activeCategory ? "active" : ""
        }`}
        style={{
          zIndex: 99999,
          display: activeCategory ? "block" : "none",
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
          opacity: activeCategory ? 1 : 0,
          transform: activeCategory ? "translateY(0)" : "translateY(-10px)",
        }}
      >
        {/* Mobil yopish tugmasi */}
        <button
          onClick={() => {
            handleCategoryToggle();
            setActiveIndexCat(null);
          }}
          type="button"
          className="close-responsive-dropdown rounded-circle text-xl position-absolute inset-inline-end-0 inset-block-start-0 mt-4 me-8 d-lg-none d-flex"
        >
          <i className="ph ph-x" />
        </button>

        {/* Mobil logo */}
        <div className="logo px-16 d-lg-none d-block">
          <Link href="/" className="link">
            <img src="/assets/images/logo1.png" alt="Logo" />
          </Link>
        </div>

        {/* Kategoriyalar ro'yxati */}
        <ul className="scroll-sm p-0 py-8 w-300 max-h-400 overflow-y-auto">
          {categories.map((cat, index) => (
            <li
              key={cat.id}
              onMouseEnter={() => setActiveIndexCat(index)}
              onMouseLeave={() => setActiveIndexCat(null)}
              className={`has-submenus-submenu ${
                activeIndexCat === index ? "active" : ""
              }`}
            >
              <div
                className="text-gray-600 text-15 py-12 px-16 flex-align gap-8 cursor-pointer rounded-8 hover:bg-gray-50 transition-all duration-200"
                style={{ transition: "all 0.2s ease" }}
              >
                {cat.picture ? (
                  <img
                    src={cat.picture}
                    alt={cat.name}
                    className="w-20 h-20 object-contain rounded-4"
                  />
                ) : (
                  <span className="text-xl d-flex text-gray-400">
                    <i className="ph ph-book" />
                  </span>
                )}
                <span className="font-medium">{cat.name}</span>
                {cat.subcategories?.length > 0 && (
                  <span className="icon text-md d-flex ms-auto text-gray-400">
                    <i className="ph ph-caret-right" />
                  </span>
                )}
              </div>

              {/* Yon paneldagi subkategoriya */}
              {cat.subcategories?.length > 0 && (
                <div
                  className={`submenus-submenu py-16 ${
                    activeIndexCat === index ? "open" : ""
                  }`}
                  style={{
                    transition: "all 0.3s ease",
                    opacity: activeIndexCat === index ? 1 : 0,
                    transform:
                      activeIndexCat === index
                        ? "translateX(0)"
                        : "translateX(-10px)",
                  }}
                >
                  <h6 className="text-lg px-16 submenus-submenu__title mb-8 font-semibold text-gray-800">
                    {cat.name}
                  </h6>
                  <ul className="submenus-submenu__list max-h-300 overflow-y-auto scroll-sm">
                    {cat.subcategories.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={`/vendor-two?subcategory=${sub.id}`}
                          className="block px-16 py-8 hover:bg-gray-50 rounded-4 transition-all duration-10 text-gray-600 hover:text-gray-800"
                          style={{ transition: "all 0.02s ease" }}
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

export default CategoryDropdown;
