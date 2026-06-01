"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Skeleton,
  Chip,
  Avatar,
  Button,
  IconButton,
} from "@mui/material";
import dynamic from "next/dynamic";
import { getShopDetails } from "@/services/shop";
import { getBooks } from "@/services/books";
import { getBookCategories, getBookSubcategories } from "@/services/categories";
import BookRowGrid from "@/components/shared/BookRowGrid";
import { openShareSheet } from "@/lib/shareSheet";
import ShopBannerCarousel from "@/components/ShopBannerCarousel";
import Icon from "@/components/Icon";

// Lazy: the story-create modal carries the BookCreateModal-sized form
// and chunks shouldn't ship until an owner actually taps "promote".
const StoryCreateModal = dynamic(() => import("@/components/profile/StoryCreateModal"), {
  ssr: false,
  loading: () => null,
});
// Owner-only shop editor + banner manager. Anonymous visitors never
// pay this chunk's bytes since the dynamic loader is only invoked when
// the edit CTA renders.
const ShopEditModal = dynamic(() => import("@/components/shop/ShopEditModal"), {
  ssr: false,
  loading: () => null,
});

// Tap-to-expand location preview — Leaflet touches `window`, so client-only.
const ShopLocationCard = dynamic(() => import("@/components/shared/ShopLocationCard"), {
  ssr: false,
  loading: () => null,
});

const formatStar = (value) => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return null;
  return num.toFixed(1);
};

// Backend stores `working_days` as English short codes joined by ", "
// (e.g. "Mon, Tue, Fri"). We render them through the Days i18n namespace
// so uz/ru users see "Du, Se, Ju" / "Пн, Вт, Пт" — the on-disk format
// stays canonical, the UI follows the active locale.
const localizeWorkingDays = (raw, tDays) => {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .split(/[,\s]+/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .map((code) => {
      try {
        const v = tDays(code);
        return v === code ? code : v;
      } catch {
        return code;
      }
    })
    .join(", ");
};

const ShopDetailPage = ({ shopId }) => {
  const t = useTranslations("ShopDetailPage");
  const tDays = useTranslations("Days");
  const tShare = useTranslations("Share");
  const tShopEdit = useTranslations("ShopEdit");
  const tShopLoc = useTranslations("ShopLocation");

  const handleShareShop = () => {
    const name = shop?.name || "Kitobzor";
    openShareSheet({
      title: name,
      text: `${name} — Kitobzor`,
      url: typeof window !== "undefined" ? window.location.pathname : "",
    });
  };

  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const handlePromoteBannerToStory = () => {
    // Backend's StoryTargetKind doesn't yet include BANNER, so we
    // promote the parent shop — its banners surface in the shop story
    // automatically. When `BANNER` kind ships (sharing/models.py
    // StoryTargetKind), point the modal at the banner instead.
    setStoryModalOpen(true);
  };

  const [editOpen, setEditOpen] = useState(false);

  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState(null);

  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  // Two-state search: `query` is what the user typed; `debouncedQuery`
  // is what the books fetch reacts to. Without this every keystroke
  // would hammer the API.
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef(null);

  // ── Shop detail ─────────────────────────────────────────────────────
  // `t` intentionally omitted from deps — recomputing on a (rare) locale
  // change would re-fetch the shop. The fallback string lives in the
  // catch so we don't depend on the translation function at all.
  useEffect(() => {
    if (!shopId) return undefined;
    let alive = true;
    setShopLoading(true);
    setShopError(null);
    getShopDetails(shopId)
      .then((data) => {
        if (!alive) return;
        const shopData = data?.result || data;
        setShop(shopData);
      })
      .catch((err) => {
        if (!alive) return;
        setShopError(err?.normalized?.message || err?.message || "Failed to load");
      })
      .finally(() => {
        if (alive) setShopLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [shopId]);

  // ── Categories (once) ───────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    getBookCategories({ limit: 100 })
      .then((res) => {
        if (alive) setCategories(res.categories || []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // ── Subcategories on category change ─────────────────────────────────
  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcategoryId("");
      return undefined;
    }
    let alive = true;
    getBookSubcategories({ category: categoryId, limit: 100 })
      .then((res) => {
        if (alive) setSubcategories(res.subcategories || res.results || []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [categoryId]);

  // ── Debounce typing → debouncedQuery ────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Books with current filters ──────────────────────────────────────
  useEffect(() => {
    if (!shopId) return undefined;
    let alive = true;
    setBooksLoading(true);

    const params = { shop: shopId, is_active: true, limit: 30 };
    if (categoryId) params.category = categoryId;
    if (subcategoryId) params.sub_category = subcategoryId;
    if (debouncedQuery) params.q = debouncedQuery;

    getBooks(params)
      .then((res) => {
        if (alive) setBooks(res.books || []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setBooksLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [shopId, categoryId, subcategoryId, debouncedQuery]);

  // ── Derived ──────────────────────────────────────────────────────────
  const star = useMemo(() => formatStar(shop?.star), [shop]);
  const region = shop?.region?.name;
  const district = shop?.district?.name;
  const locationLine = [region, district, shop?.location_text].filter(Boolean).join(" · ");

  const tg = shop?.telegram?.replace(/^@/, "") || "";
  const tgUrl = tg ? `https://t.me/${tg}` : null;
  const phoneClean = shop?.phone_number?.replace(/\s/g, "") || "";
  const phoneHref = phoneClean ? `tel:${phoneClean}` : null;
  const ig = shop?.instagram?.replace(/^@/, "") || "";
  const igUrl = ig ? `https://instagram.com/${ig}` : null;
  const websiteHref = shop?.website
    ? shop.website.startsWith("http")
      ? shop.website
      : `https://${shop.website}`
    : null;
  const localizedDays = useMemo(
    () => localizeWorkingDays(shop?.working_days, tDays),
    [shop?.working_days, tDays],
  );
  const hasHours = Boolean(localizedDays || shop?.working_hours || shop?.lunch);

  // ── Loading / error ─────────────────────────────────────────────────
  if (shopLoading) {
    return (
      <Box sx={{ py: { xs: 3, md: 5 }, bgcolor: "var(--surface-page)" }}>
        <Box sx={{ maxWidth: 880, mx: "auto", px: { xs: 2, md: 3 } }}>
          <Stack direction="row" spacing={2.5} sx={{ alignItems: "center" }}>
            <Skeleton variant="circular" width={96} height={96} />
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="55%" height={32} />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="rounded" width={180} height={36} sx={{ mt: 1 }} />
            </Stack>
          </Stack>
        </Box>
      </Box>
    );
  }

  if (shopError || !shop) {
    return (
      <Box sx={{ py: 6, textAlign: "center", color: "var(--text-secondary)" }}>
        <Typography>{shopError || t("notFound")}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "var(--surface-page)",
        color: "var(--text-primary)",
        minHeight: "60vh",
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 880, mx: "auto", px: { xs: 2, md: 3 } }}>
        {/* ─── Announcement banners (shop-managed) ──────────────── */}
        {Array.isArray(shop?.banners) && shop.banners.length > 0 && (
          <ShopBannerCarousel
            banners={shop.banners}
            isOwner={Boolean(shop?.is_owner)}
            onPromoteToStory={handlePromoteBannerToStory}
          />
        )}

        {/* ─── Hero ──────────────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: "var(--surface-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 3,
            boxShadow: "var(--shadow-card)",
            p: { xs: 2.5, md: 3 },
            mb: 2.5,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 2, sm: 2.5 }}
            sx={{ alignItems: { xs: "stretch", sm: "flex-start" } }}
          >
            <Avatar
              src={shop.picture || undefined}
              alt={shop.name}
              sx={{
                width: { xs: 84, sm: 96 },
                height: { xs: 84, sm: 96 },
                bgcolor: "var(--surface-muted)",
                fontSize: 36,
                flexShrink: 0,
                alignSelf: { xs: "center", sm: "flex-start" },
              }}
            >
              <Icon className="ph-fill ph-storefront" aria-hidden="true" />
            </Avatar>

            <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
              {/* Title row: name + star inline */}
              <Stack
                direction="row"
                spacing={1.25}
                useFlexGap
                sx={{
                  alignItems: "center",
                  justifyContent: { xs: "center", sm: "flex-start" },
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: 22, md: 24 },
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                    wordBreak: "break-word",
                    textAlign: { xs: "center", sm: "left" },
                  }}
                >
                  {shop.name}
                </Typography>
                {star && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      alignItems: "center",
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 999,
                      bgcolor: "rgba(245, 158, 11, 0.12)",
                      color: "#b45309",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    <Icon className="ph-fill ph-star" style={{ fontSize: 12 }} aria-hidden="true" />
                    <span>{star}</span>
                  </Stack>
                )}
              </Stack>

              {/* Location */}
              {locationLine && (
                <Typography
                  sx={{
                    color: "var(--text-muted)",
                    fontSize: 13,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    justifyContent: { xs: "center", sm: "flex-start" },
                    flexWrap: "wrap",
                  }}
                >
                  <Icon className="ph ph-map-pin" style={{ fontSize: 14 }} aria-hidden="true" />
                  {locationLine}
                </Typography>
              )}

              {/* Bio */}
              {shop.bio && (
                <Typography
                  sx={{
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    lineHeight: 1.55,
                    textAlign: { xs: "center", sm: "left" },
                    maxWidth: 520,
                  }}
                >
                  {shop.bio}
                </Typography>
              )}

              {/* Secondary chips */}
              <Stack
                direction="row"
                spacing={0.75}
                useFlexGap
                sx={{ flexWrap: "wrap", justifyContent: { xs: "center", sm: "flex-start" } }}
              >
                {shop.type && (
                  <Chip
                    size="small"
                    label={t(`shopType.${shop.type}`)}
                    sx={{ height: 24, bgcolor: "var(--surface-muted)", fontWeight: 600 }}
                  />
                )}
                {typeof shop.book_count === "number" && (
                  <Chip
                    size="small"
                    icon={
                      <Icon className="ph ph-books" style={{ fontSize: 12 }} aria-hidden="true" />
                    }
                    label={`${shop.book_count} ${t("booksCountSuffix")}`}
                    sx={{ height: 24, bgcolor: "var(--surface-muted)", fontWeight: 600 }}
                  />
                )}
                {shop.has_post_service && (
                  <Chip
                    size="small"
                    icon={
                      <Icon className="ph ph-package" style={{ fontSize: 12 }} aria-hidden="true" />
                    }
                    label={t("postService")}
                    sx={{
                      height: 24,
                      fontWeight: 600,
                      bgcolor: "rgba(13, 148, 136, 0.12)",
                      color: "#0d9488",
                    }}
                  />
                )}
              </Stack>

              {/* Primary contact CTAs + small social icons */}
              {(tgUrl || phoneHref || igUrl || websiteHref) && (
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{
                    alignItems: "center",
                    flexWrap: "wrap",
                    mt: 0.5,
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  {tgUrl && (
                    <Button
                      component="a"
                      href={tgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      size="small"
                      startIcon={<Icon className="ph-fill ph-telegram-logo" />}
                      sx={{
                        bgcolor: "#0088cc",
                        textTransform: "none",
                        fontWeight: 700,
                        boxShadow: "0 4px 12px rgba(0,136,204,0.25)",
                        "&:hover": { bgcolor: "#0077b3" },
                      }}
                    >
                      {t("telegram")}
                    </Button>
                  )}
                  {phoneHref && (
                    <Button
                      component="a"
                      href={phoneHref}
                      variant={tgUrl ? "outlined" : "contained"}
                      size="small"
                      startIcon={<Icon className="ph-fill ph-phone" />}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      {t("callShop")}
                    </Button>
                  )}
                  {igUrl && (
                    <IconButton
                      component="a"
                      href={igUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      size="small"
                      sx={{
                        width: 32,
                        height: 32,
                        border: "1px solid var(--border-subtle)",
                        color: "#bc1888",
                      }}
                    >
                      <Icon className="ph ph-instagram-logo" />
                    </IconButton>
                  )}
                  {websiteHref && (
                    <IconButton
                      component="a"
                      href={websiteHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("website")}
                      size="small"
                      sx={{
                        width: 32,
                        height: 32,
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Icon className="ph ph-globe" />
                    </IconButton>
                  )}
                  {shop?.is_owner && (
                    <Button
                      onClick={() => setEditOpen(true)}
                      variant="outlined"
                      size="small"
                      startIcon={<Icon className="ph ph-pencil-simple" aria-hidden="true" />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 999,
                      }}
                    >
                      {tShopEdit("editButton")}
                    </Button>
                  )}
                  <IconButton
                    onClick={handleShareShop}
                    aria-label={tShare("shareShop")}
                    title={tShare("shareShop")}
                    size="small"
                    sx={{
                      width: 32,
                      height: 32,
                      border: "1px solid var(--border-subtle)",
                      color: "var(--main-700, hsl(148, 59%, 31%))",
                      "&:hover": {
                        bgcolor: "var(--main-50, hsl(148, 59%, 95%))",
                      },
                    }}
                  >
                    <Icon className="ph ph-share-network" />
                  </IconButton>
                </Stack>
              )}
            </Stack>
          </Stack>

          {/* Hours block — compact, under the hero row */}
          {hasHours && (
            <Box
              sx={{
                mt: 2.5,
                pt: 2,
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.5, sm: 2.5 }}
                sx={{ color: "var(--text-secondary)", fontSize: 13 }}
              >
                {localizedDays && (
                  <InfoLine
                    icon="ph ph-calendar-blank"
                    label={t("workingDays")}
                    value={localizedDays}
                  />
                )}
                {shop.working_hours && (
                  <InfoLine
                    icon="ph ph-clock"
                    label={t("openingHours")}
                    value={shop.working_hours}
                  />
                )}
                {shop.lunch && (
                  <InfoLine icon="ph ph-fork-knife" label={t("lunchBreak")} value={shop.lunch} />
                )}
              </Stack>
            </Box>
          )}
        </Box>

        {/* ─── Location map (when the shop has a pinned point) ─────── */}
        {shop?.point && (
          <Box sx={{ mb: 3 }}>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: 17, md: 19 },
                fontWeight: 700,
                mb: 1.5,
                px: 0.5,
                letterSpacing: "-0.01em",
              }}
            >
              {tShopLoc("detailTitle")}
            </Typography>
            <ShopLocationCard point={shop.point} />
          </Box>
        )}

        {/* ─── Books section ──────────────────────────────────────── */}
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 17, md: 19 },
            fontWeight: 700,
            mb: 1.5,
            px: 0.5,
            letterSpacing: "-0.01em",
          }}
        >
          {t("booksTitle")}
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon
                      className="ph ph-magnifying-glass"
                      style={{ fontSize: 18, color: "var(--text-muted)" }}
                      aria-hidden="true"
                    />
                  </InputAdornment>
                ),
                sx: { bgcolor: "var(--surface-card)" },
              },
            }}
          />
          <TextField
            select
            size="small"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            label={t("categoryFilter")}
            sx={{
              minWidth: { md: 200 },
              "& .MuiOutlinedInput-root": { bgcolor: "var(--surface-card)" },
            }}
          >
            <MenuItem value="">{t("allCategories")}</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            label={t("subcategoryFilter")}
            disabled={!categoryId || subcategories.length === 0}
            sx={{
              minWidth: { md: 200 },
              "& .MuiOutlinedInput-root": { bgcolor: "var(--surface-card)" },
            }}
          >
            <MenuItem value="">{t("allSubcategories")}</MenuItem>
            {subcategories.map((sub) => (
              <MenuItem key={sub.id} value={String(sub.id)}>
                {sub.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <BookRowGrid
          books={books}
          loading={booksLoading}
          skeletonCount={5}
          showTypeBadge={false}
          emptyState={
            <Stack
              spacing={1}
              sx={{
                alignItems: "center",
                py: 6,
                color: "var(--text-muted)",
                border: "1px dashed var(--border-subtle)",
                borderRadius: 3,
              }}
            >
              <Icon className="ph ph-book-open" style={{ fontSize: 40 }} aria-hidden="true" />
              <Typography>{t("emptyBooks")}</Typography>
            </Stack>
          }
        />
      </Box>

      {/* Owner-only story creator — lazy-loaded so non-owners never
          download the modal chunk. Pre-populated with this shop so the
          owner can promote the banner via the SHOP target kind. */}
      {shop?.is_owner && (
        <StoryCreateModal
          open={storyModalOpen}
          onClose={() => setStoryModalOpen(false)}
          shops={[shop]}
          onCreated={() => setStoryModalOpen(false)}
        />
      )}

      {/* Owner-only edit dialog. `onSaved` merges the server response
          back into local state so the page reflects the new fields
          (name, hours, banners, etc.) without a hard refresh. */}
      {shop?.is_owner && (
        <ShopEditModal
          open={editOpen}
          shop={shop}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            if (updated && typeof updated === "object") {
              setShop((prev) => ({ ...prev, ...updated }));
            }
          }}
        />
      )}
    </Box>
  );
};

const InfoLine = ({ icon, label, value }) => (
  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", minWidth: 0 }}>
    <Icon className={icon} style={{ fontSize: 13 }} aria-hidden="true" />
    <Box component="span" sx={{ color: "var(--text-muted)" }}>
      {label}:
    </Box>
    <Box
      component="span"
      sx={{
        fontWeight: 600,
        color: "var(--text-primary)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Box>
  </Stack>
);

export default ShopDetailPage;
