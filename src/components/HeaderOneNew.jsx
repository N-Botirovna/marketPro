"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, logoutUser, getAuthToken } from "@/services/auth";
import CategoryDropdown from "./CategoryDropdown";

import query from "jquery";
const HeaderOne = () => {
  let pathname = usePathname();
  const router = useRouter();
  const [scroll, setScroll] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState(null);
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

      // Initialize Select2
      const selectElement = query(".js-example-basic-single");
      selectElement.select2();

      // Cleanup function
      return () => {
        // Remove the scroll event listener
        window.removeEventListener("scroll", handleScroll);

        // Destroy Select2 instance if it exists
        if (selectElement.data("select2")) {
          selectElement.select2("destroy");
        }
      };
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsLoggedIn(false);
      setUserToken(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setIsLoggedIn(false);
      setUserToken(null);
      router.push('/login');
    }
  };

  // Menu control support
  const [menuActive, setMenuActive] = useState(false);
  const handleMenuToggle = () => {
    setMenuActive(!menuActive);
  };

  // Search control support
  const [activeSearch, setActiveSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // category control support
  const [activeCategory, setActiveCategory] = useState(false);
  const handleCategoryToggle = () => {
    setActiveCategory(!activeCategory);
  };

  // submenu control support
  const [activeIndex, setActiveIndex] = useState(null);
  const handleClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // submenu control support
  const [activeIndexCat, setActiveIndexCat] = useState(null);
  const handleCatClick = (index) => {
    setActiveIndexCat(activeIndexCat === index ? null : index);
  };

  return (
    <>
      <div className='overlay' />
      <div
        className={`side-overlay ${(menuActive || activeCategory) && "show"}`}
      />
      {/* ==================== Search Box Start Here ==================== */}
      <form onSubmit={handleSearch} className={`search-box ${activeSearch && "active"}`}>
        <button
          onClick={handleSearchToggle}
          type='button'
          className='search-box__close position-absolute inset-block-start-0 inset-inline-end-0 m-16 w-48 h-48 border border-gray-100 rounded-circle flex-center text-white hover-text-gray-800 hover-bg-white text-2xl transition-1'
        >
          <i className='ph ph-x' />
        </button>
        <div className='container'>
          <div className='position-relative'>
            <input
              type='text'
              className='form-control py-16 px-24 text-xl rounded-pill pe-64'
              placeholder='Kitob nomi, muallif yoki kalit so\'z qidiring...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type='submit'
              className='w-48 h-48 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8'
            >
              <i className='ph ph-magnifying-glass' />
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
        <div className='mobile-menu__wrapper'>
          <div className='mobile-menu__header flex-between align-items-center'>
            <div className='mobile-menu__logo'>
              <Link href='/' className='link'>
                <img src='assets/images/logo/logo.png' alt='Logo' />
              </Link>
            </div>
            <button
              onClick={handleMenuToggle}
              type='button'
              className='mobile-menu__close'
            >
              <i className='ph ph-x' />
            </button>
          </div>
          <div className='mobile-menu__body'>
            <ul className='mobile-menu__list'>
              <li className='mobile-menu__item'>
                <Link href='/' className='mobile-menu__link'>
                  Home
                </Link>
              </li>
              <li className='mobile-menu__item'>
                <Link href='/shop' className='mobile-menu__link'>
                  Shop
                </Link>
              </li>
              <li className='mobile-menu__item'>
                <Link href='/contact' className='mobile-menu__link'>
                  Contact
                </Link>
              </li>
              <li className='mobile-menu__item'>
                <Link href='/blog' className='mobile-menu__link'>
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* ==================== Mobile Menu End Here ==================== */}
      {/* ==================== Header Start Here ==================== */}
      <header
        className={`header header-one ${scroll ? "header--sticky" : ""}`}
      >
        <div
          className={`header-top d-lg-block d-none ${
            scroll ? "header-top--sticky" : ""
          }`}
        >
          <div className='container container-lg'>
            <div className='flex-between align-items-center'>
              <div className='flex-align gap-16'>
                <div className='flex-align gap-8'>
                  <i className='ph ph-phone text-main-600' />
                  <a
                    href='tel:+00123456789'
                    className='text-gray-600 hover-text-main-600'
                  >
                    +00 123 456 789
                  </a>
                </div>
                <div className='flex-align gap-8'>
                  <i className='ph ph-envelope text-main-600' />
                  <a
                    href='mailto:support24@marketpro.com'
                    className='text-gray-600 hover-text-main-600'
                  >
                    support24@marketpro.com
                  </a>
                </div>
              </div>
              <div className='flex-align gap-16'>
                <div className='flex-align gap-8'>
                  <i className='ph ph-map-pin text-main-600' />
                  <span className='text-gray-600'>789 Inner Lane, California, USA</span>
                </div>
                <div className='flex-align gap-16'>
                  <Link href='#' className='text-gray-600 hover-text-main-600'>
                    <i className='ph ph-facebook-logo' />
                  </Link>
                  <Link href='#' className='text-gray-600 hover-text-main-600'>
                    <i className='ph ph-twitter-logo' />
                  </Link>
                  <Link href='#' className='text-gray-600 hover-text-main-600'>
                    <i className='ph ph-instagram-logo' />
                  </Link>
                  <Link href='#' className='text-gray-600 hover-text-main-600'>
                    <i className='ph ph-linkedin-logo' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='header-main'>
          <div
            className={`header-main__inner ${
              scroll ? "header-main__inner--sticky" : ""
            }`}
          >
            <div className='container container-lg'>
              <div className='flex-between align-items-center'>
                <div className='header-main__left flex-align gap-24'>
                  <div className='header-main__logo'>
                    <Link href='/' className='link'>
                      <img
                        src='assets/images/logo/logo.png'
                        alt='Logo'
                        className='logo-light'
                      />
                      <img
                        src='assets/images/logo/logo-two-black.png'
                        alt='Logo'
                        className='logo-dark'
                      />
                    </Link>
                  </div>
                  <div className='header-main__search d-lg-block d-none'>
                    <form
                      action='#'
                      className='flex-align flex-wrap form-location-wrapper'
                    >
                      <div className='search-category d-flex h-48 select-border-end-0 radius-end-0 search-form d-sm-flex d-none'>
                        <select
                          defaultValue={1}
                          className='js-example-basic-single border border-gray-200 border-end-0'
                          name='state'
                        >
                          <option value={1}>Barcha kategoriyalar</option>
                          <option value={1}>Dasturlash</option>
                          <option value={1}>Adabiyot</option>
                          <option value={1}>Tarix</option>
                          <option value={1}>Fan</option>
                          <option value={1}>San'at</option>
                        </select>
                        <div className='search-form__wrapper position-relative'>
                          <input
                            type='text'
                            className='search-form__input common-input py-13 ps-16 pe-18 rounded-end-pill pe-44'
                            placeholder='Kitob nomi, muallif yoki kalit so\'z qidiring...'
                          />
                          <button
                            type='submit'
                            className='w-32 h-32 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8'
                          >
                            <i className='ph ph-magnifying-glass' />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div className='header-main__right flex-align gap-16'>
                  <div className='header-main__action flex-align gap-16'>
                    <button
                      onClick={handleSearchToggle}
                      type='button'
                      className='search-icon flex-align d-lg-none d-flex gap-4 item-hover'
                    >
                      <i className='ph ph-magnifying-glass' />
                    </button>
                    <Link
                      href='/wishlist'
                      className='wishlist-icon flex-align d-lg-flex d-none gap-4 item-hover'
                    >
                      <i className='ph ph-heart' />
                      <span className='wishlist-count'>0</span>
                    </Link>
                    <Link
                      href='/cart'
                      className='cart-icon flex-align gap-4 item-hover'
                    >
                      <i className='ph ph-shopping-cart' />
                      <span className='cart-count'>0</span>
                    </Link>
                    <button
                      onClick={handleMenuToggle}
                      type='button'
                      className='menu-icon flex-align d-lg-none d-flex gap-4 item-hover'
                    >
                      <i className='ph ph-list' />
                    </button>
                  </div>
                  <div className='header-main__auth flex-align gap-16'>
                    {isLoggedIn ? (
                      <div className='dropdown'>
                        <button
                          className='btn btn-outline-main dropdown-toggle'
                          type='button'
                          data-bs-toggle='dropdown'
                        >
                          Mening hisobim
                        </button>
                        <ul className='dropdown-menu'>
                          <li>
                            <Link className='dropdown-item' href='/account'>
                              Profil
                            </Link>
                          </li>
                          <li>
                            <button
                              className='dropdown-item'
                              onClick={handleLogout}
                            >
                              Chiqish
                            </button>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <Link href='/login' className='btn btn-outline-main'>
                        Kirish
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`header-bottom d-lg-block d-none ${
            scroll ? "header-bottom--sticky" : ""
          }`}
        >
          <div className='container container-lg'>
            <nav className='header-inner d-flex justify-content-between gap-8'>
              <div className='flex-align menu-category-wrapper'>
                {/* Category Dropdown Start */}
                <CategoryDropdown />
                {/* Category Dropdown End  */}
                {/* Menu Start  */}
                <div className='header-menu d-lg-block d-none'>
                  {/* Nav Menu Start */}
                  <ul className='nav-menu flex-align '>
                    <li className='on-hover-item nav-menu__item has-submenu'>
                      <Link href='/' className='nav-menu__link'>
                        Home
                      </Link>
                    </li>
                    <li className='on-hover-item nav-menu__item has-submenu'>
                      <Link href='/shop' className='nav-menu__link'>
                        Shop
                      </Link>
                    </li>
                    <li className='on-hover-item nav-menu__item has-submenu'>
                      <Link href='/contact' className='nav-menu__link'>
                        Contact
                      </Link>
                    </li>
                    <li className='on-hover-item nav-menu__item has-submenu'>
                      <Link href='/blog' className='nav-menu__link'>
                        Blog
                      </Link>
                    </li>
                  </ul>
                  {/* Nav Menu End */}
                </div>
                {/* Menu End  */}
              </div>
              <div className='flex-align gap-16'>
                <div className='flex-align gap-8'>
                  <i className='ph ph-headset text-main-600' />
                  <span className='text-gray-600'>24/7 Support</span>
                </div>
                <div className='flex-align gap-8'>
                  <i className='ph ph-truck text-main-600' />
                  <span className='text-gray-600'>Free Shipping</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>
      {/* ==================== Header End Here ==================== */}
    </>
  );
};

export default HeaderOne;
