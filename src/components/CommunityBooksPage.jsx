"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { getBooks } from "@/services/books";
import { getBookCategories, getBookSubcategories } from "@/services/categories";
import { getRegions } from "@/services/regions";
import BookRowGrid from "@/components/shared/BookRowGrid";
import Icon from "@/components/Icon";

// Page size for the infinite-scroll feed. 24 divides evenly into the
// 1 / 2 / 3-column responsive grid, so rows never end ragged on any
// breakpoint.
const PAGE_SIZE = 24;

const CommunityBooksPage = ({ type = "all" }) => {
  const t = useTranslations("CommunityPage");
  const tLocation = useTranslations("Location");
  const searchParams = useSearchParams();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true); // first page
  const [loadingMore, setLoadingMore] = useState(false); // subsequent pages
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);

  // Pagination cursor + a concurrency guard. Refs (not state) so the
  // IntersectionObserver callback always reads the live value without
  // re-subscribing on every fetch.
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);

  const [regions, setRegions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // URL searchParams seed the initial filter state so deep links from the
  // header (search, category, region) pre-fill the page correctly.
  const [regionId, setRegionId] = useState(() => searchParams.get("region") || "");
  const [districtId, setDistrictId] = useState(() => searchParams.get("district") || "");
  const [categoryId, setCategoryId] = useState(() => searchParams.get("category") || "");
  const [subcategoryId, setSubcategoryId] = useState(() => searchParams.get("sub_category") || "");
  const [query, setQuery] = useState(
    () => searchParams.get("search") || searchParams.get("q") || "",
  );
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  // Fetch regions + categories once
  useEffect(() => {
    let alive = true;
    Promise.all([getRegions({ limit: 100 }), getBookCategories({ limit: 100 })])
      .then(([rRes, cRes]) => {
        if (!alive) return;
        setRegions(rRes.regions || []);
        setCategories(cRes.categories || []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Reset district when region changes
  useEffect(() => {
    setDistrictId("");
  }, [regionId]);

  // Load subcategories when category changes
  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcategoryId("");
      return;
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

  // Reset subcategory when category changes
  useEffect(() => {
    setSubcategoryId("");
  }, [categoryId]);

  // The filter params shared by every page request. Memoized so the
  // fetch callback (and the reset effect that depends on it) only changes
  // identity when a filter actually changes — not on every render.
  const filterParams = useMemo(() => {
    const params = { owner_type: "user", is_active: true };
    if (type && type !== "all") params.type = type;
    if (regionId) params.region = regionId;
    if (districtId) params.district = districtId;
    if (categoryId) params.category = categoryId;
    if (subcategoryId) params.sub_category = subcategoryId;
    if (query.trim()) params.q = query.trim();
    if (priceMin) params.price_min = priceMin;
    if (priceMax) params.price_max = priceMax;
    return params;
  }, [type, regionId, districtId, categoryId, subcategoryId, query, priceMin, priceMax]);

  // One fetch for both the first page (reset=true → replace) and infinite
  // scroll (reset=false → append). The backend sorts gift/exchange/rent
  // ahead of sale ("seller") books, so sale books live past the first
  // page — without this paging they were simply never shown in the "all"
  // feed. `loadingRef` blocks overlapping requests (fast scroll / refilter).
  const fetchPage = useCallback(
    (reset) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      const offset = reset ? 0 : offsetRef.current;
      if (reset) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      getBooks({ ...filterParams, limit: PAGE_SIZE, offset })
        .then((res) => {
          const fetched = res.books || [];
          offsetRef.current = offset + fetched.length;
          setCount(res.count ?? 0);
          setBooks((prev) => (reset ? fetched : [...prev, ...fetched]));
        })
        .catch((err) => {
          setError(err?.normalized?.message || err?.message || t("loadError"));
        })
        .finally(() => {
          setLoading(false);
          setLoadingMore(false);
          loadingRef.current = false;
        });
    },
    [filterParams, t],
  );

  // Reset to page one whenever the filters change.
  useEffect(() => {
    offsetRef.current = 0;
    fetchPage(true);
  }, [fetchPage]);

  const hasMore = books.length < count;

  // Auto-load the next page as the sentinel scrolls into view.
  //
  // `books.length` is in the deps on purpose: re-creating the observer after
  // each appended page re-arms it. IntersectionObserver only fires on an
  // intersection *transition*, so if the sentinel stays continuously within
  // the margin (common while lazy-loaded images make the page height jump
  // around) a persistent observer goes silent after one hit. A fresh observer
  // re-fires for a target that's already intersecting, so this keeps filling
  // until the sentinel is finally pushed out of view (or `hasMore` is false).
  // `loadingRef` blocks overlap, so it can't double-fetch the same offset.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) fetchPage(false);
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchPage, hasMore, books.length]);

  const selectedRegion = useMemo(
    () => regions.find((r) => String(r.id) === regionId),
    [regions, regionId],
  );
  const districts = selectedRegion?.districts || [];

  const showTypeBadge = type === "all";

  return (
    <Box
      sx={{
        bgcolor: "var(--surface-page)",
        color: "var(--text-primary)",
        minHeight: "60vh",
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 } }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 22, md: 28 },
            fontWeight: 700,
            mb: 1,
            lineHeight: 1.2,
          }}
        >
          {t(`title.${type}`)}
        </Typography>
        <Typography sx={{ color: "var(--text-secondary)", mb: 2.5 }}>
          {t(`subtitle.${type}`)}
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 1.5 }}>
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
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            label={tLocation("selectRegion")}
            sx={{
              minWidth: { md: 180 },
              "& .MuiOutlinedInput-root": { bgcolor: "var(--surface-card)" },
            }}
          >
            <MenuItem value="">{tLocation("allRegions")}</MenuItem>
            {regions.map((region) => (
              <MenuItem key={region.id} value={String(region.id)}>
                {region.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            value={districtId}
            onChange={(e) => setDistrictId(e.target.value)}
            label={tLocation("selectDistrict")}
            disabled={!regionId || districts.length === 0}
            sx={{
              minWidth: { md: 180 },
              "& .MuiOutlinedInput-root": { bgcolor: "var(--surface-card)" },
            }}
          >
            <MenuItem value="">{tLocation("allDistricts")}</MenuItem>
            {districts.map((d) => (
              <MenuItem key={d.id} value={String(d.id)}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2.5 }}>
          <TextField
            select
            size="small"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            label={t("categoryFilter")}
            sx={{
              flex: 1,
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
              flex: 1,
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
          {(type === "sell" || type === "rent" || type === "all") && (
            <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder={t("priceMin")}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                slotProps={{ htmlInput: { min: 0 } }}
                sx={{
                  "& .MuiOutlinedInput-root": { bgcolor: "var(--surface-card)" },
                }}
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder={t("priceMax")}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                slotProps={{ htmlInput: { min: 0 } }}
                sx={{
                  "& .MuiOutlinedInput-root": { bgcolor: "var(--surface-card)" },
                }}
              />
            </Stack>
          )}
        </Stack>

        {error ? (
          <Box
            sx={{
              py: 4,
              textAlign: "center",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 3,
              bgcolor: "var(--surface-card)",
            }}
          >
            {error}
          </Box>
        ) : (
          <>
            <BookRowGrid
              books={books}
              loading={loading}
              skeletonCount={6}
              showTypeBadge={showTypeBadge}
              emptyState={
                <Box
                  sx={{
                    py: 6,
                    textAlign: "center",
                    color: "var(--text-muted)",
                    border: "1px dashed var(--border-subtle)",
                    borderRadius: 3,
                  }}
                >
                  <Icon
                    className="ph ph-book-open"
                    style={{ fontSize: 40, display: "inline-block", marginBottom: 8 }}
                    aria-hidden="true"
                  />
                  <Typography>{t("noResults")}</Typography>
                </Box>
              }
            />

            {/* Infinite-scroll trigger + spinner. The sentinel sits ~400px
                below the last card (see observer rootMargin) so the next
                page is already loading before the user hits the bottom. */}
            {!loading && hasMore && (
              <Box
                ref={sentinelRef}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: 4,
                  minHeight: 48,
                }}
              >
                {loadingMore && <CircularProgress size={28} />}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default CommunityBooksPage;
