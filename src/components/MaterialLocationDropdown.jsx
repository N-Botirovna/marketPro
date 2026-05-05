"use client";
import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { getRegions } from "@/services/regions";

const MaterialLocationDropdown = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const tLoc = useTranslations("Location");
  const tLoad = useTranslations("Loading");

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await getRegions({ limit: 50 });
        setRegions(res.regions || []);
      } catch (error) {
        console.error("Viloyat ma'lumotlarini olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRegions();
  }, []);

  if (loading) {
    return (
      <div className="on-hover-item">
        <button
          type="button"
          className="category__button flex-align gap-8 fw-medium px-16 border-end border-gray-100 text-heading h-48"
          disabled
        >
          <span className="text-xl d-flex">
            <i className="ph ph-map-pin" />
          </span>
          {tLoad("loading")}
        </button>
      </div>
    );
  }

  return (
    <div className="category on-hover-item">
      <button
        type="button"
        className="category__button flex-align gap-8 fw-medium px-16 border-end border-gray-100 text-heading h-48"
      >
        <span className="text-xl d-flex">
          <i className="ph ph-map-pin" />
        </span>
        <span className="d-sm-flex d-none">{tLoc("regions")}</span>
        <span className="arrow-icon text-xl d-flex">
          <i className="ph ph-caret-down" />
        </span>
      </button>

      <div className="on-hover-dropdown common-dropdown nav-submenu p-0 submenus-submenu-wrapper">
        <ul className="scroll-sm p-0 py-8 w-250 max-h-400 overflow-y-auto" style={{ listStyle: "none" }}>
          {regions.map((region) => (
            <li key={region.id} className="has-submenus-submenu">
              <Link
                href={`/vendor-two?region=${region.id}`}
                className="common-dropdown__link nav-submenu__link flex-align gap-8"
              >
                {region.name}
                {region.districts?.length > 0 && (
                  <span className="icon text-md d-flex ms-auto">
                    <i className="ph ph-caret-right" />
                  </span>
                )}
              </Link>

              {region.districts?.length > 0 && (
                <div className="submenus-submenu py-16">
                  <h6 className="text-sm px-16 submenus-submenu__title mb-8 fw-semibold">
                    {region.name}
                  </h6>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {region.districts.map((district) => (
                      <li key={district.id}>
                        <Link
                          href={`/vendor-two?region=${region.id}&district=${district.id}`}
                          className="common-dropdown__link nav-submenu__link"
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
  );
};

export default MaterialLocationDropdown;
