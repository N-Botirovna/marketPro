"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getBookCategories, getBookSubcategories } from "@/services/categories";

const CategoryDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [activeIndexCat, setActiveIndexCat] = useState(null);
  const [activeCategory, setActiveCategory] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleCategoryToggle = () => {
    setActiveCategory((prev) => !prev);
  };

  const handleCatClick = (index) => {
    setActiveIndexCat((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await getBookCategories({ limit: 20 });
        setCategories(categoriesRes.categories || []);
        console.log("Categories response:", categoriesRes);

        // Fetch subcategories
        const subcategoriesRes = await getBookSubcategories({ limit: 50 });
        setSubcategories(subcategoriesRes.subcategories || []);
        console.log("Subcategories response:", subcategoriesRes);
        
      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
          Loading...
        </button>
      </div>
    );
  }

  return (
    <div className="category on-hover-item">
      <button
        onClick={handleCategoryToggle}
        type="button"
        className="category__button flex-align gap-8 fw-medium p-16 border-end border-start border-gray-100 text-heading"
      >
        <span className="icon text-2xl d-xs-flex d-none">
          <i className="ph ph-dots-nine" />
        </span>
        <span className="d-sm-flex d-none">All</span> Categories
        <span className="arrow-icon text-xl d-flex">
          <i className="ph ph-caret-down" />
        </span>
      </button>

      <div
        className={`responsive-dropdown cat on-hover-dropdown common-dropdown nav-submenu p-0 submenus-submenu-wrapper ${
          activeCategory ? "active" : ""
        }`}
      >
        {/* Close btn (mobil uchun) */}
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

        {/* Logo (mobil) */}
        <div className="logo px-16 d-lg-none d-block">
          <Link href="/" className="link">
            <img src="assets/images/logo/logo.png" alt="Logo" />
          </Link>
        </div>

        <ul className="scroll-sm p-0 py-8 w-300 max-h-400 overflow-y-auto">
          {categories.map((cat, index) => (
            <li
              key={cat.id}
              onClick={() => handleCatClick(index)}
              className={`has-submenus-submenu ${
                activeIndexCat === index ? "active" : ""
              }`}
            >
              <Link
                href="#"
                className="text-gray-500 text-15 py-12 px-16 flex-align gap-8 rounded-0"
                onClick={() => setActiveIndexCat(null)}
              >
                {/* Icon o‘rniga picture */}
                {cat.picture ? (
                  <img
                    src={cat.picture}
                    alt={cat.name}
                    className="w-20 h-20 object-contain"
                  />
                ) : (
                  <span className="text-xl d-flex">
                    <i className="ph ph-book" />
                  </span>
                )}

                <span>{cat.name}</span>

                {subcategories.filter(sub => sub.category === cat.id).length > 0 && (
                  <span className="icon text-md d-flex ms-auto">
                    <i className="ph ph-caret-right" />
                  </span>
                )}
              </Link>

              {subcategories.filter(sub => sub.category === cat.id).length > 0 && (
                <div
                  className={`submenus-submenu py-16 ${
                    activeIndexCat === index ? "open" : ""
                  }`}
                >
                  <h6 className="text-lg px-16 submenus-submenu__title">
                    {cat.name}
                  </h6>
                  <ul className="submenus-submenu__list max-h-300 overflow-y-auto scroll-sm">
                    {subcategories
                      .filter(sub => sub.category === cat.id)
                      .map((sub) => (
                        <li key={sub.id}>
                          <Link href={`/shop?subcategory=${sub.id}`}>
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
