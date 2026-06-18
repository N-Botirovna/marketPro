"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Box,
  Stack,
  Typography,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Link, useRouter } from "@/i18n/navigation";
import Icon from "@/components/Icon";
import { formatPrice } from "@/utils/formatPrice";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import CollectionMontage from "@/components/shared/CollectionMontage";
import {
  getCollectionById,
  deleteCollection,
  detachBookFromCollection,
  moveBookToCollection,
  getCollectionsByUser,
  getCollectionsByShop,
} from "@/services/collections";
import { useToast } from "./Toast";

export default function CollectionDetails({ collectionId }) {
  const t = useTranslations("CollectionDetails");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [managing, setManaging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [moveMenu, setMoveMenu] = useState({ anchor: null, bookId: null });
  const [targets, setTargets] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { collection: c } = await getCollectionById(collectionId);
      setCollection(c);
    } catch {
      setCollection(null);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!collection) {
    return (
      <Box sx={{ textAlign: "center", py: 8, color: "var(--text-muted)" }}>
        <Typography>{t("notFound")}</Typography>
      </Box>
    );
  }

  const books = collection.books || [];
  const covers = (
    collection.covers && collection.covers.length
      ? collection.covers
      : books.map((b) => b.picture).filter(Boolean)
  ).slice(0, 4);
  const bundle = collection.bundle_price;
  const original = collection.original_total;
  const pct = collection.discount_percent;
  const canUpdate = collection.can_update;
  const seller = collection.shop
    ? { kind: "shop", id: collection.shop.id, name: collection.shop.name }
    : collection.posted_by
      ? {
          kind: "user",
          id: collection.posted_by.id,
          name: [collection.posted_by.first_name, collection.posted_by.last_name]
            .filter(Boolean)
            .join(" "),
        }
      : null;

  const openMove = async (e, bookId) => {
    setMoveMenu({ anchor: e.currentTarget, bookId });
    try {
      const res =
        seller?.kind === "shop"
          ? await getCollectionsByShop(seller.id, 50)
          : await getCollectionsByUser(seller?.id, 50);
      setTargets((res.collections || []).filter((c) => c.id !== collection.id));
    } catch {
      setTargets([]);
    }
  };

  const doDetach = async (bookId) => {
    setBusy(true);
    try {
      await detachBookFromCollection(collection.id, bookId);
      showToast({
        type: "success",
        title: tCommon("success"),
        message: t("detached"),
        duration: 2500,
      });
      await load();
    } catch {
      showToast({
        type: "error",
        title: tCommon("error"),
        message: t("actionFailed"),
        duration: 3000,
      });
    } finally {
      setBusy(false);
    }
  };

  const doMove = async (targetId) => {
    const bookId = moveMenu.bookId;
    setMoveMenu({ anchor: null, bookId: null });
    setBusy(true);
    try {
      await moveBookToCollection(collection.id, bookId, targetId);
      showToast({
        type: "success",
        title: tCommon("success"),
        message: t("moved"),
        duration: 2500,
      });
      await load();
    } catch {
      showToast({
        type: "error",
        title: tCommon("error"),
        message: t("actionFailed"),
        duration: 3000,
      });
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (typeof window !== "undefined" && !window.confirm(t("deleteConfirm"))) return;
    setBusy(true);
    try {
      await deleteCollection(collection.id);
      showToast({
        type: "success",
        title: tCommon("success"),
        message: t("deleted"),
        duration: 2500,
      });
      router.push("/collections");
    } catch {
      showToast({
        type: "error",
        title: tCommon("error"),
        message: t("actionFailed"),
        duration: 3000,
      });
      setBusy(false);
    }
  };

  return (
    <Box component="section" sx={{ bgcolor: "var(--surface-page)", py: { xs: 2.5, md: 4 } }}>
      <Box sx={{ maxWidth: 980, mx: "auto", px: { xs: 2, md: 3 } }}>
        {/* Hero */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2.5, md: 4 }}
          sx={{ alignItems: "flex-start" }}
        >
          <Box
            sx={{
              position: "relative",
              width: { xs: "100%", md: 300 },
              aspectRatio: "1 / 1",
              flexShrink: 0,
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "var(--surface-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <CollectionMontage covers={covers} iconSize={56} />
          </Box>

          <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <Chip
              size="small"
              icon={<Icon className="ph-fill ph-stack" style={{ fontSize: 13 }} />}
              label={t("bundleBadge", { count: books.length })}
              sx={{
                alignSelf: "flex-start",
                fontWeight: 700,
                bgcolor: "var(--main-50, #e6f4ea)",
                color: "var(--main-600, #2e7d32)",
              }}
            />
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 20, md: 24 },
                fontWeight: 800,
                lineHeight: 1.25,
                color: "var(--text-primary)",
              }}
            >
              {collection.title || t("untitled")}
            </Typography>

            {bundle != null && bundle !== "" && (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "baseline", flexWrap: "wrap" }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 24, md: 28 },
                    fontWeight: 800,
                    color: "var(--main-600, #2e7d32)",
                  }}
                >
                  {formatPrice(bundle, locale)}
                </Typography>
                {pct ? (
                  <>
                    <Typography
                      sx={{
                        fontSize: 15,
                        color: "var(--text-muted)",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatPrice(original, locale)}
                    </Typography>
                    <Chip
                      size="small"
                      label={t("savePercent", { percent: pct })}
                      sx={{
                        fontWeight: 700,
                        bgcolor: "var(--main-50, #e6f4ea)",
                        color: "var(--main-600, #2e7d32)",
                      }}
                    />
                  </>
                ) : null}
              </Stack>
            )}

            {seller && (
              <Link
                href={seller.kind === "shop" ? `/shops/${seller.id}` : `/user/${seller.id}`}
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--text-secondary)",
                  fontSize: 14,
                }}
              >
                <Icon
                  className={seller.kind === "shop" ? "ph-fill ph-storefront" : "ph-fill ph-user"}
                  style={{ fontSize: 16 }}
                />
                {seller.name}
              </Link>
            )}

            {canUpdate && (
              <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant={managing ? "contained" : "outlined"}
                  startIcon={<Icon className="ph ph-pencil-simple" />}
                  onClick={() => setManaging((m) => !m)}
                  sx={{ textTransform: "none", borderRadius: 999, fontWeight: 700 }}
                >
                  {managing ? t("doneManaging") : t("manage")}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Icon className="ph ph-trash" />}
                  onClick={doDelete}
                  disabled={busy}
                  sx={{ textTransform: "none", borderRadius: 999, fontWeight: 700 }}
                >
                  {t("deleteCollection")}
                </Button>
              </Stack>
            )}
          </Stack>
        </Stack>

        {/* Member books */}
        <Box sx={{ mt: { xs: 3, md: 4 } }}>
          <Typography component="h2" sx={{ fontSize: { xs: 17, md: 20 }, fontWeight: 700, mb: 2 }}>
            {t("memberBooks", { count: books.length })}
          </Typography>
          <Stack spacing={1.25}>
            {books.map((b) => (
              <Stack
                key={b.id}
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  p: 1,
                  borderRadius: 2.5,
                  border: "1px solid var(--border-subtle)",
                  bgcolor: "var(--surface-card)",
                }}
              >
                <Link
                  href={`/book-details/${b.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flex: 1,
                    minWidth: 0,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 62,
                      borderRadius: 1.5,
                      overflow: "hidden",
                      bgcolor: "var(--surface-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {b.picture && (
                      // eslint-disable-next-line @next/next/no-img-element -- thumb
                      <img
                        src={resolveMediaUrl(b.picture)}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: 14,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {b.name}
                    </Typography>
                    {b.author && (
                      <Typography sx={{ fontSize: 12, color: "var(--text-muted)" }} noWrap>
                        {b.author}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: 12.5, color: "var(--main-600)" }}>
                      {formatPrice(b.discount_price || b.price, locale)}
                    </Typography>
                  </Box>
                </Link>
                {managing && canUpdate && (
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => openMove(e, b.id)}
                      disabled={busy}
                      title={t("moveBook")}
                      aria-label={t("moveBook")}
                    >
                      <Icon className="ph ph-arrows-left-right" style={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => doDetach(b.id)}
                      disabled={busy}
                      title={t("detachBook")}
                      aria-label={t("detachBook")}
                    >
                      <Icon
                        className="ph ph-link-break"
                        style={{ fontSize: 18, color: "var(--danger-600, #dc2626)" }}
                      />
                    </IconButton>
                  </Stack>
                )}
              </Stack>
            ))}
          </Stack>
        </Box>

        <Menu
          anchorEl={moveMenu.anchor}
          open={Boolean(moveMenu.anchor)}
          onClose={() => setMoveMenu({ anchor: null, bookId: null })}
        >
          {targets.length === 0 ? (
            <MenuItem disabled>{t("noTargets")}</MenuItem>
          ) : (
            targets.map((tc) => (
              <MenuItem key={tc.id} onClick={() => doMove(tc.id)}>
                {tc.title || `#${tc.id}`}
              </MenuItem>
            ))
          )}
        </Menu>
      </Box>
      <ToastContainer />
    </Box>
  );
}
