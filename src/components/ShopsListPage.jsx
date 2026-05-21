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
  Chip,
} from "@mui/material";
import { Link } from "@/i18n/navigation";
import { getShops } from "@/services/shops";
import { getRegions } from "@/services/regions";

const formatStar = (value) => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return null;
  return num.toFixed(1);
};

// Backend serializes region/district as nested {id, name} objects. We tolerate
// both `region.name` and the legacy `region_name` flat field so the card stays
// resilient if an older serializer is in production.
const readRegionName = (shop) => shop?.region?.name || shop?.region_name || null;
const readDistrictName = (shop) => shop?.district?.name || shop?.district_name || null;

const ShopCard = ({ shop, t }) => {
  const star = formatStar(shop.star);
  const region = readRegionName(shop);
  const district = readDistrictName(shop);
  const locationLine = [region, district].filter(Boolean).join(" · ");
  const phone = shop.phone_number;

  return (
    <Link
      href={`/shops/${shop.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
      aria-label={shop.name}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: "var(--surface-card)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-card)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "var(--shadow-elevated)",
          },
        }}
      >
        <Box
          sx={{
            width: { xs: 64, md: 72 },
            height: { xs: 64, md: 72 },
            borderRadius: "50%",
            overflow: "hidden",
            bgcolor: "var(--surface-muted)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {shop.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.picture}
              alt={shop.name || ""}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <i
              className="ph-fill ph-storefront"
              style={{ fontSize: 28, color: "var(--text-muted)" }}
              aria-hidden="true"
            />
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ flexWrap: "wrap", rowGap: 0.5 }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 15,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: { xs: "70%", md: "100%" },
              }}
            >
              {shop.name}
            </Typography>
            {star && (
              <Chip
                size="small"
                icon={
                  <i
                    className="ph-fill ph-star"
                    style={{ fontSize: 12, color: "#f59e0b" }}
                    aria-hidden="true"
                  />
                }
                label={star}
                sx={{
                  height: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: "rgba(245, 158, 11, 0.12)",
                  color: "#b45309",
                  "& .MuiChip-icon": { ml: 0.5, mr: -0.25 },
                }}
              />
            )}
            {shop.type && (
              <Chip
                size="small"
                label={t(`shopType.${shop.type}`)}
                sx={{
                  height: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: "var(--surface-muted)",
                  color: "var(--text-secondary)",
                }}
              />
            )}
          </Stack>

          {locationLine && (
            <Typography
              variant="caption"
              sx={{
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mt: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <i className="ph ph-map-pin" style={{ fontSize: 12 }} aria-hidden="true" />
              {locationLine}
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              mt: 0.5,
              alignItems: "center",
              flexWrap: "wrap",
              rowGap: 0.5,
            }}
          >
            {shop.working_hours && (
              <Typography
                variant="caption"
                sx={{
                  color: "var(--text-secondary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <i className="ph ph-clock" style={{ fontSize: 12 }} aria-hidden="true" />
                {shop.working_hours}
              </Typography>
            )}
            {typeof shop.book_count === "number" && (
              <Typography
                variant="caption"
                sx={{
                  color: "var(--text-secondary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <i className="ph ph-books" style={{ fontSize: 12 }} aria-hidden="true" />
                {shop.book_count}
              </Typography>
            )}
            {shop.has_post_service && (
              <Chip
                size="small"
                label={t("postService")}
                icon={<i className="ph ph-package" style={{ fontSize: 12 }} aria-hidden="true" />}
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  bgcolor: "rgba(13, 148, 136, 0.12)",
                  color: "#0d9488",
                  "& .MuiChip-icon": { ml: 0.5 },
                }}
              />
            )}
          </Stack>

          {phone && (
            <Box
              component="span"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.location.href = `tel:${phone.replace(/\s/g, "")}`;
                }
              }}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                mt: 0.5,
                fontSize: 12,
                color: "var(--main-600, hsl(148, 59%, 39%))",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <i className="ph-fill ph-phone" style={{ fontSize: 12 }} aria-hidden="true" />
              {phone}
            </Box>
          )}
        </Box>

        <i
          className="ph ph-caret-right"
          style={{
            fontSize: 18,
            color: "var(--text-muted)",
            flexShrink: 0,
            alignSelf: "center",
          }}
          aria-hidden="true"
        />
      </Stack>
    </Link>
  );
};

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
            InputProps={{
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
              <ShopCard key={shop.id} shop={shop} t={t} />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default ShopsListPage;
