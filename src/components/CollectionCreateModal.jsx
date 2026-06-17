"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  TextField,
  Alert,
} from "@mui/material";
import { useTranslations, useLocale } from "next-intl";
import Icon from "@/components/Icon";
import { createCollection } from "@/services/collections";
import { getBooks } from "@/services/books";
import { formatPrice } from "@/utils/formatPrice";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import BookCreateModal from "./BookCreateModal";
import { useToast } from "./Toast";

const effectivePrice = (b) => {
  const v = b?.discount_price || b?.price || 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) ? 0 : n;
};

function currentUserId() {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id || payload.id || null;
  } catch {
    return null;
  }
}

/**
 * Bundle wizard. Reuses BookCreateModal to add a NEW book (same per-book flow
 * as single-book), and an inline picker to add ALREADY-posted standalone
 * books. A bundle needs ≥2 books; the final step takes the bundle price
 * (capped at the sum of the individual prices, with a "cheaper is better"
 * warning).
 */
const CollectionCreateModal = ({ isOpen, onClose, onSuccess, initialShopId = null }) => {
  const t = useTranslations("CollectionCreateModal");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const { showToast, ToastContainer } = useToast();

  const [view, setView] = useState("list"); // list | pick | price
  const [books, setBooks] = useState([]); // chosen member books
  const [bundlePrice, setBundlePrice] = useState("");
  const [newBookOpen, setNewBookOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // existing-book picker
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerBooks, setPickerBooks] = useState([]);
  const [pickerSel, setPickerSel] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setView("list");
      setBooks([]);
      setBundlePrice("");
      setError(null);
      setNewBookOpen(false);
      setPickerSel({});
    }
  }, [isOpen]);

  const originalTotal = useMemo(() => books.reduce((s, b) => s + effectivePrice(b), 0), [books]);
  const chosenIds = useMemo(() => new Set(books.map((b) => b.id)), [books]);

  const addBook = (book) => {
    if (!book || chosenIds.has(book.id)) return;
    setBooks((prev) => [...prev, book]);
  };
  const removeBook = (id) => setBooks((prev) => prev.filter((b) => b.id !== id));

  // ── existing-book picker ──────────────────────────────────────────────
  const openPicker = async () => {
    setView("pick");
    setPickerLoading(true);
    try {
      const params = { standalone: true, is_active: true, limit: 50 };
      if (initialShopId) {
        params.shop = initialShopId;
      } else {
        const uid = currentUserId();
        if (uid) {
          params.posted_by = uid;
          params.owner_type = "user";
        }
      }
      const { books: list } = await getBooks(params);
      setPickerBooks(list || []);
    } catch {
      setPickerBooks([]);
    } finally {
      setPickerLoading(false);
    }
  };

  const confirmPicker = () => {
    const picked = pickerBooks.filter((b) => pickerSel[b.id]);
    picked.forEach(addBook);
    setPickerSel({});
    setView("list");
  };

  // ── submit ────────────────────────────────────────────────────────────
  const goToPrice = () => {
    if (books.length < 2) {
      setError(t("needTwo"));
      return;
    }
    setError(null);
    setView("price");
  };

  const priceNum = bundlePrice === "" ? null : parseFloat(bundlePrice);
  const priceTooHigh = priceNum != null && originalTotal > 0 && priceNum > originalTotal;

  const submit = async () => {
    if (priceTooHigh) {
      setError(t("tooHigh"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await createCollection({
        book_ids: books.map((b) => b.id),
        bundle_price: bundlePrice === "" ? null : bundlePrice,
        shop: initialShopId,
      });
      if (res.success !== false && res.collection) {
        showToast({
          type: "success",
          title: tCommon("success"),
          message: t("created"),
          duration: 3000,
        });
        onSuccess?.(res.collection);
        onClose?.();
      } else {
        setError(res.raw?.result || t("error"));
      }
    } catch (e) {
      setError(e?.normalized?.message || e?.message || t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  const fullScreen = typeof window !== "undefined" && window.innerWidth < 900;

  return (
    <>
      <Dialog
        open={isOpen && !newBookOpen}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        fullScreen={fullScreen}
        PaperProps={{ sx: { borderRadius: { xs: 0, md: 3 } } }}
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}
        >
          <Typography component="span" sx={{ fontWeight: 700, fontSize: 18 }}>
            {view === "price" ? t("priceTitle") : view === "pick" ? t("pickTitle") : t("title")}
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label={tCommon("cancel")}>
            <Icon className="ph ph-x" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* ── LIST VIEW ── */}
          {view === "list" && (
            <Stack spacing={1.5}>
              <Typography variant="body2" sx={{ color: "var(--text-muted)" }}>
                {t("listHint")}
              </Typography>

              {books.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 3, color: "var(--text-muted)" }}>
                  <Icon className="ph ph-stack" style={{ fontSize: 40 }} aria-hidden="true" />
                  <Typography sx={{ mt: 1, fontSize: 14 }}>{t("empty")}</Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {books.map((b, i) => (
                    <Stack
                      key={b.id}
                      direction="row"
                      spacing={1.5}
                      sx={{
                        alignItems: "center",
                        p: 1,
                        borderRadius: 2,
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 52,
                          borderRadius: 1,
                          overflow: "hidden",
                          bgcolor: "var(--surface-muted)",
                          flexShrink: 0,
                        }}
                      >
                        {b.picture && (
                          // eslint-disable-next-line @next/next/no-img-element -- tiny thumb
                          <img
                            src={resolveMediaUrl(b.picture)}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 600, fontSize: 14 }}>
                          {i + 1}. {b.name}
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: "var(--main-600)" }}>
                          {formatPrice(effectivePrice(b), locale)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => removeBook(b.id)}
                        aria-label={tCommon("delete")}
                      >
                        <Icon
                          className="ph ph-trash"
                          style={{ fontSize: 18, color: "var(--danger-600, #dc2626)" }}
                        />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              )}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Icon className="ph ph-plus" />}
                  onClick={() => setNewBookOpen(true)}
                  sx={{ textTransform: "none", borderRadius: 2, flex: 1 }}
                >
                  {t("addNew")}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Icon className="ph ph-books" />}
                  onClick={openPicker}
                  sx={{ textTransform: "none", borderRadius: 2, flex: 1 }}
                >
                  {t("addExisting")}
                </Button>
              </Stack>

              <Button
                variant="contained"
                disabled={books.length < 2}
                onClick={goToPrice}
                sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, mt: 1 }}
              >
                {t("continue")} {books.length >= 2 ? `(${books.length})` : ""}
              </Button>
            </Stack>
          )}

          {/* ── PICK EXISTING VIEW ── */}
          {view === "pick" && (
            <Stack spacing={1}>
              {pickerLoading ? (
                <Typography sx={{ py: 3, textAlign: "center", color: "var(--text-muted)" }}>
                  {tCommon("loading")}
                </Typography>
              ) : pickerBooks.filter((b) => !chosenIds.has(b.id)).length === 0 ? (
                <Typography sx={{ py: 3, textAlign: "center", color: "var(--text-muted)" }}>
                  {t("noExisting")}
                </Typography>
              ) : (
                pickerBooks
                  .filter((b) => !chosenIds.has(b.id))
                  .map((b) => {
                    const sel = !!pickerSel[b.id];
                    return (
                      <Stack
                        key={b.id}
                        direction="row"
                        spacing={1.5}
                        onClick={() => setPickerSel((p) => ({ ...p, [b.id]: !p[b.id] }))}
                        sx={{
                          alignItems: "center",
                          p: 1,
                          borderRadius: 2,
                          cursor: "pointer",
                          border: `1px solid ${sel ? "var(--main-600, #2e7d32)" : "var(--border-subtle)"}`,
                          bgcolor: sel ? "var(--main-50, #e6f4ea)" : "transparent",
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 48,
                            borderRadius: 1,
                            overflow: "hidden",
                            bgcolor: "var(--surface-muted)",
                            flexShrink: 0,
                          }}
                        >
                          {b.picture && (
                            // eslint-disable-next-line @next/next/no-img-element -- tiny thumb
                            <img
                              src={resolveMediaUrl(b.picture)}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography noWrap sx={{ fontWeight: 600, fontSize: 13.5 }}>
                            {b.name}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: "var(--main-600)" }}>
                            {formatPrice(effectivePrice(b), locale)}
                          </Typography>
                        </Box>
                        <Icon
                          className={sel ? "ph-fill ph-check-circle" : "ph ph-circle"}
                          style={{
                            fontSize: 22,
                            color: sel ? "var(--main-600)" : "var(--text-muted)",
                          }}
                        />
                      </Stack>
                    );
                  })
              )}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  variant="text"
                  onClick={() => setView("list")}
                  sx={{ textTransform: "none" }}
                >
                  {tCommon("back")}
                </Button>
                <Button
                  variant="contained"
                  onClick={confirmPicker}
                  disabled={Object.values(pickerSel).every((v) => !v)}
                  sx={{ textTransform: "none", borderRadius: 2, flex: 1 }}
                >
                  {t("addSelected")}
                </Button>
              </Stack>
            </Stack>
          )}

          {/* ── PRICE VIEW ── */}
          {view === "price" && (
            <Stack spacing={2}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "var(--surface-muted)" }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                    {t("sumLabel")}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                    {formatPrice(originalTotal, locale)}
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: 12, color: "var(--text-muted)", mt: 0.5 }}>
                  {t("sumHint", { count: books.length })}
                </Typography>
              </Box>

              <TextField
                label={t("bundlePrice")}
                value={bundlePrice}
                onChange={(e) => setBundlePrice(e.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                fullWidth
                size="small"
                error={priceTooHigh}
                helperText={priceTooHigh ? t("tooHigh") : t("cheaperHint")}
              />

              {priceNum != null &&
                !priceTooHigh &&
                originalTotal > 0 &&
                priceNum < originalTotal && (
                  <Alert severity="success" sx={{ py: 0.5 }}>
                    {t("savings", { amount: formatPrice(originalTotal - priceNum, locale) })}
                  </Alert>
                )}

              <Stack direction="row" spacing={1}>
                <Button
                  variant="text"
                  onClick={() => setView("list")}
                  sx={{ textTransform: "none" }}
                >
                  {tCommon("back")}
                </Button>
                <Button
                  variant="contained"
                  onClick={submit}
                  disabled={submitting || priceTooHigh}
                  sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, flex: 1 }}
                >
                  {submitting ? tCommon("loading") : t("create")}
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* Nested per-book create — reuses the exact single-book flow */}
      {newBookOpen && (
        <BookCreateModal
          isOpen={newBookOpen}
          initialShopId={initialShopId}
          lockShop
          onClose={() => setNewBookOpen(false)}
          onSuccess={(book) => {
            if (book) addBook(book);
            setNewBookOpen(false);
          }}
        />
      )}
      <ToastContainer />
    </>
  );
};

export default CollectionCreateModal;
