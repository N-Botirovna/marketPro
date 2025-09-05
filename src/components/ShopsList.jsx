"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ShopCard from "./ShopCard";
import { getShops } from "@/services/shops";

const ShopsList = () => {
  const searchParams = useSearchParams();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    region: searchParams.get('region') || '',
    district: searchParams.get('district') || '',
    star_min: searchParams.get('star_min') || '',
    star_max: searchParams.get('star_max') || '',
    ordering: searchParams.get('ordering') || '-star',
    limit: 20,
    offset: 0
  });
  const [grid, setGrid] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    fetchShops();
  }, [filters]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await getShops(filters);
      setShops(response.shops);
    } catch (err) {
      console.error('Do\'konlar yuklashda xatolik:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset to first page when filtering
    }));
  };

  const sidebarController = () => {
    setActive(!active);
  };

  if (loading) {
    return (
      <section className='shops py-80'>
        <div className='container container-lg'>
          <div className='text-center'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='shops py-80'>
        <div className='container container-lg'>
          <div className='text-center'>
            <p className='text-danger'>Do'konlar yuklashda xatolik yuz berdi</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='shops py-80'>
      <div className={`side-overlay ${active && "show"}`}></div>
      <div className='container container-lg'>
        <div className='row'>
          {/* Sidebar Start */}
          <div className='col-lg-3'>
            <div className={`shop-sidebar ${active && "active"}`}>
              <button
                onClick={sidebarController}
                type='button'
                className='shop-sidebar__close d-lg-none d-flex w-32 h-32 flex-center border border-gray-100 rounded-circle hover-bg-main-600 position-absolute inset-inline-end-0 me-10 mt-8 hover-text-white hover-border-main-600'
              >
                <i className='ph ph-x' />
              </button>

              {/* Search Filter */}
              <div className='shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32'>
                <h6 className='text-xl border-bottom border-gray-100 pb-24 mb-24'>
                  Qidirish
                </h6>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Do\'kon nomi...'
                  value={filters.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                />
              </div>

              {/* Star Rating Filter */}
              <div className='shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32'>
                <h6 className='text-xl border-bottom border-gray-100 pb-24 mb-24'>
                  Reyting
                </h6>
                <div className='row gy-2'>
                  <div className='col-6'>
                    <input
                      type='number'
                      className='form-control'
                      placeholder='Min'
                      min='0'
                      max='5'
                      step='0.1'
                      value={filters.star_min}
                      onChange={(e) => handleFilterChange('star_min', e.target.value)}
                    />
                  </div>
                  <div className='col-6'>
                    <input
                      type='number'
                      className='form-control'
                      placeholder='Max'
                      min='0'
                      max='5'
                      step='0.1'
                      value={filters.star_max}
                      onChange={(e) => handleFilterChange('star_max', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Star Filters */}
              <div className='shop-sidebar__box border border-gray-100 rounded-8 p-32 mb-32'>
                <h6 className='text-xl border-bottom border-gray-100 pb-24 mb-24'>
                  Tez filtrlar
                </h6>
                <div className='d-flex flex-column gap-8'>
                  <button
                    className='btn btn-outline-secondary btn-sm text-start'
                    onClick={() => handleFilterChange('star_min', '4')}
                  >
                    ⭐ 4+ reyting
                  </button>
                  <button
                    className='btn btn-outline-secondary btn-sm text-start'
                    onClick={() => handleFilterChange('star_min', '3')}
                  >
                    ⭐ 3+ reyting
                  </button>
                  <button
                    className='btn btn-outline-secondary btn-sm text-start'
                    onClick={() => {
                      handleFilterChange('star_min', '');
                      handleFilterChange('star_max', '');
                    }}
                  >
                    Barcha reytinglar
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Sidebar End */}

          {/* Content Start */}
          <div className='col-lg-9'>
            {/* Top Start */}
            <div className='flex-between gap-16 flex-wrap mb-40'>
              <span className='text-gray-900'>
                {shops.length} ta do'kon topildi
              </span>
              <div className='position-relative flex-align gap-16 flex-wrap'>
                <div className='list-grid-btns flex-align gap-16'>
                  <button
                    onClick={() => setGrid(true)}
                    type='button'
                    className={`w-44 h-44 flex-center border rounded-6 text-2xl list-btn border-gray-100 ${
                      grid === true && "border-main-600 text-white bg-main-600"
                    }`}
                  >
                    <i className='ph-bold ph-list-dashes' />
                  </button>
                  <button
                    onClick={() => setGrid(false)}
                    type='button'
                    className={`w-44 h-44 flex-center border rounded-6 text-2xl grid-btn border-gray-100 ${
                      grid === false && "border-main-600 text-white bg-main-600"
                    }`}
                  >
                    <i className='ph ph-squares-four' />
                  </button>
                </div>
                <div className='position-relative text-gray-500 flex-align gap-4 text-14'>
                  <label htmlFor='sorting' className='text-inherit flex-shrink-0'>
                    Tartiblash:{" "}
                  </label>
                  <select
                    value={filters.ordering}
                    onChange={(e) => handleFilterChange('ordering', e.target.value)}
                    className='form-control common-input px-14 py-14 text-inherit rounded-6 w-auto'
                    id='sorting'
                  >
                    <option value='-star'>Reyting: yuqoridan pastga</option>
                    <option value='star'>Reyting: pastdan yuqoriga</option>
                    <option value='-created_at'>Eng yangi</option>
                    <option value='created_at'>Eng eski</option>
                    <option value='-updated_at'>Oxirgi yangilangan</option>
                  </select>
                </div>
                <button
                  onClick={sidebarController}
                  type='button'
                  className='w-44 h-44 d-lg-none d-flex flex-center border border-gray-100 rounded-6 text-2xl sidebar-btn'
                >
                  <i className='ph-bold ph-funnel' />
                </button>
              </div>
            </div>
            {/* Top End */}

            {/* Shops Grid */}
            <div className={`list-grid-wrapper ${grid && "list-view"}`}>
              {shops.length === 0 ? (
                <div className='text-center py-80'>
                  <p className='text-muted'>Hech qanday do'kon topilmadi</p>
                </div>
              ) : (
                <div className='row gy-4'>
                  {shops.map((shop) => (
                    <div key={shop.id} className='col-xl-3 col-lg-4 col-md-6 col-sm-6'>
                      <ShopCard shop={shop} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Content End */}
        </div>
      </div>
    </section>
  );
};

export default ShopsList;
