"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  LinearProgress,
  CircularProgress,
  Alert,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { createBook, patchBook } from "@/services/books";
import { getBookCategories } from "@/services/categories";
import { getShopsByOwner } from "@/services/shops";
import { mapValidationError } from "@/lib/mapValidationError";
import { useDraftStorage } from "@/hooks/useDraftStorage";
import { useToast } from "./Toast";
import FieldError from "./FieldError";

// Backend enum values (lowercase, mirroring utils/choices.py on the server).
const BOOK_TYPES = ["seller", "gift", "exchange", "rent"];
const BOOK_CONDITIONS = ["brand_new", "like_new", "good"];
const COVER_TYPES = ["hard", "soft"];
const LANGUAGES = ["uz", "ru", "en", "ar", "tr"];
const SCRIPT_TYPES = ["latin", "cyrillic", "arabic"];

const DEFAULTS = {
  type: "seller",
  condition: "brand_new",
  shop: "", // empty = personal listing
  name: "",
  author: "",
  category: "",
  sub_category: "",
  language: "uz",
  script_type: "latin",
  cover_type: "hard",
  price: "",
  discount_price: "",
  publication_year: "",
  pages: "",
  isbn: "",
  description: "",
  picture: null,
  picture_preview: null, // local-only data URL
};

const TYPE_OPTIONS = [
  { value: "seller", icon: "ph-fill ph-shopping-cart-simple" },
  { value: "gift", icon: "ph-fill ph-gift" },
  { value: "exchange", icon: "ph-fill ph-arrows-clockwise" },
  { value: "rent", icon: "ph-fill ph-clock-clockwise" },
];

const CONDITION_OPTIONS = [
  { value: "brand_new", icon: "ph-fill ph-sparkle" },
  { value: "like_new", icon: "ph-fill ph-star" },
  { value: "good", icon: "ph-fill ph-thumbs-up" },
];

const needsPrice = (type) => type === "seller" || type === "rent";

const CardSelect = ({ options, value, onChange, getLabel, getCaption }) => (
  <Stack spacing={1.25}>
    {options.map((opt) => {
      const selected = opt.value === value;
      return (
        <Box
          key={opt.value}
          component="button"
          type="button"
          onClick={() => onChange(opt.value)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.75,
            borderRadius: 2,
            border: "2px solid",
            borderColor: selected ? "primary.main" : "var(--border-subtle)",
            bgcolor: selected ? "primary.50" : "var(--surface-card)",
            color: "var(--text-primary)",
            cursor: "pointer",
            textAlign: "left",
            transition: "border-color 0.15s ease, background-color 0.15s ease",
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: selected ? "primary.main" : "var(--surface-muted)",
              color: selected ? "#fff" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            <i className={opt.icon} aria-hidden="true" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{getLabel(opt.value)}</Typography>
            {getCaption && (
              <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                {getCaption(opt.value)}
              </Typography>
            )}
          </Box>
          {selected && (
            <i
              className="ph-fill ph-check-circle"
              style={{ fontSize: 20, color: "var(--main-600, hsl(148, 59%, 39%))" }}
              aria-hidden="true"
            />
          )}
        </Box>
      );
    })}
  </Stack>
);

const StepHeading = ({ title, subtitle }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5 }}>{title}</Typography>
    {subtitle && (
      <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
        {subtitle}
      </Typography>
    )}
  </Box>
);

const BookCreateModal = ({ isOpen, onClose, onSuccess, editBook = null }) => {
  const t = useTranslations("BookCreateModal");
  const tCommon = useTranslations("Common");
  const tType = useTranslations("BookTypeChips");
  const { showToast, ToastContainer } = useToast();

  const [formData, setFormData] = useState(DEFAULTS);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({ general: null, fields: {} });
  const [submitting, setSubmitting] = useState(false);

  // Data loaders
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [shops, setShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(false);

  const draftKey = editBook ? `book-edit-draft:${editBook.id}` : "book-create-draft";
  const { draft, clear: clearDraft } = useDraftStorage(draftKey, formData, {
    enabled: isOpen && !editBook,
    excludeKeys: ["picture", "picture_preview"],
  });

  // Restore draft once.
  useEffect(() => {
    if (!isOpen || editBook || !draft) return;
    setFormData((prev) => ({ ...prev, ...draft }));
  }, [isOpen, editBook, draft]);

  // Hydrate from `editBook` once when modal opens.
  useEffect(() => {
    if (!isOpen || !editBook) return;
    setFormData({
      ...DEFAULTS,
      type: editBook.type || "seller",
      condition: editBook.condition || "brand_new",
      shop: editBook.shop?.id ? String(editBook.shop.id) : "",
      name: editBook.name || "",
      author: editBook.author || "",
      category: editBook.category?.id
        ? String(editBook.category.id)
        : editBook.category
          ? String(editBook.category)
          : "",
      sub_category: editBook.sub_category?.id
        ? String(editBook.sub_category.id)
        : editBook.sub_category
          ? String(editBook.sub_category)
          : "",
      language: editBook.language || "uz",
      script_type: editBook.script_type || "latin",
      cover_type: editBook.cover_type || "hard",
      price: editBook.price ?? "",
      discount_price: editBook.discount_price ?? "",
      publication_year: editBook.publication_year ?? "",
      pages: editBook.pages ?? "",
      isbn: editBook.isbn || "",
      description: editBook.description || "",
      picture: null,
      picture_preview: editBook.picture || null,
    });
    setStep(0);
    setErrors({ general: null, fields: {} });
  }, [isOpen, editBook]);

  // Reset on close (only if not editing — let edit preserve until reopen).
  useEffect(() => {
    if (isOpen) return;
    setStep(0);
    setErrors({ general: null, fields: {} });
    if (!editBook) {
      setFormData(DEFAULTS);
    }
  }, [isOpen, editBook]);

  // Load categories (cached for 1h on http.js).
  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    setCategoriesLoading(true);
    getBookCategories({ limit: 100 })
      .then((res) => {
        if (alive) setCategories(res.categories || []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setCategoriesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isOpen]);

  // Load user's shops to allow personal vs shop listings.
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === "undefined") return;
    let alive = true;
    // Pull user id from JWT payload — same trick the legacy modal used.
    let userId = null;
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.user_id || payload.id || null;
      }
    } catch {}
    if (!userId) {
      setShops([]);
      return undefined;
    }
    setShopsLoading(true);
    getShopsByOwner(userId, 20)
      .then((res) => {
        if (alive) setShops(res.shops || []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setShopsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isOpen]);

  // Derived
  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(formData.category)),
    [categories, formData.category],
  );
  // Memoize so the `steps` useMemo on this value doesn't churn on every
  // render (lint warning H-20 cleanup). `selectedCategory` is already
  // stable (it's a useMemo result), so the dep list is honest.
  const subCategories = useMemo(
    () => (Array.isArray(selectedCategory?.subcategories) ? selectedCategory.subcategories : []),
    [selectedCategory],
  );

  const setField = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      fields: { ...prev.fields, [name]: undefined },
    }));
  }, []);

  // Steps definition. Each entry has:
  //   key, title, subtitle, validate(), render()
  // Order mirrors the bot's FSM. Conditional steps (`when`) get auto-skipped.
  const steps = useMemo(() => {
    const list = [
      {
        key: "type",
        title: t("step.typeTitle"),
        subtitle: t("step.typeSubtitle"),
        validate: () => !!formData.type,
        render: () => (
          <CardSelect
            options={TYPE_OPTIONS}
            value={formData.type}
            onChange={(v) => setField("type", v)}
            getLabel={(v) => (v === "seller" ? tType("sell") : tType(v))}
            getCaption={(v) => t(`step.typeCaption.${v}`)}
          />
        ),
      },
      {
        key: "condition",
        title: t("step.conditionTitle"),
        subtitle: t("step.conditionSubtitle"),
        validate: () => !!formData.condition,
        render: () => (
          <CardSelect
            options={CONDITION_OPTIONS}
            value={formData.condition}
            onChange={(v) => setField("condition", v)}
            getLabel={(v) => t(`condition.${v}`)}
            getCaption={(v) => t(`condition.${v}_desc`)}
          />
        ),
      },
      {
        key: "owner",
        when: () => shops.length > 0,
        title: t("step.ownerTitle"),
        subtitle: t("step.ownerSubtitle"),
        validate: () => true,
        render: () => (
          <Stack spacing={1.25}>
            <Box
              component="button"
              type="button"
              onClick={() => setField("shop", "")}
              sx={ownerCardSx(formData.shop === "")}
            >
              <i className="ph-fill ph-user" style={{ fontSize: 22 }} aria-hidden="true" />
              <Box sx={{ ml: 1.5, textAlign: "left" }}>
                <Typography sx={{ fontWeight: 600 }}>{t("step.ownerPersonal")}</Typography>
                <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                  {t("step.ownerPersonalCaption")}
                </Typography>
              </Box>
            </Box>
            {shops.map((shop) => (
              <Box
                key={shop.id}
                component="button"
                type="button"
                onClick={() => setField("shop", String(shop.id))}
                sx={ownerCardSx(String(formData.shop) === String(shop.id))}
              >
                <i className="ph-fill ph-storefront" style={{ fontSize: 22 }} aria-hidden="true" />
                <Box sx={{ ml: 1.5, textAlign: "left", flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>{shop.name}</Typography>
                  {shop.region?.name && (
                    <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                      {shop.region.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        ),
      },
      {
        key: "basics",
        title: t("step.basicsTitle"),
        subtitle: t("step.basicsSubtitle"),
        validate: () => formData.name.trim().length > 0 && formData.author.trim().length > 0,
        render: () => (
          <Stack spacing={2}>
            <Box>
              <TextField
                fullWidth
                label={t("name")}
                value={formData.name}
                onChange={(e) => setField("name", e.target.value)}
                required
                autoFocus
                error={!!errors.fields.name}
              />
              <FieldError message={errors.fields.name} />
            </Box>
            <Box>
              <TextField
                fullWidth
                label={t("author")}
                value={formData.author}
                onChange={(e) => setField("author", e.target.value)}
                required
                error={!!errors.fields.author}
              />
              <FieldError message={errors.fields.author} />
            </Box>
          </Stack>
        ),
      },
      {
        key: "category",
        title: t("step.categoryTitle"),
        subtitle: t("step.categorySubtitle"),
        validate: () => !!formData.category,
        render: () => (
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label={t("category")}
              value={formData.category}
              onChange={(e) => {
                setField("category", e.target.value);
                setField("sub_category", "");
              }}
              required
              disabled={categoriesLoading}
            >
              <MenuItem value="">{categoriesLoading ? t("loading") : t("selectCategory")}</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label={t("subCategory")}
              value={formData.sub_category}
              onChange={(e) => setField("sub_category", e.target.value)}
              disabled={!formData.category || subCategories.length === 0}
              helperText={
                !formData.category
                  ? t("pickCategoryFirst")
                  : subCategories.length === 0
                    ? t("noSubcategories")
                    : t("optional")
              }
            >
              <MenuItem value="">{t("none")}</MenuItem>
              {subCategories.map((sc) => (
                <MenuItem key={sc.id} value={String(sc.id)}>
                  {sc.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        ),
      },
      {
        key: "details",
        title: t("step.detailsTitle"),
        subtitle: t("step.detailsSubtitle"),
        validate: () => !!formData.language && !!formData.script_type && !!formData.cover_type,
        render: () => (
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                label={t("language")}
                value={formData.language}
                onChange={(e) => setField("language", e.target.value)}
                required
              >
                {LANGUAGES.map((l) => (
                  <MenuItem key={l} value={l}>
                    {t(`languages.${l}`)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label={t("scriptType")}
                value={formData.script_type}
                onChange={(e) => setField("script_type", e.target.value)}
                required
              >
                {SCRIPT_TYPES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {t(`scripts.${s}`)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <ToggleButtonGroup
              value={formData.cover_type}
              exclusive
              onChange={(_, v) => v && setField("cover_type", v)}
              fullWidth
              size="small"
            >
              {COVER_TYPES.map((c) => (
                <ToggleButton key={c} value={c} sx={{ textTransform: "none", fontWeight: 600 }}>
                  {t(`covers.${c}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        ),
      },
      {
        key: "pricing",
        when: () => needsPrice(formData.type),
        title: t("step.pricingTitle"),
        subtitle:
          formData.type === "rent" ? t("step.pricingSubtitleRent") : t("step.pricingSubtitleSell"),
        validate: () => {
          if (!needsPrice(formData.type)) return true;
          const price = Number(formData.price);
          if (Number.isNaN(price) || price < 0) return false;
          if (formData.discount_price) {
            const dp = Number(formData.discount_price);
            if (Number.isNaN(dp) || dp < 0 || dp >= price) return false;
          }
          return formData.price !== "";
        },
        render: () => (
          <Stack spacing={2}>
            <Box>
              <TextField
                fullWidth
                type="number"
                label={t("price")}
                value={formData.price}
                onChange={(e) => setField("price", e.target.value)}
                required
                inputProps={{ min: 0, step: "0.01" }}
                InputProps={{
                  endAdornment: (
                    <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                      {tCommon("currency")}
                    </Typography>
                  ),
                }}
              />
              <FieldError message={errors.fields.price} />
            </Box>
            <Box>
              <TextField
                fullWidth
                type="number"
                label={t("discountPrice")}
                value={formData.discount_price}
                onChange={(e) => setField("discount_price", e.target.value)}
                inputProps={{ min: 0, step: "0.01" }}
                helperText={t("discountHelp")}
                InputProps={{
                  endAdornment: (
                    <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                      {tCommon("currency")}
                    </Typography>
                  ),
                }}
              />
              <FieldError message={errors.fields.discount_price} />
            </Box>
          </Stack>
        ),
      },
      {
        key: "optional",
        title: t("step.optionalTitle"),
        subtitle: t("step.optionalSubtitle"),
        validate: () => true,
        render: () => (
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                type="number"
                label={t("publicationYear")}
                value={formData.publication_year}
                onChange={(e) => setField("publication_year", e.target.value)}
                inputProps={{
                  min: 1000,
                  max: new Date().getFullYear() + 1,
                }}
                helperText={t("optional")}
              />
              <TextField
                fullWidth
                type="number"
                label={t("pages")}
                value={formData.pages}
                onChange={(e) => setField("pages", e.target.value)}
                inputProps={{ min: 1 }}
                helperText={t("optional")}
              />
            </Stack>
            <TextField
              fullWidth
              label={t("isbn")}
              value={formData.isbn}
              onChange={(e) => setField("isbn", e.target.value)}
              helperText={t("optional")}
            />
          </Stack>
        ),
      },
      {
        key: "media",
        title: t("step.mediaTitle"),
        subtitle: t("step.mediaSubtitle"),
        validate: () => !!editBook || !!formData.picture,
        render: () => (
          <Stack spacing={2.5}>
            <Box>
              <input
                id="book-photo-input"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setFormData((prev) => ({
                      ...prev,
                      picture: file,
                      picture_preview: ev.target.result,
                    }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <Box
                component="label"
                htmlFor="book-photo-input"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  borderRadius: 2,
                  border: "2px dashed var(--border-strong)",
                  bgcolor: "var(--surface-muted)",
                  p: 3,
                  minHeight: 220,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {formData.picture_preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.picture_preview}
                    alt=""
                    style={{
                      maxWidth: "100%",
                      maxHeight: 280,
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <>
                    <i
                      className="ph ph-image-square"
                      style={{ fontSize: 48, color: "var(--text-muted)" }}
                      aria-hidden="true"
                    />
                    <Typography
                      sx={{
                        mt: 1,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {t("uploadPhoto")}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--text-muted)", mt: 0.5 }}>
                      {t("photoHint")}
                    </Typography>
                  </>
                )}
              </Box>
              <FieldError message={errors.fields.picture} />
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={4}
              maxRows={8}
              label={t("description")}
              value={formData.description}
              onChange={(e) => setField("description", e.target.value)}
              helperText={t("optional")}
            />
          </Stack>
        ),
      },
      {
        key: "review",
        title: t("step.reviewTitle"),
        subtitle: t("step.reviewSubtitle"),
        validate: () => true,
        render: () => (
          <ReviewSection
            formData={formData}
            categories={categories}
            shops={shops}
            t={t}
            tType={tType}
          />
        ),
      },
    ];

    // Filter out steps disabled by `when()`.
    return list.filter((s) => (s.when ? s.when() : true));
  }, [
    formData,
    categories,
    subCategories,
    categoriesLoading,
    shops,
    errors.fields,
    editBook,
    t,
    tCommon,
    tType,
    setField,
  ]);

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const canNext = currentStep ? currentStep.validate() : false;

  const handleNext = () => {
    if (!canNext) return;
    if (isLastStep) {
      handleSubmit();
    } else {
      setStep((s) => Math.min(steps.length - 1, s + 1));
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({ general: null, fields: {} });
    try {
      const fd = new FormData();
      // Required
      fd.append("type", formData.type);
      fd.append("condition", formData.condition);
      fd.append("name", formData.name);
      fd.append("author", formData.author);
      fd.append("language", formData.language);
      fd.append("script_type", formData.script_type);
      fd.append("cover_type", formData.cover_type);
      if (formData.category) fd.append("category", formData.category);
      if (formData.sub_category) fd.append("sub_category", formData.sub_category);

      // Pricing — only when relevant
      if (needsPrice(formData.type)) {
        if (formData.price !== "") fd.append("price", String(formData.price));
        if (formData.discount_price !== "")
          fd.append("discount_price", String(formData.discount_price));
      }

      // Optional
      if (formData.publication_year !== "")
        fd.append("publication_year", String(formData.publication_year));
      if (formData.pages !== "") fd.append("pages", String(formData.pages));
      if (formData.isbn) fd.append("isbn", formData.isbn);
      if (formData.description) fd.append("description", formData.description);

      // Shop / owner
      if (formData.shop) {
        fd.append("shop", String(formData.shop));
      }

      // Photo — required for create, optional for edit
      if (formData.picture) fd.append("picture", formData.picture);

      const response = editBook ? await patchBook(editBook.id, fd) : await createBook(fd);

      if (response.success !== false) {
        showToast({
          type: "success",
          title: tCommon("success"),
          message: editBook ? t("bookUpdated") : t("bookCreated"),
          duration: 3000,
        });
        clearDraft();
        onSuccess?.(response.book);
        onClose?.();
        setFormData(DEFAULTS);
        setStep(0);
      } else {
        setErrors({
          general: response.message || t("error"),
          fields: {},
        });
      }
    } catch (error) {
      const mapped = mapValidationError(error);
      setErrors({
        general: mapped.general || t("error"),
        fields: mapped.fields || {},
      });
      // Jump back to first step with an error so the user sees it.
      const firstErrorStep = findFirstStepWithError(steps, mapped.fields || {});
      if (firstErrorStep >= 0) setStep(firstErrorStep);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          bgcolor: "var(--surface-card)",
          color: "var(--text-primary)",
          height: { xs: "100%", sm: "auto" },
          maxHeight: { xs: "100%", sm: "92vh" },
          m: { xs: 0, sm: 2 },
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, md: 3 },
            py: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            {editBook ? t("editBook") : t("addBook")}
          </Typography>
          <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
            {step + 1} / {steps.length}
          </Typography>
          <IconButton onClick={onClose} aria-label={tCommon("cancel")} size="small">
            <i className="ph ph-x" style={{ fontSize: 18 }} aria-hidden="true" />
          </IconButton>
        </Box>
        <LinearProgress
          variant="determinate"
          value={((step + 1) / steps.length) * 100}
          sx={{ height: 3, bgcolor: "var(--surface-muted)" }}
        />

        <Box
          sx={{
            overflowY: "auto",
            flex: 1,
            px: { xs: 2, md: 3 },
            py: 2.5,
          }}
        >
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}

          {currentStep && (
            <>
              <StepHeading title={currentStep.title} subtitle={currentStep.subtitle} />
              {currentStep.render()}
            </>
          )}
        </Box>

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
            onClick={step === 0 ? onClose : handleBack}
            disabled={submitting}
            sx={{ textTransform: "none", flex: 1 }}
          >
            {step === 0 ? tCommon("cancel") : t("back")}
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canNext || submitting}
            sx={{ textTransform: "none", flex: 2, fontWeight: 600 }}
            startIcon={
              submitting ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : isLastStep ? (
                <i className="ph ph-check" aria-hidden="true" />
              ) : (
                <i className="ph ph-arrow-right" aria-hidden="true" />
              )
            }
          >
            {submitting
              ? t("saving")
              : isLastStep
                ? editBook
                  ? t("save")
                  : t("publish")
                : t("next")}
          </Button>
        </Box>
      </Box>

      <ToastContainer />
    </Dialog>
  );
};

const ownerCardSx = (selected) => ({
  display: "flex",
  alignItems: "center",
  p: 1.75,
  borderRadius: 2,
  border: "2px solid",
  borderColor: selected ? "primary.main" : "var(--border-subtle)",
  bgcolor: selected ? "primary.50" : "var(--surface-card)",
  color: "var(--text-primary)",
  cursor: "pointer",
  textAlign: "left",
  width: "100%",
  transition: "border-color 0.15s ease, background-color 0.15s ease",
});

const findFirstStepWithError = (steps, fieldErrors) => {
  const errorKeys = Object.keys(fieldErrors).filter((k) => fieldErrors[k]);
  if (!errorKeys.length) return -1;
  // Map known fields to step indices.
  const FIELD_TO_STEP = {
    name: "basics",
    author: "basics",
    type: "type",
    condition: "condition",
    category: "category",
    sub_category: "category",
    language: "details",
    script_type: "details",
    cover_type: "details",
    price: "pricing",
    discount_price: "pricing",
    publication_year: "optional",
    pages: "optional",
    isbn: "optional",
    picture: "media",
    description: "media",
  };
  for (const k of errorKeys) {
    const wantedKey = FIELD_TO_STEP[k];
    const idx = steps.findIndex((s) => s.key === wantedKey);
    if (idx >= 0) return idx;
  }
  return -1;
};

const ReviewSection = ({ formData, categories, shops, t, tType }) => {
  const cat = categories.find((c) => String(c.id) === String(formData.category));
  const sub = cat?.subcategories?.find((s) => String(s.id) === String(formData.sub_category));
  const shop = shops.find((s) => String(s.id) === String(formData.shop));
  const rows = [
    { label: t("name"), value: formData.name },
    { label: t("author"), value: formData.author },
    { label: t("bookType"), value: tType(formData.type === "seller" ? "sell" : formData.type) },
    { label: t("conditionLabel"), value: t(`condition.${formData.condition}`) },
    { label: t("category"), value: cat?.name },
    { label: t("subCategory"), value: sub?.name },
    { label: t("language"), value: t(`languages.${formData.language}`) },
    { label: t("scriptType"), value: t(`scripts.${formData.script_type}`) },
    { label: t("coverLabel"), value: t(`covers.${formData.cover_type}`) },
    { label: t("price"), value: formData.price },
    { label: t("discountPrice"), value: formData.discount_price },
    { label: t("publicationYear"), value: formData.publication_year },
    { label: t("pages"), value: formData.pages },
    { label: t("isbn"), value: formData.isbn },
    { label: t("ownerLabel"), value: shop ? shop.name : t("step.ownerPersonal") },
  ].filter((r) => r.value !== "" && r.value != null && r.value !== undefined);

  return (
    <Stack spacing={1.25}>
      {formData.picture_preview && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={formData.picture_preview}
            alt=""
            style={{
              maxWidth: "100%",
              maxHeight: 220,
              borderRadius: 12,
            }}
          />
        </Box>
      )}
      {rows.map((row) => (
        <Stack
          key={row.label}
          direction="row"
          spacing={1.5}
          sx={{
            py: 0.75,
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "var(--text-muted)",
              minWidth: 120,
              fontWeight: 600,
            }}
          >
            {row.label}
          </Typography>
          <Typography sx={{ flex: 1, fontSize: 14 }}>{row.value}</Typography>
        </Stack>
      ))}
    </Stack>
  );
};

export default BookCreateModal;
