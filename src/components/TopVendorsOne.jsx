"use client";
import React, { useState, useEffect, memo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { getShops } from "@/services/shops";

const TopVendorsOne = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchShops = async () => {
      try {
        const response = await getShops({ limit: 8 });
        if (mounted) {
          setShops(response.shops || []);
        }
      } catch (error) {
        console.error("Failed to fetch shops:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchShops();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="top-vendors py-80">
      <div className="container container-lg">
        <div className="section-heading">
          <div className="flex items-center justify-between w-full mb-6">
            <h5 className="mb-0 font-semibold">Do'konlar</h5>
            <Link
              href="/vendor-two-details"
              className="text-green-600 text-sm font-medium hover:underline border border-green-600 px-3 py-1 rounded-lg"
            >
              Barchasini ko‘rish →
            </Link>
          </div>
        </div>
        <div className="row gy-4 vendor-card-wrapper">
          {shops.map((shop) => (
            <div key={shop.id} className="col-xxl-3 col-lg-4 col-sm-6">
              <div className="vendor-card text-center px-16 pb-24">
                <div className="">
                  <div
                    style={{
                      position: "relative",
                      width: 90,
                      height: 90,
                      margin: "12px auto",
                      borderRadius: "50%",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={
                        shop.picture || "/assets/images/thumbs/vendor-logo1.png"
                      }
                      alt={shop.name}
                      fill
                      sizes="80px"
                      style={{ objectFit: "cover" }}
                      loading="lazy"
                    />
                  </div>
                  <h6 className="title mt-32">{shop.name}</h6>

                  {/* Star Rating */}
                  {shop.star && (
                    <div className="flex-center gap-4 mt-8 mb-8">
                      <span className="text-warning-600 text-sm fw-bold">
                        {parseFloat(shop.star).toFixed(1)}
                      </span>
                      <i className="ph-fill ph-star text-warning-600 text-sm" />
                    </div>
                  )}

                  {/* Product Count */}
                  <span className="text-heading text-sm d-block">
                    {shop.book_count} mahsulot
                  </span>

                  {/* Location */}
                  {(shop.region || shop.district) && (
                    <span className="text-gray-600 text-xs d-block mt-4">
                      {shop.region?.name && shop.district?.name
                        ? `${shop.district.name}, ${shop.region.name}`
                        : shop.region?.name || shop.district?.name}
                    </span>
                  )}

                  {/* Working Hours */}
                  {shop.working_days && shop.working_hours && (
                    <span className="text-gray-600 text-xs d-block mt-4">
                      {shop.working_days} {shop.working_hours}
                    </span>
                  )}

                  {/* Post Service Badge */}
                  {shop.has_post_service && (
                    <span className="bg-main-50 text-main-600 px-12 py-4 rounded-pill text-xs d-inline-block mt-8 mb-8">
                      <i className="ph ph-truck d-inline mr-4" />
                      Yetkazib berish
                    </span>
                  )}

                  <Link
                    href={`/vendor-two-details?id=${shop.id}`}
                    className="btn btn-main-two rounded-pill py-6 px-16 text-12 mt-8"
                  >
                    Do'konga o'tish
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(TopVendorsOne);
