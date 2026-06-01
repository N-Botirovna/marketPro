"use client";
import React, { useState, useEffect, memo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getShops } from "@/services/shops";
import ShopCard from "@/components/shop/ShopCard";
import ShopCardSkeleton from "@/components/shared/ShopCardSkeleton";

/**
 * "Shops" section (About page). Renders the shared `ShopCard` in a responsive
 * grid — the same card the home row and /shops listing use — so every shop
 * surface stays visually identical. (Previously this had its own inline
 * Bootstrap "vendor-card" markup with a circular avatar, which diverged from
 * the canonical card.)
 */
const TopVendorsOne = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const tCommon = useTranslations("Common");

  useEffect(() => {
    let mounted = true;
    getShops({ limit: 8, offset: 0 })
      .then((response) => {
        if (mounted) setShops(response.shops || []);
      })
      .catch(() => {
        /* non-critical — Sentry already captures via axios interceptor */
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && shops.length === 0) return null;

  return (
    <section className="top-vendors py-80">
      <div className="container container-lg">
        <div className="section-heading mb-24">
          <div className="d-flex align-items-center justify-content-between gap-3">
            <h5 className="mb-0 fw-semibold">{tCommon("shops")}</h5>
            <Link
              href="/vendor"
              className="btn btn-outline-main d-inline-flex align-items-center gap-6 rounded-pill px-16 py-8 text-sm fw-medium hover-bg-main-600 hover-text-white transition-1"
              style={{ borderColor: "#299E60", color: "#299E60", whiteSpace: "nowrap" }}
            >
              {tCommon("viewAll")}
            </Link>
          </div>
        </div>
        <div className="row g-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="col-12 col-md-6 col-xxl-4">
                  <ShopCardSkeleton />
                </div>
              ))
            : shops.map((shop) => (
                <div key={shop.id} className="col-12 col-md-6 col-xxl-4">
                  <ShopCard shop={shop} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default memo(TopVendorsOne);
