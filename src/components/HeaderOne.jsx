"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, logoutUser, getAuthToken } from "@/services/auth";
import { getBookCategories } from "@/services/categories";
import { getRegions } from "@/services/regions";
import CategoryDropdown from "./CategoryDropdown";

import query from "jquery";
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
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLocationDropdown && !event.target.closest('.location-dropdown')) {
        setShowLocationDropdown(false);
      }
    };
    
    if (showLocationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, regionsRes] = await Promise.all([
          getBookCategories({ limit: 20 }),
          getRegions({ limit: 50 })
        ]);
        setCategories(categoriesRes.categories || []);
        setRegions(regionsRes.regions || []);
      } catch (err) {
        console.error('Ma\'lumotlarni yuklashda xatolik:', err);
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
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setIsLoggedIn(false);
      setUserToken(null);
      router.push('/login');
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
      <div className='overlay' />
      <div
        className={`side-overlay ${menuActive && "show"}`}
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
              placeholder="Kitob nomi, muallif yoki kalit so'z qidiring..."
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
        <div className='container container-lg'>
          <div className='mobile-menu__wrapper'>
            <div className='mobile-menu__header d-flex justify-content-between align-items-center'>
              <div className='mobile-menu__logo'>
                <Link href='/' className='link'>
            <img src='assets/images/logo/logo.png' alt='Logo' />
          </Link>
              </div>
              <button
                onClick={handleMenuToggle}
                className='mobile-menu__close d-flex flex-center'
              >
                <i className='ph ph-x text-2xl' />
              </button>
            </div>
            <div className='mobile-menu__content'>
              <ul className='mobile-menu__list'>
                <li className='mobile-menu__item'>
                  <Link href='/' className='mobile-menu__link'>
                    Bosh sahifa
                    </Link>
                  </li>
                <li className='mobile-menu__item'>
                  <Link href='/shop' className='mobile-menu__link'>
                      Do'kon
                    </Link>
                  </li>
                <li className='mobile-menu__item'>
                  <Link href='/blog' className='mobile-menu__link'>
                    Blog
                    </Link>
                  </li>
                <li className='mobile-menu__item'>
                  <Link href='/contact' className='mobile-menu__link'>
                    Aloqa
                    </Link>
                  </li>
                {isLoggedIn ? (
                  <>
                    <li className='mobile-menu__item'>
                      <Link href='/account' className='mobile-menu__link'>
                        Mening hisobim
                    </Link>
                  </li>
                    <li className='mobile-menu__item'>
                      <button onClick={handleLogout} className='mobile-menu__link w-100 text-start'>
                        Chiqish
                      </button>
                  </li>
                  </>
                ) : (
                  <li className='mobile-menu__item'>
                    <Link href='/login' className='mobile-menu__link'>
                      Kirish
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
      <div className='top-header bg-main-600 py-8 d-none d-lg-block'>
        <div className='container container-lg'>
          <div className='row align-items-center'>
            <div className='col-lg-6'>
              <div className='top-header__left flex-align gap-16'>
                <div className='flex-align gap-8'>
                  <i className='ph ph-phone text-white text-sm' />
                  <a
                    href='tel:+00123456789'
                    className='text-white text-sm hover-text-main-200'
                  >
                    +00 123 456 789
                  </a>
                </div>
                <div className='flex-align gap-8'>
                  <i className='ph ph-envelope text-white text-sm' />
                  <a
                    href='mailto:support24@marketpro.com'
                    className='text-white text-sm hover-text-main-200'
                  >
                    support24@marketpro.com
                  </a>
          </div>
        </div>
      </div>
            <div className='col-lg-6'>
              <div className='top-header__right flex-align justify-content-end gap-16'>
                <div className='flex-align gap-8'>
                  <i className='ph ph-truck text-white text-sm' />
                  <span className='text-white text-sm'>Free shipping on orders over $50</span>
                </div>
                <div className='flex-align gap-8'>
                  <i className='ph ph-clock text-white text-sm' />
                  <span className='text-white text-sm'>Mon - Fri: 8:00 - 18:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ======================= Top Header End ========================= */}
      {/* ======================= Middle Header Start ========================= */}
      <div className='middle-header py-16 d-none d-lg-block'>
        <div className='container container-lg'>
          <div className='row align-items-center'>
            <div className='col-lg-3'>
            <div className='logo'>
              <Link href='/' className='link'>
                <img src='assets/images/logo/logo.png' alt='Logo' />
              </Link>
            </div>
            </div>
            <div className='col-lg-6'>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/vendor-two?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className='flex-align flex-wrap form-location-wrapper'
              style={{overflow: 'visible'}}
            >
                <div className='search-category d-flex h-48 select-border-end-0 radius-end-0 search-form d-sm-flex d-none position-relative' style={{overflow: 'visible'}}>
                  <div className='location-dropdown w-100' style={{overflow: 'visible'}}>
                    <div 
                      className='location-dropdown__button d-flex align-items-center justify-content-between px-16 py-12 border border-gray-200 border-end-0 cursor-pointer'
                      onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    >
                      <span className='text-gray-700'>By Location</span>
                      <i className='ph ph-caret-down text-gray-500'></i>
                    </div>
                    
                    <div 
                      className='location-dropdown__menu position-absolute top-100 start-0 w-300 bg-white border border-gray-200 shadow-lg' 
                      style={{
                        zIndex: 1000, 
                        display: showLocationDropdown ? 'block' : 'none',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        opacity: showLocationDropdown ? 1 : 0,
                        transform: showLocationDropdown ? 'translateY(0)' : 'translateY(-10px)'
                      }}
                    >
                      <ul className='scroll-sm p-0 py-8 max-h-400 overflow-y-auto'>
                        {regions.map((region) => (
                          <li 
                            key={region.id} 
                            className='position-relative'
                            onMouseEnter={() => setHoveredRegionId(region.id)}
                            onMouseLeave={() => setHoveredRegionId(null)}
                          >
                            <div className='text-gray-600 text-15 py-12 px-16 flex-align gap-8 cursor-pointer rounded-8 hover:bg-gray-50 transition-all duration-200' style={{transition: 'all 0.2s ease'}}>
                              <span className='text-xl d-flex text-gray-400'>
                                <i className='ph ph-map-pin' />
                              </span>
                              <span className='font-medium'>{region.name}</span>
                              {region.districts && region.districts.length > 0 && (
                                <span className='icon text-md d-flex ms-auto text-gray-400'>
                                  <i className='ph ph-caret-right' />
                                </span>
                              )}
                            </div>
                            
                            {/* Districts dropdown on hover */}
                            {hoveredRegionId === region.id && region.districts && region.districts.length > 0 && (
                              <div 
                                className='submenus-submenu py-16 position-absolute top-0 start-100'
                                style={{
                                  zIndex: 1001,
                                  minWidth: '200px',
                                  background: 'white',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                  transition: 'all 0.3s ease',
                                  opacity: 1,
                                  transform: 'translateX(0)'
                                }}
                              >
                                <h6 className='text-lg px-16 submenus-submenu__title mb-8 font-semibold text-gray-800'>
                                  {region.name}
                                </h6>
                                <ul className='submenus-submenu__list max-h-300 overflow-y-auto scroll-sm'>
                                  {region.districts.map((district) => (
                                    <li key={district.id}>
                                      <Link 
                                        href={`/vendor-two?region=${region.id}&district=${district.id}`}
                                        className='block px-16 py-8 hover:bg-gray-50 rounded-4 transition-all duration-10 text-gray-600 hover:text-gray-800'
                                        style={{transition: 'all 0.02s ease'}}
                                      >
                                        {district.name}
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
                </div>
                <div className='search-form__wrapper position-relative'>
                  <input
                    type='text'
                    className='search-form__input common-input py-13 ps-16 pe-18 rounded-end-pill pe-44'
                    placeholder="Kitob nomi, muallif yoki kalit so'z qidiring..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type='submit'
                    className='w-32 h-32 bg-main-600 rounded-circle flex-center text-xl text-white position-absolute top-50 translate-middle-y inset-inline-end-0 me-8'
                  >
                    <i className='ph ph-magnifying-glass' />
                  </button>
                </div>
              </form>
              </div>
            <div className='col-lg-3'>
              <div className='middle-header__right flex-align justify-content-end gap-16'>
                <div className='flex-align gap-8'>
                  <i className='ph ph-headset text-main-600 text-2xl' />
                  <div>
                    <div className='text-sm text-gray-500'>Customer Service</div>
                    <div className='fw-semibold text-gray-900'>+00 123 456 789</div>
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
        <div className='container container-lg'>
          <nav className='header-inner d-flex justify-content-between gap-8'>
            <div className='flex-align menu-category-wrapper z-30'>
              {/* Category Dropdown Start */}
              <CategoryDropdown />
              {/* Category Dropdown End  */}
            </div>
              {/* Menu Start  */}
              <div className='header-menu d-lg-block d-none'>
                {/* Nav Menu Start */}
                <ul className='nav-menu flex-align '>
                  <li className='on-hover-item nav-menu__item has-submenu'>
                  <Link href='/' className='nav-menu__link'>
                      Kitoblar
                    </Link>
                    <ul className='on-hover-dropdown common-dropdown nav-submenu scroll-sm'>
                      <li className='common-dropdown__item nav-submenu__item'>
                      <Link href='/vendor-two' className='common-dropdown__link nav-submenu__link'>
                        Yangi kitoblar
                        </Link>
                      </li>
                      <li className='common-dropdown__item nav-submenu__item'>
                      <Link href='/vendor-two' className='common-dropdown__link nav-submenu__link'>
                        Yangidek kitoblar 
                        </Link>
                      </li>
                      <li className='common-dropdown__item nav-submenu__item'>
                      <Link href='/vendor-two' className='common-dropdown__link nav-submenu__link'>
                      Sovg'a kitoblar
                        </Link>
                      </li>
                    </ul>
                  </li>
                <li className='nav-menu__item'>
                  <Link href='/vendor' className='nav-menu__link'>
                          Do'konlar
                        </Link>
                      </li>
                <li className='nav-menu__item'>
                  <Link href='/become-seller' className='nav-menu__link'>
                          Ariza qoldirish
                        </Link>
                  </li>
                  <li className='nav-menu__item'>
                  <Link href='/contact' className='nav-menu__link'>
                    Aloqa
                    </Link>
                  </li>
                </ul>
                {/* Nav Menu End */}
              </div>
              {/* Menu End  */}
            {/* Right Side Start */}
            <div className='header-right flex-align gap-16'>
              {/* Search Icon Start */}
                  <button
                    onClick={handleSearchToggle}
                    className='search-icon flex-align d-lg-none d-flex gap-4 item-hover'
                  >
                <i className='ph ph-magnifying-glass text-2xl' />
                  </button>
              {/* Search Icon End */}
              {/* Cart Icon Start */}
              <Link href='/cart' className='cart-icon flex-align gap-4 item-hover'>
                <i className='ph ph-shopping-cart text-2xl' />
                <span className='cart-count bg-main-600 text-white rounded-circle flex-center'>
                  0
                    </span>
                  </Link>
              {/* Cart Icon End */}
              {/* Wishlist Icon Start */}
              <Link href='/wishlist' className='wishlist-icon flex-align gap-4 item-hover'>
                <i className='ph ph-heart text-2xl' />
                <span className='wishlist-count bg-main-600 text-white rounded-circle flex-center'>
                  0
                    </span>
                  </Link>
              {/* Wishlist Icon End */}
              {/* User Icon Start */}
              {isLoggedIn ? (
                <div className='dropdown'>
                  <Link
                    href='#'
                    className='user-icon flex-align gap-4 item-hover dropdown-toggle'
                    data-bs-toggle='dropdown'
                  >
                    <i className='ph ph-user text-2xl' />
                    <span className='d-none d-sm-block'>Mening hisobim</span>
                  </Link>
                  <ul className='dropdown-menu'>
                    <li>
                      <Link href='/account' className='dropdown-item'>
                        <i className='ph ph-user me-8'></i>
                        Profil
                      </Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className='dropdown-item'>
                        <i className='ph ph-sign-out me-8'></i>
                        Chiqish
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link href='/login' className='user-icon flex-align gap-4 item-hover'>
                  <i className='ph ph-user text-2xl' />
                  <span className='d-none d-sm-block'>Kirish</span>
                </Link>
              )}
              {/* User Icon End */}
              {/* Mobile Menu Toggle Start */}
              <button
                onClick={handleMenuToggle}
                className='mobile-menu-toggle d-lg-none d-flex flex-center'
              >
                <i className='ph ph-list text-2xl' />
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
      `}</style>
    </>
  );
};

export default HeaderOne;