"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import ShopCard from "./ShopCard";
import { getHomePageShops } from "@/services/shops";

const ShopsSection = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const response = await getHomePageShops(8);
        setShops(response.shops);
      } catch (err) {
        console.error('Do\'konlar yuklashda xatolik:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  if (loading) {
    return (
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center">
            <p className="text-danger">Do'konlar yuklashda xatolik yuz berdi</p>
          </div>
        </div>
      </section>
    );
  }

  if (!shops || shops.length === 0) {
    return (
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center">
            <p className="text-muted">Do'konlar topilmadi</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-80">
      <div className="container container-lg">
        <div className="section-heading text-center mb-48">
          <h2 className="section-heading__title">Do'konlar</h2>
          <p className="section-heading__desc">
            Eng yaxshi kitob do'konlari
          </p>
        </div>
        
        <div className="row gy-4">
          {shops.map((shop) => (
            <div key={shop.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
              <ShopCard shop={shop} />
            </div>
          ))}
        </div>

        <div className="text-center mt-48">
          <Link href="/shops" className="btn btn-main">
            Barcha do'konlarni ko'rish
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShopsSection;
