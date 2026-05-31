"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
import { createShop } from "@/services/shopCreate";
import { createShopBanner } from "@/services/shop";
import { mapValidationError } from "@/lib/mapValidationError";
import { isBlank, tooLong, isPhoneE164 } from "@/lib/validation";
import Icon from "@/components/Icon";
import FieldError from "./FieldError";
import { useToast } from "./Toast";
import BannerEditor from "./shop/BannerEditor";

// ─── Working-day model ──────────────────────────────────────────────────────
// Backend stores `working_days` as a free-form string (e.g. "Mon, Wed, Fri").
// We constrain the UI to the 7 ISO weekdays so the value stays parseable
// from the bot/admin too. The persisted format is i18n-stable English short
// codes joined by ", " (e.g. "Mon, Tue, Fri").
const DAY_CODES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Time-range helpers ─────────────────────────────────────────────────────
// Backend stores `working_hours` and `lunch` as strings like "09:00 - 18:00".
// We split / re-join here so the UI can use proper HTML5 <input type="time">
// pickers; falling back gracefully when the source is missing or malformed.
const parseTimeRange = (str) => {
  if (!str || typeof str !== "string") return { start: "", end: "" };
  const m = str.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!m) return { start: "", end: "" };
  return { start: m[1], end: m[2] };
};

const joinTimeRange = ({ start, end }) => (start && end ? `${start} - ${end}` : "");

const SellerRegistrationModal = ({ show, onHide }) => {
  const t = useTranslations("SellerRegistration");
  const tCommon = useTranslations("Common");
  const tv = useTranslations("Validation");
  const tLocation = useTranslations("Location");
  const tDays = useTranslations("Days");
  const tBanner = useTranslations("Banner");
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

  const [pictureUrl, setPictureUrl] = useState(null);
  const [workingDays, setWorkingDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  const [workingHours, setWorkingHours] = useState({ start: "09:00", end: "18:00" });
  const [lunch, setLunch] = useState({ start: "13:00", end: "14:00" });

  // Optional initial banner — collected here so a fresh shop can launch
  // with its first announcement already pinned. Empty draft = skip.
  const [initialBanner, setInitialBanner] = useState({
    title: "",
    description: "",
    picture: null,
  });

  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  // Switches the dialog body to the "thanks, wait for admin" view once
  // creation succeeds — clearer than a 3.5 s toast that disappears.
  const [submittedOk, setSubmittedOk] = useState(false);

  // Reset state whenever the modal opens — operators using the same browser
  // session shouldn't see stale draft data from a previous (e.g. cancelled)
  // registration attempt.
  useEffect(() => {
    if (!show) return;
    setError(null);
    setFieldErrors({});
    setSubmittedOk(false);
  }, [show]);

  // Fetch regions once on first open.
  useEffect(() => {
    if (!show || regions.length > 0) return;
    let alive = true;
    getRegions({ limit: 100 })
      .then((res) => {
        if (alive) setRegions(res.regions || []);
      })
      .catch(() => {
        /* non-critical — user can submit without region, server will reject */
      });
    return () => {
      alive = false;
    };
  }, [show, regions.length]);

  const selectedRegion = useMemo(
    () => regions.find((r) => String(r.id) === String(form.region)),
    [regions, form.region],
  );
  const districts = selectedRegion?.districts || [];

  // Mirror of ShopCreate serializer + users/utils.py phone validator. Returns
  // a localized message or null. Phone is assembled as +998<digits> exactly
  // like handleSubmit does, so the check matches what the API receives.
  const validateSellerField = (name, value) => {
    switch (name) {
      case "name":
        if (isBlank(value)) return tv("required");
        if (tooLong(value, 255)) return tv("maxLength", { max: 255 });
        return null;
      case "bio":
        if (isBlank(value)) return tv("required");
        if (tooLong(value, 500)) return tv("maxLength", { max: 500 });
        return null;
      case "phone_number": {
        if (isBlank(value)) return tv("required");
        const raw = String(value).replace(/[^\d]/g, "").replace(/^998/, "");
        if (!isPhoneE164(`+998${raw}`)) return tv("phoneInvalid");
        return null;
      }
      case "region":
      case "district":
      case "location_text":
        return isBlank(value) ? tv("required") : null;
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
    setFieldErrors((prev) => ({ ...prev, [name]: validateSellerField(name, value) || undefined }));
  };

  const handlePictureSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setField("picture", file);
    const reader = new FileReader();
    reader.onload = (e) => setPictureUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const toggleDay = (code) => {
    setWorkingDays((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleSubmit = async (event) => {
    event?.preventDefault?.();
    setError(null);
    setFieldErrors({});

    // Block before any request when validation fails — mirror the backend so
    // the user fixes the field inline instead of getting a 400.
    const blocking = {};
    [
      "name",
      "bio",
      "phone_number",
      "region",
      "district",
      "location_text",
      "telegram",
      "instagram",
      "website",
    ].forEach((f) => {
      const msg = validateSellerField(f, form[f]);
      if (msg) blocking[f] = msg;
    });
    if (!form.picture) blocking.picture = tv("required");
    if (Object.keys(blocking).length > 0) {
      setFieldErrors(blocking);
      setError(t("fillRequiredFields"));
      return;
    }

    setLoading(true);
    try {
      // The bot strips `+998` before storing, the website prefixes it back
      // before sending; both flows arrive at the same canonical form on the
      // server. Strip first to avoid double-prefixing if the user already
      // typed it.
      const rawPhone = form.phone_number.replace(/[^\d]/g, "").replace(/^998/, "");
      const phone = `+998${rawPhone}`;

      // Sort working days in calendar order so the backend value is stable
      // (helps with idempotent dedup and diffs in the admin).
      const orderedDays = DAY_CODES.filter((d) => workingDays.includes(d));

      const payload = {
        ...form,
        phone_number: phone,
        region: parseInt(form.region, 10),
        district: form.district ? parseInt(form.district, 10) : 0,
        working_days: orderedDays.join(", "),
        working_hours: joinTimeRange(workingHours),
        lunch: joinTimeRange(lunch),
      };

      const result = await createShop(payload);
      if (result.success) {
        // If the operator filled in an initial banner draft, fire its
        // upload right away. We do NOT await this in the critical path —
        // a banner failure shouldn't roll back the (otherwise good)
        // shop registration. The user can re-add the banner later from
        // ShopEditModal if this best-effort save errors.
        const shopId = result?.shop?.result?.id || result?.shop?.id || result?.raw?.result?.id;
        if (shopId && initialBanner.picture) {
          createShopBanner({
            shop: shopId,
            title: initialBanner.title,
            description: initialBanner.description,
            picture: initialBanner.picture,
            is_active: true,
          }).catch(() => {
            showToast({
              type: "info",
              title: tBanner("bannerSaveError"),
              duration: 3000,
            });
          });
        }
        // Don't auto-close — the user needs to see the "admin will reach
        // out" copy. A toast disappears too fast for that message to land.
        setSubmittedOk(true);
      } else {
        const mapped = mapValidationError({ response: { data: result.raw } });
        setFieldErrors(mapped.fields || {});
        setError(result.message || mapped.general || t("error"));
      }
    } catch (err) {
      const mapped = mapValidationError(err);
      setFieldErrors(mapped.fields || {});
      setError(mapped.general || t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={Boolean(show)}
      onClose={loading ? undefined : onHide}
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
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          {submittedOk ? t("successTitle") : t("modalTitle")}
        </Typography>
        <IconButton onClick={onHide} disabled={loading} size="small" aria-label={tCommon("close")}>
          <Icon className="ph ph-x" style={{ fontSize: 18 }} aria-hidden="true" />
        </IconButton>
      </Box>
      <Divider />

      {submittedOk && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            px: { xs: 3, md: 5 },
            py: { xs: 5, md: 6 },
            flex: 1,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: "rgba(34, 197, 94, 0.14)",
              color: "#15803d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2.5,
              fontSize: 36,
            }}
          >
            <Icon className="ph-fill ph-check-circle" aria-hidden="true" />
          </Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 1.25 }}>
            {t("successTitle")}
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.55,
              maxWidth: 380,
            }}
          >
            {t("successBody")}
          </Typography>
          <Button
            variant="contained"
            onClick={onHide}
            sx={{ mt: 4, textTransform: "none", fontWeight: 600, minWidth: 160 }}
          >
            {t("successClose")}
          </Button>
        </Box>
      )}

      {!submittedOk && (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ overflowY: "auto", px: { xs: 2, md: 3 }, py: 2.5, flex: 1 }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* ─── Avatar ────────────────────────────────────────────────── */}
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
                src={pictureUrl || undefined}
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
                  opacity: pictureUrl ? 0 : 1,
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
            <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
              {pictureUrl ? t("pictureChange") : t("pictureUpload")}
              {" *"}
            </Typography>
            <FieldError message={fieldErrors.picture} />
          </Stack>

          {/* ─── Basics ───────────────────────────────────────────────── */}
          <SectionTitle text={t("sectionBasics")} />
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box>
              <TextField
                fullWidth
                size="small"
                label={`${t("name")} *`}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                error={!!fieldErrors.name}
              />
              <FieldError message={fieldErrors.name} />
            </Box>
            <Box>
              <TextField
                fullWidth
                size="small"
                label={t("bio")}
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                multiline
                minRows={2}
                maxRows={4}
                error={!!fieldErrors.bio}
                helperText={fieldErrors.bio ? undefined : t("bioHint")}
              />
              <FieldError message={fieldErrors.bio} />
            </Box>
          </Stack>

          {/* ─── Location ─────────────────────────────────────────────── */}
          <SectionTitle text={t("sectionLocation")} />
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box>
              <TextField
                fullWidth
                size="small"
                label={`${t("phone")} *`}
                value={form.phone_number}
                onChange={(e) => setField("phone_number", e.target.value)}
                placeholder="9X XXX XX XX"
                slotProps={{
                  input: {
                    startAdornment: (
                      <Typography sx={{ color: "var(--text-muted)", mr: 1, fontSize: 14 }}>
                        +998
                      </Typography>
                    ),
                  },
                }}
                error={!!fieldErrors.phone_number}
              />
              <FieldError message={fieldErrors.phone_number} />
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                size="small"
                label={`${t("region")} *`}
                value={form.region}
                onChange={(e) => {
                  setField("region", e.target.value);
                  setField("district", "");
                }}
                error={!!fieldErrors.region}
              >
                <MenuItem value="">{tLocation("selectRegion")}</MenuItem>
                {regions.map((r) => (
                  <MenuItem key={r.id} value={String(r.id)}>
                    {r.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                size="small"
                label={t("district")}
                value={form.district}
                onChange={(e) => setField("district", e.target.value)}
                disabled={!form.region || districts.length === 0}
                error={!!fieldErrors.district}
              >
                <MenuItem value="">{tLocation("selectDistrict")}</MenuItem>
                {districts.map((d) => (
                  <MenuItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Box>
              <TextField
                fullWidth
                size="small"
                label={t("address")}
                value={form.location_text}
                onChange={(e) => setField("location_text", e.target.value)}
                placeholder={t("addressPlaceholder")}
                error={!!fieldErrors.location_text}
              />
              <FieldError message={fieldErrors.location_text} />
            </Box>
          </Stack>

          {/* ─── Working time ─────────────────────────────────────────── */}
          <SectionTitle text={t("sectionHours")} />
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "var(--text-muted)", display: "block", mb: 0.5 }}
              >
                {t("workingDays")}
              </Typography>
              <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap" }}>
                {DAY_CODES.map((code) => {
                  const active = workingDays.includes(code);
                  return (
                    <Chip
                      key={code}
                      label={tDays(code.toLowerCase())}
                      onClick={() => toggleDay(code)}
                      color={active ? "primary" : "default"}
                      variant={active ? "filled" : "outlined"}
                      sx={{
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ color: "var(--text-muted)", display: "block", mb: 0.5 }}
              >
                {t("workingHours")}
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <TextField
                  size="small"
                  type="time"
                  value={workingHours.start}
                  onChange={(e) => setWorkingHours((prev) => ({ ...prev, start: e.target.value }))}
                  slotProps={{ htmlInput: { step: 300 } }}
                  sx={{ flex: 1 }}
                />
                <Typography sx={{ color: "var(--text-muted)" }}>—</Typography>
                <TextField
                  size="small"
                  type="time"
                  value={workingHours.end}
                  onChange={(e) => setWorkingHours((prev) => ({ ...prev, end: e.target.value }))}
                  slotProps={{ htmlInput: { step: 300 } }}
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{ color: "var(--text-muted)", display: "block", mb: 0.5 }}
              >
                {t("lunch")} <span style={{ opacity: 0.6 }}>({tCommon("info")})</span>
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <TextField
                  size="small"
                  type="time"
                  value={lunch.start}
                  onChange={(e) => setLunch((prev) => ({ ...prev, start: e.target.value }))}
                  slotProps={{ htmlInput: { step: 300 } }}
                  sx={{ flex: 1 }}
                />
                <Typography sx={{ color: "var(--text-muted)" }}>—</Typography>
                <TextField
                  size="small"
                  type="time"
                  value={lunch.end}
                  onChange={(e) => setLunch((prev) => ({ ...prev, end: e.target.value }))}
                  slotProps={{ htmlInput: { step: 300 } }}
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={form.has_post_service}
                  onChange={(e) => setField("has_post_service", e.target.checked)}
                />
              }
              label={t("hasPostService")}
            />
          </Stack>

          {/* ─── Social / extra ───────────────────────────────────────── */}
          <SectionTitle text={t("sectionContact")} />
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Telegram"
              value={form.telegram}
              onChange={(e) => setField("telegram", e.target.value)}
              placeholder="@username"
            />
            <TextField
              fullWidth
              size="small"
              label="Instagram"
              value={form.instagram}
              onChange={(e) => setField("instagram", e.target.value)}
              placeholder="@username"
            />
            <TextField
              fullWidth
              size="small"
              label={t("website")}
              value={form.website}
              onChange={(e) => setField("website", e.target.value)}
              placeholder="https://..."
            />
          </Stack>

          {/* ─── Initial banner (optional) ─────────────────────────── */}
          <SectionTitle text={tBanner("initialBannerOptional")} />
          <Typography
            variant="caption"
            sx={{ display: "block", color: "var(--text-muted)", mb: 1.5 }}
          >
            {tBanner("initialBannerHint")}
          </Typography>
          <Box sx={{ mb: 3 }}>
            <BannerEditor
              value={initialBanner}
              onChange={(patch) => setInitialBanner((prev) => ({ ...prev, ...patch }))}
              onPickPicture={(file) => setInitialBanner((prev) => ({ ...prev, picture: file }))}
              disabled={loading}
              compact
            />
          </Box>
        </Box>
      )}

      {!submittedOk && (
        <>
          <Divider />
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              px: { xs: 2, md: 3 },
              py: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={onHide}
              disabled={loading}
              sx={{ textTransform: "none", flex: 1 }}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ textTransform: "none", flex: 2, fontWeight: 600 }}
              startIcon={
                loading ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : (
                  <Icon className="ph ph-check" aria-hidden="true" />
                )
              }
            >
              {loading ? t("submitting") : t("submit")}
            </Button>
          </Box>
        </>
      )}

      <ToastContainer />
    </Dialog>
  );
};

const SectionTitle = ({ text }) => (
  <Typography
    component="h3"
    sx={{
      fontSize: 13,
      fontWeight: 700,
      textTransform: "uppercase",
      color: "var(--text-muted)",
      letterSpacing: 0.5,
      mb: 1.25,
    }}
  >
    {text}
  </Typography>
);

export default SellerRegistrationModal;
