// ─── App-shell navigation model ──────────────────────────────────────────────
// Single source of truth for the primary navigation rendered by the app shell:
//   * mobile/tablet  → BottomTabBar  (5 slots, the `PRIMARY_NAV` list)
//   * desktop (≥lg)  → SideRail      (the `RAIL_NAV` list — added next phase)
//
// Adding/reordering a destination = edit these arrays only; the shell surfaces
// pick them up automatically. Labels are i18n keys in the `Nav` namespace;
// icons are phosphor glyph names resolved by `@/components/Icon` (ICON_MAP).
//
// Item shape:
//   { key, icon, labelKey,
//     href?    — next-intl route (link item),
//     action?  — global action id instead of navigation ("post-book"),
//     match?   — extra path prefixes that mark this item active,
//     center?  — render as the elevated center CTA (post button) }

export const PRIMARY_NAV = [
  { key: "home", icon: "house", labelKey: "Nav.home", href: "/" },
  {
    key: "books",
    icon: "book-open-text",
    labelKey: "Nav.books",
    href: "/community/all",
    match: ["/community", "/book-details", "/books"],
  },
  { key: "post", icon: "plus", labelKey: "Nav.post", action: "post-book", center: true },
  {
    key: "collections",
    icon: "stack",
    labelKey: "Nav.collections",
    href: "/collections",
    match: ["/collections", "/collection"],
  },
  {
    key: "profile",
    icon: "user-circle",
    labelKey: "Nav.profile",
    href: "/account",
    match: ["/account", "/wishlist"],
  },
];

// Desktop side rail can carry more destinations than the 5-slot mobile bar
// (Shops gets its own entry instead of hiding under a drawer).
export const RAIL_NAV = [
  { key: "home", icon: "house", labelKey: "Nav.home", href: "/" },
  {
    key: "books",
    icon: "book-open-text",
    labelKey: "Nav.books",
    href: "/community/all",
    match: ["/community", "/book-details", "/books"],
  },
  {
    key: "collections",
    icon: "stack",
    labelKey: "Nav.collections",
    href: "/collections",
    match: ["/collections", "/collection"],
  },
  { key: "shops", icon: "storefront", labelKey: "Nav.shops", href: "/shops", match: ["/shops"] },
  {
    key: "profile",
    icon: "user-circle",
    labelKey: "Nav.profile",
    href: "/account",
    match: ["/account", "/wishlist"],
  },
];

// Pathnames (locale-prefix already stripped by next-intl's usePathname) where
// the app-shell nav should not appear — auth flows own the full screen.
const HIDDEN_SUFFIXES = ["/login", "/register", "/forgot-password", "/auth/auto"];

export function isShellHiddenPath(pathname) {
  if (!pathname) return false;
  return HIDDEN_SUFFIXES.some((s) => pathname === s || pathname.endsWith(s));
}

// Active-state resolver shared by every shell surface so highlighting is
// identical in the bottom bar and the rail. Home matches only "/"; everything
// else matches its href prefix plus any extra `match` prefixes.
export function isNavItemActive(item, pathname) {
  if (!pathname || !item.href) return false;
  if (item.href === "/") return pathname === "/";
  const prefixes = [item.href, ...(item.match || [])];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`) || pathname === p);
}
