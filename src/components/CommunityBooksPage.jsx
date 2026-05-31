"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Box, Stack, Typography, TextField, MenuItem, InputAdornment } from "@mui/material";
import { getBooks } from "@/services/books";
import { getBookCategories, getBookSubcategories } from "@/services/categories";
import { getRegions } from "@/services/regions";
import BookChatRow from "@/components/shared/BookChatRow";
import Icon from "@/components/Icon";

const CommunityBooksPage = ({ type = "all" }) => {
  const t = useTranslations("CommunityPage");
  const tLocation = useTranslations("Location");
  const searchParams = useSearchParams();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch books on filter change
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    const params = {
      owner_type: "user",
      is_active: true,
      limit: 50,
    };
    if (type && type !== "all") params.type = type;
    if (regionId) params.region = regionId;
    if (districtId) params.district = districtId;
    if (categoryId) params.category = categoryId;
    if (subcategoryId) params.sub_category = subcategoryId;
    if (query.trim()) params.q = query.trim();
    if (priceMin) params.price_min = priceMin;
    if (priceMax) params.price_max = priceMax;

    getBooks(params)
      .then((res) => {
        if (alive) setBooks(res.books || []);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.normalized?.message || err?.message || t("loadError"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [type, regionId, districtId, categoryId, subcategoryId, query, priceMin, priceMax, t]);

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
      <Box sx={{ maxWidth: 880, mx: "auto", px: { xs: 2, md: 3 } }}>
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

        <Box
          sx={{
            bgcolor: "var(--surface-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 3,
            boxShadow: "var(--shadow-card)",
            overflow: "hidden",
          }}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Box
                key={`row-skel-${i}`}
                sx={{
                  height: 76,
                  borderBottom: i === 5 ? "none" : "1px solid var(--border-subtle)",
                  animation: "pulse 1.6s ease-in-out infinite",
                  bgcolor: "var(--surface-card)",
                }}
              />
            ))
          ) : error ? (
            <Box sx={{ py: 4, textAlign: "center", color: "var(--text-secondary)" }}>{error}</Box>
          ) : books.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center", color: "var(--text-muted)" }}>
              <Icon
                className="ph ph-book-open"
                style={{ fontSize: 40, display: "inline-block", marginBottom: 8 }}
                aria-hidden="true"
              />
              <Typography>{t("noResults")}</Typography>
            </Box>
          ) : (
            books.map((book, idx) => (
              <Box
                key={book.id}
                sx={{
                  borderBottom:
                    idx === books.length - 1 ? "none" : "1px solid var(--border-subtle)",
                }}
              >
                <BookChatRow book={book} showTypeBadge={showTypeBadge} />
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CommunityBooksPage;
