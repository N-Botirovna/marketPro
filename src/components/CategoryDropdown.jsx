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

      <div 
        className={`dropdown-menu ${isOpen ? 'show' : ''}`} 
        style={{ 
          minWidth: '500px', 
          maxWidth: '600px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef',
          borderRadius: '12px'
        }}
      >
        <div className="container-fluid p-16">
          <div className="row g-2">
            {categories.map((category) => (
              <div key={category.id} className="col-lg-4 col-md-3 col-sm-6">
                <Link
                  href={`/shop?category=${category.id}`}
                  className="dropdown-item d-flex align-items-center gap-12 p-12 rounded-8 text-decoration-none transition-1"
                  onClick={() => setIsOpen(false)}
                  style={{ 
                    minHeight: '50px',
                    border: '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="category-icon flex-shrink-0">
                    {category.picture ? (
                      <img
                        src={category.picture}
                        alt={category.name}
                        className="rounded-circle"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          objectFit: 'cover',
                          border: '2px solid #f8f9fa'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle bg-gray-100 d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                      >
                        <i className="ph ph-book text-gray-500" style={{ fontSize: '20px' }}></i>
                      </div>
                    )}
                  </div>
                  <div className="category-info flex-grow-1">
                    <div className="fw-medium text-gray-900 text-truncate" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                      {category.name}
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
