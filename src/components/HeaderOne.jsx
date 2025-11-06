"use client";
import React, { useEffect, useState } from "react";
import { isAuthenticated, logoutUser, getAuthToken } from "@/services/auth";
import { getBookCategories } from "@/services/categories";
import { getRegions } from "@/services/regions";
import CategoryDropdown from "./CategoryDropdown";
import MaterialCategoryDropdown from "./MaterialCategoryDropdown";
import MaterialLocationDropdown from "./MaterialLocationDropdown";
import { useTranslations } from "next-intl";
 
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
const HeaderOne = () => {
  let pathname = usePathname();
  const router = useRouter();
  const [scroll, setScroll] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const tHeader = useTranslations("Header");
  const tCategories = useTranslations("Categories");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLocationDropdown && !event.target.closest(".location-dropdown")) {
        setShowLocationDropdown(false);
      }
    };

    if (showLocationDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLocationDropdown]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        setScroll(window.pageYOffset > 150);
      };

      // Check authentication status
      const checkAuth = () => {
        const authenticated = isAuthenticated();
        const token = getAuthToken();
        setIsLoggedIn(authenticated);
        setUserToken(token);
      };

      checkAuth();

      // Attach the scroll event listener
      window.addEventListener("scroll", handleScroll);

      // Initialize Select2 safely (dynamic import to ensure plugin is loaded)
      let $instance = null;
      (async () => {
        try {
          const $ = (await import("jquery")).default;
          if (!window.jQuery) {
            window.jQuery = $;
            window.$ = $;
          }
          await import("select2");
          const $el = $(".js-example-basic-single");
          if ($el.length && typeof $el.select2 === "function") {
            $el.select2();
            $instance = $el;
          }
        } catch (e) {
          console.error("Select2 init error:", e);
        }
      })();

      // Cleanup function
      return () => {
        // Remove the scroll event listener
        window.removeEventListener("scroll", handleScroll);

        // Destroy Select2 instance if it exists
        if ($instance && $instance.length && $instance.data("select2")) {
          $instance.select2("destroy");
        }
      };
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, regionsRes] = await Promise.all([
          getBookCategories({ limit: 20 }),
          getRegions({ limit: 50 }),
        ]);
        setCategories(categoriesRes.categories || []);
        setRegions(regionsRes.regions || []);
      } catch (err) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err);
      }
    };

    fetchData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsLoggedIn(false);
      setUserToken(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      setIsLoggedIn(false);
      setUserToken(null);
      router.push("/login");
    }
  };

  // Mobile menu control support
  const [menuActive, setMenuActive] = useState(false);
  const handleMenuToggle = () => {
    setMenuActive(!menuActive);
  };

  // Search control support
  const [activeSearch, setActiveSearch] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  const handleSearchToggle = () => {
    setActiveSearch(!activeSearch);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setActiveSearch(false);
    }
  };

  return (
    <>
      <div className="overlay" />
      <div className={`side-overlay ${menuActive && "show"}`} />
      {/* ==================== Search Box Start Here ==================== */}
      <form
        onSubmit={handleSearch}
        className={`search-box ${activeSearch && "active"}`}
      >
        <button
          onClick={handleSearchToggle}
          type="button"
          className="search-box__close position-absolute inset-block-start-0 inset-inline-end-0 m-16 w-48 h-48 border border-gray-100 rounded-circle flex-center text-white hover-text-gray-800 hover-bg-white text-2xl transition-1"
        >
          <i className="ph ph-x" />
        </button>
        <div className="container">
          <div className="position-relative">
            <input
              type="text"
              className="form-control py-16 px-24 text-xl rounded-pill pe-64"
              placeholder={tHeader('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="w-48 h-48 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8"
            >
              <i className="ph ph-magnifying-glass" />
            </button>
          </div>
        </div>
      </form>
      {/* ==================== Search Box End Here ==================== */}
      {/* ==================== Mobile Menu Start Here ==================== */}
      <div
        className={`mobile-menu scroll-sm d-lg-none d-block ${
          menuActive && "active"
        }`}
      >
        <div className="container container-lg">
          <div className="mobile-menu__wrapper">
            <div className="mobile-menu__header d-flex justify-content-between align-items-center">
              <div className="mobile-menu__logo">
                <Link href="/" className="link">
                  <img src="assets/images/logo1.png" alt="Logo" />
                </Link>
              </div>
              <button
                onClick={handleMenuToggle}
                className="mobile-menu__close d-flex flex-center"
              >
                <i className="ph ph-x text-2xl" />
              </button>
            </div>
            <div className="mobile-menu__content">
              <ul className="mobile-menu__list">
                <li className="mobile-menu__item">
                  <Link href="/" className="mobile-menu__link">
                    {tHeader('home')}
                  </Link>
                </li>
                <li className="mobile-menu__item">
                  <Link href="/shop" className="mobile-menu__link">
                    {tHeader('shop')}
                  </Link>
                </li>
                <li className="mobile-menu__item">
                  <Link href="/blog" className="mobile-menu__link">
                    {tHeader('blog')}
                  </Link>
                </li>
                <li className="mobile-menu__item">
                  <Link href="/contact" className="mobile-menu__link">
                    {tHeader('contact')}
                  </Link>
                </li>
                {isLoggedIn ? (
                  <>
                    <li className="mobile-menu__item">
                      <Link href="/account" className="mobile-menu__link">
                        {tHeader('myAccount')}
                      </Link>
                    </li>
                    <li className="mobile-menu__item">
                      <button
                        onClick={handleLogout}
                        className="mobile-menu__link w-100 text-start"
                      >
                        Chiqish
                      </button>
                    </li>
                  </>
                ) : (
                  <li className="mobile-menu__item">
                    <Link href="/login" className="mobile-menu__link">
                      {tHeader('login')}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* ==================== Mobile Menu End Here ==================== */}
      {/* ======================= Top Header Start ========================= */}
      <div className="top-header bg-main-600 py-8 d-none d-lg-block">
        <div className="container container-lg">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="top-header__left flex-align gap-16">
                <div className="flex-align gap-8">
                  <i className="ph ph-phone text-white text-sm" />
                  <a
                    href="tel:+00123456789"
                    className="text-white text-sm hover-text-main-200"
                  >
                    +00 123 456 789
                  </a>
                </div>
                <div className="flex-align gap-8">
                  <i className="ph ph-envelope text-white text-sm" />
                  <a
                    href="mailto:support24@marketpro.com"
                    className="text-white text-sm hover-text-main-200"
                  >
                    support24@marketpro.com
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="top-header__right flex-align justify-content-end gap-16">
                <div className="flex-align gap-8">
                  <i className="ph ph-truck text-white text-sm" />
                  <span className="text-white text-sm">
                    {tHeader('freeShipping')}
                  </span>
                </div>
                <div className="flex-align gap-8">
                  <i className="ph ph-clock text-white text-sm" />
                  <span className="text-white text-sm">
                    {tHeader('workHours')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ======================= Top Header End ========================= */}
      {/* ======================= Middle Header Start ========================= */}
      <div className="middle-header d-none d-lg-block">
        <div className="container container-lg">
          <div className="row align-items-center">
            <div className="col-lg-3">
              <div className="logo">
                <Link href="/" className="link">
                  <img src="assets/images/logo1.png" alt="Logo" />
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    router.push(
                      `/vendor-two?search=${encodeURIComponent(
                        searchQuery.trim()
                      )}`
                    );
                  }
                }}
                className="flex-align flex-wrap form-location-wrapper"
                style={{ overflow: "visible" }}
              >
                <div
                  className="search-category d-flex h-48 select-border-end-0 radius-end-0 search-form d-sm-flex d-none position-relative"
                  style={{ overflow: "visible" }}
                >
                  <MaterialLocationDropdown />
                </div>
                <div className="search-form__wrapper position-relative">
                  <input
                    type="text"
                    className="search-form__input common-input py-13 ps-16 pe-18 rounded-end-pill pe-44"
                    placeholder={tHeader('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="w-32 h-32 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8"
                  >
                    <i className="ph ph-magnifying-glass" />
                  </button>
                </div>
              </form>
            </div>
            <div className="col-lg-3">
              <div className="middle-header__right flex-align justify-content-end gap-16">
                <div className="flex-align gap-8">
                  <i className="ph ph-headset text-main-600 text-2xl" />
                  <div>
                    <div className="text-sm text-gray-500">
                      {tHeader('customerService')}
                    </div>
                    <div className="fw-semibold text-gray-900">
                      +00 123 456 789
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ======================= Middle Header End ========================= */}
      {/* ==================== Header Start Here ==================== */}
      <header
        className={`header bg-white border-bottom border-gray-100 ${
          scroll && "fixed-header"
        }`}
      >
        <div className="container container-lg">
          <nav className="header-inner d-flex justify-content-between gap-8">
            <div className="flex-align menu-category-wrapper z-30">
              {/* Material UI Category Dropdown Start */}
              <MaterialCategoryDropdown />
              {/* Material UI Category Dropdown End  */}
            </div>
            {/* Menu Start  */}
            <div className="header-menu d-lg-block d-none">
              {/* Nav Menu Start */}
              <ul className="nav-menu flex-align ">
                <li className="on-hover-item nav-menu__item has-submenu">
                  <Link href="/" className="nav-menu__link">
                    {tHeader('shop')}
                  </Link>
                  <ul className="on-hover-dropdown common-dropdown nav-submenu scroll-sm">
                    <li className="common-dropdown__item nav-submenu__item">
                      <Link
                        href="/vendor-two?is_used=false"
                        className="common-dropdown__link nav-submenu__link"
                      >
                        {tCategories('newBooks')}
                      </Link>
                    </li>
                    <li className="common-dropdown__item nav-submenu__item">
                      <Link
                        href="/vendor-two?is_used=true"
                        className="common-dropdown__link nav-submenu__link"
                      >
                        {tCategories('likeNewBooks')}
                      </Link>
                    </li>
                    <li className="common-dropdown__item nav-submenu__item">
                      <Link
                        href="/vendor-two?type=gift"
                        className="common-dropdown__link nav-submenu__link"
                      >
                        {tCategories('giftBooks')}
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-menu__item">
                  <Link href="/vendor" className="nav-menu__link">
                    {tHeader('shops')}
                  </Link>
                </li>
                <li className="nav-menu__item">
                  <Link href="/become-seller" className="nav-menu__link">
                    {tHeader('becomeSeller')}
                  </Link>
                </li>
                <li className="nav-menu__item">
                  <Link href="/contact" className="nav-menu__link">
                    {tHeader('contact')}
                  </Link>
                </li>
              </ul>
              {/* Nav Menu End */}
            </div>
            {/* Menu End  */}
            {/* Right Side Start */}
            <div className="header-right flex-align gap-16">
              {/* Search Icon Start */}
              <button
                onClick={handleSearchToggle}
                className="search-icon flex-align d-lg-none d-flex gap-4 item-hover"
              >
                <i className="ph ph-magnifying-glass text-2xl" />
              </button>
              {/* Search Icon End */}
              {/* Wishlist Icon Start */}
              <Link
                href="/wishlist"
                className="wishlist-icon flex-align gap-4 item-hover"
              >
                <i className="ph ph-heart text-2xl" />
                <span className="wishlist-count bg-main-600 text-white rounded-circle flex-center">
                  0
                </span>
              </Link>
              {/* Wishlist Icon End */}
              <LanguageSwitcher />
              {/* User Icon Start */}
              {isLoggedIn ? (
                <div className="dropdown">
                  <Link
                    href="#"
                    className="user-icon flex-align gap-4 item-hover dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ph ph-user text-2xl" />
                    <span className="d-none d-sm-block">{tHeader('myAccount')}</span>
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <Link href="/account" className="dropdown-item">
                        <i className="ph ph-user me-8"></i>
                        {tHeader('profile')}
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item">
                        <i className="ph ph-sign-out me-8"></i>
                        {tHeader('logout')}
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="user-icon flex-align gap-4 item-hover"
                >
                  <i className="ph ph-user text-2xl" />
                  <span className="d-none d-sm-block">{tHeader('login')}</span>
                </Link>
              )}
              {/* User Icon End */}
              {/* Mobile Menu Toggle Start */}
              <button
                onClick={handleMenuToggle}
                className="mobile-menu-toggle d-lg-none d-flex flex-center"
              >
                <i className="ph ph-list text-2xl" />
              </button>
              {/* Mobile Menu Toggle End */}
            </div>
            {/* Right Side End */}
          </nav>
        </div>
      </header>
      {/* ==================== Header End Here ==================== */}

      <style jsx>{`
        .form-location-wrapper {
          overflow: visible !important;
        }

        .search-category {
          overflow: visible !important;
        }

        .location-dropdown {
          position: relative;
          overflow: visible !important;
        }

        .location-dropdown__menu {
          border-radius: 8px;
        }

        .location-dropdown__button:hover {
          background-color: #f8f9fa;
        }

        .submenus-submenu {
          border-radius: 8px;
        }

        /* Material UI Menu Overrides */
        .MuiMenu-paper {
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
        }

        .MuiMenuItem-root {
          border-radius: 8px !important;
          margin: 2px 8px !important;
        }

        .MuiMenuItem-root:hover {
          background-color: #f5f5f5 !important;
        }

        .MuiButton-root {
          text-transform: none !important;
          border-radius: 8px !important;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default HeaderOne;
