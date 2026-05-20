import React from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Server-rendered breadcrumb variant (green-50 background) used by the
 * vendor page. See Breadcrumb.jsx for the rationale on staying off the
 * client bundle.
 */
const BreadcrumbThree = async ({ title }) => {
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <div className="breadcrumb mb-0 py-26 bg-main-50">
      <div className="container container-lg">
        <div className="breadcrumb-wrapper flex-between flex-wrap gap-16">
          <h6 className="mb-0">{title}</h6>
          <ul className="flex-align gap-8 flex-wrap">
            <li className="text-sm">
              <Link href="/" className="text-gray-900 flex-align gap-8 hover-text-main-600">
                <i className="ph ph-house" />
                {tBreadcrumb("home")}
              </Link>
            </li>
            <li className="flex-align">
              <i className="ph ph-caret-right" />
            </li>
            <li className="text-sm text-main-600"> {title} </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BreadcrumbThree;
