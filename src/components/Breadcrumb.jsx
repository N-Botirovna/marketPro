import React from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "@/components/Icon";

/**
 * Server-rendered breadcrumb. Used only inside server pages (account,
 * wishlist, contact, community/[type], shops, policies, …), which lets
 * us skip the client bundle entirely for a 35-line presentational widget.
 *
 * If this ever needs to be embedded inside a client component, switch
 * back to `useTranslations` from `next-intl` — server components can't
 * be rendered as a JSX element from inside a client parent.
 */
const Breadcrumb = async ({ title }) => {
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <div className="breadcrumb mb-0 py-26 bg-main-two-50">
      <div className="container container-lg">
        <div className="breadcrumb-wrapper flex-between flex-wrap gap-16">
          <h6 className="mb-0">{title}</h6>
          <ul className="flex-align gap-8 flex-wrap">
            <li className="text-sm">
              <Link href="/" className="text-gray-900 flex-align gap-8 hover-text-main-600">
                <Icon className="ph ph-house" />
                {tBreadcrumb("home")}
              </Link>
            </li>
            <li className="flex-align">
              <Icon className="ph ph-caret-right" />
            </li>
            <li className="text-sm text-main-600"> {title} </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
