"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import { getShops } from "@/services/shops";
import { getRegions } from "@/services/regions";
import ShopCard from "@/components/shop/ShopCard";

const ShopsListPage = () => {
  const t = useTranslations("ShopsPage");
  const tLocation = useTranslations("Location");
  const [shops, setShops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");

  useEffect(() => {
    let alive = true;
    getRegions({ limit: 100 })
      .then((res) => {
        if (alive) setRegions(res.regions || []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    const params = { is_active: true, limit: 50 };
    if (regionId) params.region = regionId;
    if (districtId) params.district = districtId;
    if (query.trim()) params.q = query.trim();

    getShops(params)
      .then((res) => {
        if (!alive) return;
        setShops(res.shops || []);
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
  }, [regionId, districtId, query, t]);

  const selectedRegion = useMemo(
    () => regions.find((r) => String(r.id) === regionId),
    [regions, regionId],
  );
  const districts = selectedRegion?.districts || [];

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
            fontSize: { xs: 24, md: 30 },
            fontWeight: 700,
            mb: 1,
            lineHeight: 1.2,
          }}
        >
          {t("title")}
        </Typography>
        <Typography sx={{ color: "var(--text-secondary)", mb: 2.5 }}>{t("subtitle")}</Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2.5 }}>
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
                    <i
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
            onChange={(e) => {
              setRegionId(e.target.value);
              setDistrictId("");
            }}
            label={tLocation("selectRegion")}
            sx={{
              minWidth: { md: 200 },
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
              minWidth: { md: 200 },
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

        {loading && (
          <Stack spacing={1.5}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={96}
                sx={{ bgcolor: "var(--surface-muted)" }}
              />
            ))}
          </Stack>
        )}

        {!loading && error && (
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: "var(--surface-card)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              textAlign: "center",
            }}
          >
            {error}
          </Box>
        )}

        {!loading && !error && shops.length === 0 && (
          <Box sx={{ py: 6, textAlign: "center", color: "var(--text-muted)" }}>
            <i
              className="ph ph-storefront"
              style={{ fontSize: 48, display: "inline-block", marginBottom: 12 }}
              aria-hidden="true"
            />
            <Typography>{t("empty")}</Typography>
          </Box>
        )}

        {!loading && !error && shops.length > 0 && (
          <Stack spacing={1.5}>
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default ShopsListPage;
