import React from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Icon from "@/components/Icon";

/**
 * Unified, app-like page header. Replaces the legacy tinted breadcrumb banners
 * (`Breadcrumb` = peach `bg-main-two-50`, `BreadcrumbThree` = green `bg-main-50`)
 * that made secondary pages feel half-redesigned next to the flat, surface-page
 * home/community/wishlist screens.
 *
 * Design language: NO tinted band. A slim, muted breadcrumb trail sits above a
 * confident, left-aligned title (matching `SectionHeader`'s weight/tracking) and
 * an optional subtitle — the same rhythm the redesigned content below uses.
 *
 * Server-rendered (like the breadcrumbs it supersedes) so it stays out of the
 * client bundle; it only needs `getTranslations` + the locale-aware `Link`.
 *
 * Props:
 * - title      page title (string) — also the current breadcrumb crumb
 * - subtitle   optional supporting line under the title
 * - crumbs     optional intermediate trail items [{ label, href }] rendered
 *              between Home and the current page (e.g. Shops › "Iqra kitoblar")
 * - showCrumbs set false to drop the breadcrumb trail (default true)
 */
const PageHeader = async ({ title, subtitle, crumbs = [], showCrumbs = true }) => {
  const tBreadcrumb = await getTranslations("Breadcrumb");

  return (
    <header className="kz-page-header">
      <div className="kz-page-header__inner">
        {showCrumbs ? (
          <nav className="kz-page-header__crumbs" aria-label="breadcrumb">
            <Link href="/" className="kz-page-header__crumb-home">
              <Icon className="ph ph-house" aria-hidden="true" />
              <span>{tBreadcrumb("home")}</span>
            </Link>
            {crumbs.map((c) => (
              <React.Fragment key={c.href}>
                <Icon className="ph ph-caret-right" aria-hidden="true" />
                <Link href={c.href} className="kz-page-header__crumb-link">
                  {c.label}
                </Link>
              </React.Fragment>
            ))}
            <Icon className="ph ph-caret-right" aria-hidden="true" />
            <span className="kz-page-header__crumb-current" aria-current="page">
              {title}
            </span>
          </nav>
        ) : null}

        <h1 className="kz-page-header__title">{title}</h1>
        {subtitle ? <p className="kz-page-header__subtitle">{subtitle}</p> : null}
      </div>
    </header>
  );
};

export default PageHeader;
