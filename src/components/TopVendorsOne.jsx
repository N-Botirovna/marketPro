"use client";
import React, { useState, useEffect, memo, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getShops } from "@/services/shops";
import { useTranslations } from "next-intl";

const TopVendorsOne = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const tCommon = useTranslations("Common");
  const tBread = useTranslations("Breadcrumb")

  useEffect(() => {
    let mounted = true;
    const fetchShops = async () => {
      try {
        const response = await getShops({ limit: 8, offset: 0 });
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
        <div className="section-heading mb-6">
          <div className="d-flex align-items-center justify-content-between flex-nowrap" style={{ 
            display: 'flex !important',
            alignItems: 'center',
            justifyContent: 'space-between !important',
            width: '100%',
            gap: '16px'
          }}>
            <h5 className="mb-0 fw-semibold" style={{ margin: 0, flexShrink: 0 }}>{tCommon("shops")}</h5>
            <Link
              href="/vendor"
              className="btn btn-outline-main d-inline-flex align-items-center gap-6 rounded-pill px-16 py-8 text-sm fw-medium hover-bg-main-600 hover-text-white transition-1"
              style={{ 
                borderColor: '#299E60',
                color: '#299E60',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                marginLeft: 'auto'
              }}
            >
              {tCommon("viewAll")}
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
                    {tBread("exploreShop")}
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
