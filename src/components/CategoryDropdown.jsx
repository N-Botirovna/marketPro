"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getBookCategories } from "@/services/categories";

const CategoryDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getBookCategories({ limit: 20 });
        setCategories(response.categories);
      } catch (err) {
        console.error('Kategoriyalar yuklashda xatolik:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="nav-item dropdown">
        <Link
          href="#"
          className="nav-link dropdown-toggle d-flex align-items-center gap-8"
        >
          <i className="ph ph-list-bullets"></i>
          Kategoriyalar
        </Link>
      </div>
    );
  }

  if (error || !categories || categories.length === 0) {
    return (
      <div className="nav-item dropdown">
        <Link
          href="#"
          className="nav-link dropdown-toggle d-flex align-items-center gap-8"
        >
          <i className="ph ph-list-bullets"></i>
          Kategoriyalar
        </Link>
      </div>
    );
  }

  return (
    <div 
      className="nav-item dropdown"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href="#"
        className="nav-link dropdown-toggle d-flex align-items-center gap-8"
      >
        <i className="ph ph-list-bullets"></i>
        Kategoriyalar
      </Link>
      
      <div className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
        <div className="container">
          <div className="row g-3">
            {categories.map((category) => (
              <div key={category.id} className="col-lg-3 col-md-4 col-sm-6">
                <Link 
                  href={`/shop?category=${category.id}`}
                  className="dropdown-item d-flex align-items-center gap-12 p-16 hover-bg-gray-50 rounded-8"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="category-icon">
                    {category.picture ? (
                      <img
                        src={category.picture}
                        alt={category.name}
                        className="rounded-circle"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="rounded-circle bg-main-600 text-white d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '40px', 
                        height: '40px',
                        display: category.picture ? 'none' : 'flex'
                      }}
                    >
                      <i className="ph ph-book text-lg"></i>
                    </div>
                  </div>
                  <div className="category-info">
                    <div className="fw-medium text-gray-900">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Kitoblar
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-24 pt-24 border-top border-gray-100">
            <Link 
              href="/shop" 
              className="btn btn-outline-main btn-sm"
              onClick={() => setIsOpen(false)}
            >
              Barcha kategoriyalarni ko'rish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDropdown;
