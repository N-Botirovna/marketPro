"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import {
  Dialog,
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";

import { getRegions } from "@/services/regions";
import { updateShop, updateShopLocation } from "@/services/shop";
import { mapValidationError } from "@/lib/mapValidationError";
import { isBlank, tooLong, isPhoneE164 } from "@/lib/validation";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import FieldError from "@/components/FieldError";
import { useToast } from "@/components/Toast";
import Icon from "@/components/Icon";
import ClockTimePicker from "@/components/shared/ClockTimePicker";
import BannerManager from "./BannerManager";

const DAY_CODES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const parseTimeRange = (str) => {
  if (!str || typeof str !== "string") return { start: "", end: "" };
  const m = str.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!m) return { start: "", end: "" };
  return { start: m[1], end: m[2] };
};
const joinTimeRange = ({ start, end }) => (start && end ? `${start} - ${end}` : "");

const parseDays = (raw) => {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter((s) => DAY_CODES.includes(s));
};

/**
 * ShopEditModal — owner-only shop editor.
 *
 * Mirrors SellerRegistrationModal's basic-info layout so a shop owner sees
 * the same shape they signed up with. Embeds BannerManager so banner CRUD
 * happens in the same dialog (no extra navigation, mobile-friendly).
 *
 * Mounted lazily by the shop detail page; only shop owners ever load it.
 */
// Map picker touches `window` (Leaflet) — load it client-only.
const LocationPicker = dynamic(() => import("@/components/shared/LocationPicker"), { ssr: false });

const ShopEditModal = ({ open, shop, onClose, onSaved }) => {
  const t = useTranslations("ShopEdit");
  const tv = useTranslations("Validation");
  const tSeller = useTranslations("SellerRegistration");
  const tCommon = useTranslations("Common");
  const tLocation = useTranslations("Location");
  const tDays = useTranslations("Days");
  const tShopLoc = useTranslations("ShopLocation");
  const { showToast, ToastContainer } = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    phone_number: "",
    region: "",
    district: "",
    location_text: "",
    telegram: "",
    instagram: "",
    website: "",
    has_post_service: false,
    picture: null,
  });
  const [picturePreview, setPicturePreview] = useState(null);
  const [workingDays, setWorkingDays] = useState([]);
  const [workingHours, setWorkingHours] = useState({ start: "09:00", end: "18:00" });
  const [lunch, setLunch] = useState({ start: "13:00", end: "14:00" });
  const [coords, setCoords] = useState(null);

  const [regions, setRegions] = useState([]);
  const [banners, setBanners] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open || !shop) return;
    setError(null);
    setFieldErrors({});
    setForm({
      name: shop.name || "",
      bio: shop.bio || "",
      phone_number: shop.phone_number || "",
      region: shop.region?.id ? String(shop.region.id) : "",
      district: shop.district?.id ? String(shop.district.id) : "",
      location_text: shop.location_text || "",
      telegram: shop.telegram || "",
      instagram: shop.instagram || "",
      website: shop.website || "",
      has_post_service: Boolean(shop.has_post_service),
      picture: null,
    });
    setPicturePreview(null);
    setWorkingDays(parseDays(shop.working_days));
    setWorkingHours(parseTimeRange(shop.working_hours) || { start: "09:00", end: "18:00" });
    setLunch(parseTimeRange(shop.lunch) || { start: "13:00", end: "14:00" });
    setBanners(Array.isArray(shop.banners) ? shop.banners : []);
    setCoords(
      shop.point && typeof shop.point.latitude === "number"
        ? { latitude: shop.point.latitude, longitude: shop.point.longitude }
        : null,
    );
  }, [open, shop]);

  useEffect(() => {
    if (!open || regions.length > 0) return;
    let alive = true;
    getRegions({ limit: 100 })
      .then((res) => {
        if (alive) setRegions(res.regions || []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [open, regions.length]);

  const selectedRegion = useMemo(
    () => regions.find((r) => String(r.id) === String(form.region)),
    [regions, form.region],
  );
  const districts = selectedRegion?.districts || [];

  // Mirror of ShopUpdate serializer (all optional, but format-checked) +
  // users/utils.py phone validator. Phone is optional on edit; only its
  // format is checked when present.
  const validateShopField = (name, value) => {
    switch (name) {
      case "name":
        if (isBlank(value)) return tv("required");
        if (tooLong(value, 255)) return tv("maxLength", { max: 255 });
        return null;
      case "bio":
        return tooLong(value, 500) ? tv("maxLength", { max: 500 }) : null;
      case "phone_number": {
        if (isBlank(value)) return null; // optional on edit
        const raw = String(value).replace(/[^\d]/g, "").replace(/^998/, "");
        return isPhoneE164(`+998${raw}`) ? null : tv("phoneInvalid");
      }
      case "telegram":
      case "instagram":
      case "website":
        return tooLong(value, 77) ? tv("maxLength", { max: 77 }) : null;
      default:
        return null;
    }
  };

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateShopField(name, value) || undefined }));
  };

  const handlePictureSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setField("picture", file);
    const reader = new FileReader();
    reader.onload = (e) => setPicturePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const toggleDay = (code) => {
    setWorkingDays((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleSave = async (event) => {
    event?.preventDefault?.();
    setError(null);
    setFieldErrors({});
    const blocking = {};
    ["name", "bio", "phone_number", "telegram", "instagram", "website"].forEach((f) => {
      const msg = validateShopField(f, form[f]);
      if (msg) blocking[f] = msg;
    });
    if (Object.keys(blocking).length > 0) {
      setFieldErrors(blocking);
      setError(tSeller("fillRequiredFields"));
      return;
    }

    setSaving(true);
    try {
      const rawPhone = form.phone_number.replace(/[^\d]/g, "").replace(/^998/, "");
      const phone = rawPhone ? `+998${rawPhone}` : "";
      const orderedDays = DAY_CODES.filter((d) => workingDays.includes(d));

      const payload = {
        name: form.name,
        bio: form.bio,
        phone_number: phone,
        region: form.region ? parseInt(form.region, 10) : "",
        district: form.district ? parseInt(form.district, 10) : "",
        location_text: form.location_text,
        telegram: form.telegram,
        instagram: form.instagram,
        website: form.website,
        has_post_service: form.has_post_service,
        working_days: orderedDays.join(", "),
        working_hours: joinTimeRange(workingHours),
        lunch: joinTimeRange(lunch),
      };
      if (form.picture) payload.picture = form.picture;

      let saved = await updateShop(shop.id, payload);

      // Geo location goes via a separate JSON PATCH (multipart can't carry the
      // `point` dict). Only when it actually changed; the returned shop carries
      // the new point so the detail view reflects it without a refetch.
      const orig = shop.point;
      const moved =
        coords &&
        (!orig || orig.latitude !== coords.latitude || orig.longitude !== coords.longitude);
      if (moved) {
        try {
          saved = await updateShopLocation(shop.id, coords);
        } catch {
          /* keep the successful text/picture save; location can be retried */
        }
      }

      showToast({
        type: "success",
        title: t("saved"),
        duration: 2200,
      });
      onSaved?.(saved);
      onClose?.();
    } catch (err) {
      const mapped = mapValidationError(err);
      setFieldErrors(mapped.fields || {});
      setError(mapped.general || t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (!shop) return <ToastContainer />;

  const avatarSrc = picturePreview || resolveMediaUrl(shop.picture, "") || undefined;

  return (
    <>
      <Dialog
        open={Boolean(open)}
        onClose={saving ? undefined : onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            bgcolor: "var(--surface-card)",
            color: "var(--text-primary)",
            height: { xs: "100%", sm: "auto" },
            maxHeight: { xs: "100%", sm: "94vh" },
            m: { xs: 0, sm: 2 },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, md: 3 },
            py: 1.75,
          }}
        >
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{t("title")}</Typography>
          <IconButton
            onClick={onClose}
            disabled={saving}
            size="small"
            aria-label={tCommon("close")}
          >
            <Icon className="ph ph-x" style={{ fontSize: 18 }} aria-hidden="true" />
          </IconButton>
        </Box>
        <Divider />

        <Box
          component="form"
          onSubmit={handleSave}
          sx={{ overflowY: "auto", px: { xs: 2, md: 3 }, py: 2.5, flex: 1 }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Avatar */}
          <Stack spacing={1.25} sx={{ alignItems: "center", mb: 3 }}>
            <Box
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              sx={{
                position: "relative",
                cursor: "pointer",
                borderRadius: "50%",
                "&:hover .overlay": { opacity: 1 },
              }}
            >
              <Avatar
                src={avatarSrc}
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: "var(--surface-muted)",
                  fontSize: 40,
                  color: "var(--text-muted)",
                }}
              >
                <Icon className="ph-fill ph-storefront" aria-hidden="true" />
              </Avatar>
              <Box
                className="overlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  bgcolor: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  opacity: 0,
                  transition: "opacity 0.15s ease",
                }}
              >
                <Icon className="ph-fill ph-camera" aria-hidden="true" />
              </Box>
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePictureSelect}
            />
            <FieldError message={fieldErrors.picture} />
          </Stack>

          {/* Basics */}
          <SectionTitle text={t("sectionBasics")} />
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box>
              <TextField
                fullWidth
                size="small"
                label={`${tSeller("name")} *`}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                error={!!fieldErrors.name}
                disabled={saving}
              />
              <FieldError message={fieldErrors.name} />
            </Box>
            <Box>
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label={tSeller("bio")}
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                error={!!fieldErrors.bio}
                disabled={saving}
              />
              <FieldError message={fieldErrors.bio} />
            </Box>
            <Box>
              <TextField
                fullWidth
                size="small"
                label={`${tSeller("phone")} *`}
                placeholder="+998 90 123 45 67"
                value={form.phone_number}
                onChange={(e) => setField("phone_number", e.target.value)}
                error={!!fieldErrors.phone_number}
                disabled={saving}
              />
              <FieldError message={fieldErrors.phone_number} />
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={tLocation("region")}
                  value={form.region}
                  onChange={(e) => {
                    setField("region", e.target.value);
                    setField("district", "");
                  }}
                  error={!!fieldErrors.region}
                  disabled={saving}
                >
                  <MenuItem value="">—</MenuItem>
                  {regions.map((r) => (
                    <MenuItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </MenuItem>
                  ))}
                </TextField>
                <FieldError message={fieldErrors.region} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={tLocation("district")}
                  value={form.district}
                  onChange={(e) => setField("district", e.target.value)}
                  error={!!fieldErrors.district}
                  disabled={saving || !districts.length}
                >
                  <MenuItem value="">—</MenuItem>
                  {districts.map((d) => (
                    <MenuItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>
                <FieldError message={fieldErrors.district} />
              </Box>
            </Stack>
            <Box>
              <TextField
                fullWidth
                size="small"
                label={tSeller("locationText")}
                value={form.location_text}
                onChange={(e) => setField("location_text", e.target.value)}
                disabled={saving}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.25 }}>
                {tShopLoc("mapLabel")}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "var(--text-muted)", mb: 1 }}>
                {tShopLoc("mapHint")}
              </Typography>
              <LocationPicker value={coords} onChange={setCoords} />
            </Box>
          </Stack>

          {/* Socials */}
          <SectionTitle text={tSeller("sectionSocials")} />
          <Stack spacing={2} sx={{ mb: 3 }}>
            <TextField
              size="small"
              fullWidth
              label="Telegram"
              value={form.telegram}
              onChange={(e) => setField("telegram", e.target.value)}
              placeholder="t.me/dokoningiz yoki @username"
              disabled={saving}
            />
            <TextField
              size="small"
              fullWidth
              label="Instagram"
              value={form.instagram}
              onChange={(e) => setField("instagram", e.target.value)}
              placeholder="instagram.com/dokoningiz yoki @username"
              disabled={saving}
            />
            <TextField
              size="small"
              fullWidth
              label={tSeller("website")}
              value={form.website}
              onChange={(e) => setField("website", e.target.value)}
              placeholder="https://dokoningiz.uz"
              disabled={saving}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.has_post_service}
                  onChange={(e) => setField("has_post_service", e.target.checked)}
                  disabled={saving}
                />
              }
              label={tSeller("hasPostService")}
            />
          </Stack>

          {/* Working hours */}
          <SectionTitle text={tSeller("sectionHours")} />
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              {DAY_CODES.map((code) => {
                const active = workingDays.includes(code);
                return (
                  <Chip
                    key={code}
                    label={tDays(code.toLowerCase())}
                    onClick={() => toggleDay(code)}
                    color={active ? "primary" : "default"}
                    variant={active ? "filled" : "outlined"}
                    sx={{ cursor: "pointer" }}
                    disabled={saving}
                  />
                );
              })}
            </Stack>
            <Stack direction="row" spacing={2}>
              <ClockTimePicker
                label={tSeller("hoursStart")}
                value={workingHours.start}
                onChange={(v) => setWorkingHours((prev) => ({ ...prev, start: v }))}
                disabled={saving}
              />
              <ClockTimePicker
                label={tSeller("hoursEnd")}
                value={workingHours.end}
                onChange={(v) => setWorkingHours((prev) => ({ ...prev, end: v }))}
                disabled={saving}
              />
            </Stack>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "var(--text-muted)", display: "block", mb: 0.5 }}
              >
                {tSeller("lunch")}
              </Typography>
              <Stack direction="row" spacing={2}>
                <ClockTimePicker
                  value={lunch.start}
                  onChange={(v) => setLunch((prev) => ({ ...prev, start: v }))}
                  disabled={saving}
                />
                <ClockTimePicker
                  value={lunch.end}
                  onChange={(v) => setLunch((prev) => ({ ...prev, end: v }))}
                  disabled={saving}
                />
              </Stack>
            </Box>
          </Stack>

          {/* Banners */}
          <SectionTitle text={t("sectionBanners")} />
          <Box sx={{ mb: 3 }}>
            <BannerManager
              shopId={shop.id}
              banners={banners}
              onChange={(next) => setBanners(next)}
            />
          </Box>
        </Box>

        <Divider />
        <Stack
          direction="row"
          spacing={1}
          sx={{
            px: { xs: 2, md: 3 },
            py: 1.5,
            justifyContent: "flex-end",
            position: "sticky",
            bottom: 0,
            bgcolor: "var(--surface-card)",
          }}
        >
          <Button type="button" onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
            sx={{ textTransform: "none", fontWeight: 700, minWidth: 120 }}
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </Stack>
      </Dialog>
      <ToastContainer />
    </>
  );
};

const SectionTitle = ({ text }) => (
  <Typography
    sx={{
      fontSize: 11,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: "var(--text-muted)",
      mb: 1,
    }}
  >
    {text}
  </Typography>
);

export default ShopEditModal;
