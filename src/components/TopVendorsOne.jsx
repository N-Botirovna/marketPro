"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getShops } from "@/services/shops";

const TopVendorsOne = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await getShops({ limit: 8 });
        setShops(response.shops);
      } catch (error) {
        console.error("Failed to fetch shops:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  return (
    <section className="top-vendors py-80">
      <div className="container container-lg">
        <div className="section-heading">
          <div className="flex-between flex-wrap gap-8">
            <h5 className="mb-0">Weekly Top Vendors</h5>
            <Link
              href="/shops"
              className="text-sm fw-medium text-gray-700 hover-text-main-600 hover-text-decoration-underline"
            >
              All Vendors
            </Link>
          </div>
        </div>
        <div className="row gy-4 vendor-card-wrapper">
          {shops.map((shop) => (
            <div key={shop.id} className="col-xxl-3 col-lg-4 col-sm-6">
              <div className="vendor-card text-center px-16 pb-24">
                <div className="">
                  <img
                    src={
                      shop.picture || "assets/images/thumbs/vendor-logo1.png"
                    }
                    alt={shop.name}
                    className="vendor-card__logo m-12"
                    style={{
                      height: "80px",
                      width: "80px",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                  <h6 className="title mt-32">{shop.name}</h6>
                  <span className="text-heading text-sm d-block">
                    {shop.book_count} mahsulot
                  </span>
                  <Link
                    href={`/vendor-two-details?id=${shop.id}`}
                    className="btn btn-main-two rounded-pill py-6 px-16 text-12 mt-8"
                  >
                    Do'konga o'tish
                  </Link>
                </div>
                <div className="vendor-card__list mt-22 flex-center flex-wrap gap-8">
                  <div className="vendor-card__item bg-white rounded-circle flex-center">
                    <img src="assets/images/thumbs/vendor-img1.png" alt="" />
                  </div>
                  <div className="vendor-card__item bg-white rounded-circle flex-center">
                    <img src="assets/images/thumbs/vendor-img2.png" alt="" />
                  </div>
                  <div className="vendor-card__item bg-white rounded-circle flex-center">
                    <img src="assets/images/thumbs/vendor-img3.png" alt="" />
                  </div>
                  <div className="vendor-card__item bg-white rounded-circle flex-center">
                    <img src="assets/images/thumbs/vendor-img4.png" alt="" />
                  </div>
                  <div className="vendor-card__item bg-white rounded-circle flex-center">
                    <img src="assets/images/thumbs/vendor-img5.png" alt="" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopVendorsOne;
