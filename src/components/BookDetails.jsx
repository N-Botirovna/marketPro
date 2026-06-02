"use client";

import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Box,
  Stack,
  Chip,
  Typography,
  Button,
  Divider,
  Avatar,
  Skeleton,
  IconButton,
} from "@mui/material";
import { getBookById } from "@/services/books";
import { useLike } from "@/hooks/useLike";
import { useAuth } from "@/hooks/useAuth";
import { openShareSheet } from "@/lib/shareSheet";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { localizedField } from "@/utils/localizedField";
import { bookTypeVisual, bookTypeI18nKey } from "@/utils/bookType";
import { bookLanguageKey } from "@/utils/bookLanguage";
import { Link } from "@/i18n/navigation";
import Icon from "@/components/Icon";
import BookCreateModal from "./BookCreateModal";
import { useToast } from "./Toast";

const BookDetails = ({ bookId }) => {
  const locale = useLocale();
  const tBook = useTranslations("BookDetails");
  const tLang = useTranslations("BookLanguages");
  const tCommon = useTranslations("Common");
  const tButtons = useTranslations("Buttons");
  const tShare = useTranslations("Share");

  const { isAuthenticated } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { liked, count: likeCount, liking, toggle, sync } = useLike(null, false, 0);

  // ── Fetch ────────────────────────────────────────────────────────────
  // Only `bookId` should trigger a re-fetch. `sync` and `tBook` are stable
  // for the lifetime of this component (sync is useCallback'd in useLike;
  // tBook from next-intl is locale-stable) — listing them in deps caused
  // a re-fetch loop that made the page flicker as it cycled
  // setLoading(true) → render → fetch → setBook → render → re-run effect.
  useEffect(() => {
    if (!bookId) return undefined;
    let alive = true;

    setLoading(true);
    setError(null);

    getBookById(bookId)
      .then((res) => {
        if (!alive) return;
        const data = res.book;
        setBook(data);
        sync(data?.id, data?.is_liked, data?.like_count);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message || tBook("loadError"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see comment above
  }, [bookId]);

  // ── Locale-aware field reader ────────────────────────────────────────
  // Backend modeltranslation publishes `name`, `name_uz`, `name_ru`,
  // `name_en` etc. Prefer the active locale, fall back to default, then
  // the raw field — matches the home feed behaviour.
  const localized = (prefix) => {
    if (!book) return "";
    return book[`${prefix}_${locale}`] || book[`${prefix}_uz`] || book[prefix] || "";
  };

  // ── Helpers ──────────────────────────────────────────────────────────
  const formatPrice = (price) => new Intl.NumberFormat(locale).format(Number(price) || 0);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  const conditionLabel = (cond, isUsedFallback) => {
    if (cond === "brand_new") return tBook("conditionBrandNew");
    if (cond === "like_new") return tBook("conditionLikeNew");
    if (cond === "good") return tBook("conditionGood");
    // Legacy `is_used` flag — back-compat for rows pre-condition migration.
    return isUsedFallback ? tBook("conditionLikeNew") : tBook("conditionBrandNew");
  };

  const scriptLabel = (s) =>
    s === "latin"
      ? tBook("latin")
      : s === "cyrillic"
        ? tBook("cyrillic")
        : s === "arabic"
          ? tBook("arabic")
          : s || "—";

  const coverLabel = (c) =>
    c === "hard" ? tBook("hardCover") : c === "soft" ? tBook("softCover") : c || "—";

  // ── Like ─────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast({
        type: "info",
        title: tCommon("info"),
        message: tBook("likeRequiresAuth"),
        duration: 3000,
      });
      return;
    }
    if (!book) return;
    try {
      const res = await toggle(book.id);
      if (res) {
        setBook((prev) => ({ ...prev, is_liked: res.isLiked, like_count: res.count }));
      }
    } catch {
      showToast({
        type: "error",
        title: tCommon("error"),
        message: tBook("likeFailed"),
        duration: 3000,
      });
    }
  };

  // ── Share ────────────────────────────────────────────────────────────
  const handleShare = () => {
    if (!book) return;
    const bookTitle = localizedField(book, "name", locale) || tBook("untitled");
    openShareSheet({
      title: bookTitle,
      text: `${bookTitle} — Kitobzor`,
      url: typeof window !== "undefined" ? window.location.pathname : "",
    });
  };

  // ── Loading / error / empty ──────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ maxWidth: 980, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2.5, md: 4 }}>
          <Skeleton
            variant="rounded"
            sx={{
              width: { xs: "100%", md: 320 },
              height: { xs: 320, md: 440 },
              flexShrink: 0,
              borderRadius: 3,
            }}
          />
          <Stack spacing={1.5} sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="80%" height={36} />
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="rounded" height={48} sx={{ mt: 2 }} />
          </Stack>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 5, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!book) {
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 5, textAlign: "center" }}>
        <Typography sx={{ color: "var(--text-muted)" }}>{tBook("notFound")}</Typography>
      </Box>
    );
  }

  // ── Derived ──────────────────────────────────────────────────────────
  const typeKey = (book.type || "").toLowerCase();
  const visual = bookTypeVisual(typeKey);
  const typeText = tBook(bookTypeI18nKey(typeKey) || "sell");
  const isMonetary = typeKey === "seller" || typeKey === "rent";

  const tg = book?.posted_by?.telegram_username;
  const phone = book?.posted_by?.app_phone_number || book?.posted_by?.phone_number || null;
  const tgHandle = tg ? tg.replace(/^@/, "") : null;
  const phoneClean = phone ? phone.replace(/\s/g, "") : null;
  // next-intl resolves the `{name}` placeholder when the values dict is
  // passed inline. Doing a manual `.replace("{name}", ...)` made the call
  // arity-mismatch in next-intl v4 and the helper returned the raw key
  // path ("BookDetails.contactPrefill") instead of the formatted string.
  const contactBody = encodeURIComponent(tBook("contactPrefill", { name: book?.name || "" }));
  const tgUrl = tgHandle ? `https://t.me/${tgHandle}?text=${contactBody}` : null;

  const ownerName =
    book.shop?.name ||
    [book.posted_by?.first_name, book.posted_by?.last_name].filter(Boolean).join(" ") ||
    tBook("user");
  const ownerSub = book.shop ? tBook("shop") : book.posted_by?.region?.name || tBook("user");
  const ownerPic = book.shop?.picture || book.posted_by?.picture || null;

  const canEdit = Boolean(book.can_update);

  return (
    <Box
      component="section"
      sx={{
        bgcolor: "var(--surface-page)",
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 980, mx: "auto", px: { xs: 2, md: 3 } }}>
        {/* ─── Top: cover + main meta ─────────────────────────────── */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2.5, md: 4 }}
          sx={{ alignItems: "flex-start" }}
        >
          {/* Cover. `objectFit: contain` keeps the whole cover visible —
              never crops the title or author off a tall scan. The soft
              backdrop fills any letterboxed area so it looks intentional. */}
          <Box
            sx={{
              width: { xs: "100%", md: 320 },
              flexShrink: 0,
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "var(--surface-muted)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              aspectRatio: { xs: "3 / 4", md: "auto" },
              minHeight: { md: 440 },
              maxHeight: { md: 520 },
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- already lazy + sized */}
            <img
              src={resolveMediaUrl(book.picture, "/assets/images/thumbs/book-placeholder.png")}
              alt={localized("name") || book.name || ""}
              loading="eager"
              onError={(e) => {
                e.currentTarget.src = "/assets/images/thumbs/book-placeholder.png";
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>

          {/* Right column — title, price, primary actions. */}
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              {visual && (
                <Chip
                  icon={<Icon className={visual.icon} style={{ fontSize: 14 }} />}
                  label={typeText}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: visual.bg,
                    color: visual.color,
                    border: "none",
                    "& .MuiChip-icon": { color: visual.color, ml: "6px" },
                  }}
                />
              )}
              <Chip
                label={conditionLabel(book.condition, book.is_used)}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
              {canEdit && (
                <Chip
                  icon={<Icon className="ph ph-user-check" style={{ fontSize: 14 }} />}
                  label={tBook("ownBookHint")}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "rgba(99, 102, 241, 0.12)",
                    color: "#4338ca",
                    border: "none",
                    "& .MuiChip-icon": { color: "#4338ca", ml: "6px" },
                  }}
                />
              )}
            </Stack>

            <Box>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 22, md: 26 },
                  fontWeight: 700,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                  color: "var(--text-primary)",
                  wordBreak: "break-word",
                }}
              >
                {localized("name") || tBook("bookName")}
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 14,
                  color: "var(--text-secondary)",
                }}
              >
                {localized("author") || tBook("unknownAuthor")}
              </Typography>
            </Box>

            {/* Price / non-monetary state */}
            {isMonetary && book.price ? (
              <Stack
                direction="row"
                spacing={1.25}
                useFlexGap
                sx={{ alignItems: "baseline", flexWrap: "wrap" }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 22, md: 26 },
                    fontWeight: 800,
                    color: "var(--main-600, hsl(148, 59%, 39%))",
                  }}
                >
                  {formatPrice(book.discount_price || book.price)}{" "}
                  <Box
                    component="span"
                    sx={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}
                  >
                    {tCommon("currency")}
                  </Box>
                </Typography>
                {book.discount_price && (
                  <>
                    <Typography
                      sx={{
                        fontSize: 14,
                        color: "var(--text-muted)",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatPrice(book.price)} {tCommon("currency")}
                    </Typography>
                    {book.percentage ? (
                      <Chip
                        label={`−${book.percentage}%`}
                        size="small"
                        sx={{
                          bgcolor: "rgba(239, 68, 68, 0.12)",
                          color: "#b91c1c",
                          fontWeight: 700,
                        }}
                      />
                    ) : null}
                  </>
                )}
              </Stack>
            ) : null}

            {/* Primary actions */}
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              {/* Contact options — show every method the seller actually has,
                  not just one. Telegram only when a USERNAME exists (t.me/<u>
                  is the one link that survives the "forwarded-message" privacy
                  block); otherwise the phone (call + SMS) is the reliable path. */}
              {tgUrl && (
                <Button
                  component="a"
                  href={tgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  startIcon={<Icon className="ph-fill ph-telegram-logo" />}
                  sx={{
                    bgcolor: "#0088cc",
                    textTransform: "none",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#0077b3" },
                    flex: { xs: 1, sm: "0 1 auto" },
                  }}
                >
                  {tBook("telegram")}
                </Button>
              )}
              {isAuthenticated && phoneClean && (
                <Button
                  component="a"
                  href={`tel:${phoneClean}`}
                  variant="contained"
                  startIcon={<Icon className="ph-fill ph-phone" />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    flex: { xs: 1, sm: "0 1 auto" },
                  }}
                >
                  {tBook("call")}
                </Button>
              )}
              {isAuthenticated && phoneClean && (
                <Button
                  component="a"
                  href={`sms:${phoneClean}`}
                  variant="outlined"
                  startIcon={<Icon className="ph ph-chat-circle" />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    flex: { xs: 1, sm: "0 1 auto" },
                  }}
                >
                  {tBook("sms")}
                </Button>
              )}
              {/* Phone (call/SMS) is gated to signed-in users — the API only
                  returns the seller's number when authenticated. Anonymous
                  visitors without a Telegram option get a sign-in prompt. */}
              {!isAuthenticated && !tgUrl && (
                <Button
                  component={Link}
                  href="/login"
                  variant="contained"
                  startIcon={<Icon className="ph ph-lock-key" />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    flex: { xs: 1, sm: "0 1 auto" },
                  }}
                >
                  {tBook("loginToContact")}
                </Button>
              )}

              <IconButton
                onClick={handleShare}
                aria-label={tShare("shareBook")}
                title={tShare("shareBook")}
                sx={{
                  width: 44,
                  height: 44,
                  border: "1px solid var(--border-subtle)",
                  color: "var(--main-700, hsl(148, 59%, 31%))",
                  bgcolor: "var(--surface-card)",
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: "var(--main-50, hsl(148, 59%, 95%))",
                  },
                }}
              >
                <Icon className="ph ph-share-network" />
              </IconButton>

              <IconButton
                onClick={handleLike}
                disabled={liking}
                aria-label={tBook("favorites")}
                sx={{
                  width: 44,
                  height: 44,
                  border: "1px solid var(--border-subtle)",
                  color: liked ? "#dc2626" : "var(--text-secondary)",
                  bgcolor: liked ? "rgba(239, 68, 68, 0.08)" : "var(--surface-card)",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "var(--surface-muted)" },
                }}
              >
                <Icon className={`${liked ? "ph-fill" : "ph"} ph-heart`} />
              </IconButton>

              {canEdit && (
                <IconButton
                  onClick={() => setShowEditModal(true)}
                  aria-label={tButtons("edit")}
                  sx={{
                    width: 44,
                    height: 44,
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)",
                    bgcolor: "var(--surface-card)",
                    borderRadius: 2,
                    "&:hover": { bgcolor: "var(--surface-muted)" },
                  }}
                >
                  <Icon className="ph ph-pencil-simple" />
                </IconButton>
              )}
            </Stack>

            {/* Seller card — one place, no duplicates. */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: "var(--surface-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Avatar
                src={ownerPic || undefined}
                alt={ownerName}
                sx={{ width: 44, height: 44, bgcolor: "var(--surface-muted)" }}
              >
                {ownerName?.[0] || "?"}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ownerName}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ownerSub}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Stack>

        {/* ─── Description ───────────────────────────────────────────── */}
        {(localized("description") || book.description) && (
          <Box sx={{ mt: { xs: 3, md: 5 } }}>
            <SectionHeading icon="ph-fill ph-book-open" text={tBook("aboutBook")} />
            <Typography
              sx={{
                color: "var(--text-secondary)",
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                fontSize: 14.5,
              }}
            >
              {localized("description") || book.description}
            </Typography>
          </Box>
        )}

        {/* ─── Details list — fold of all metadata, single source. ── */}
        <Box sx={{ mt: { xs: 3, md: 4 } }}>
          <SectionHeading icon="ph-fill ph-list-bullets" text={tBook("detailsTitle")} />
          <Box
            sx={{
              borderRadius: 2.5,
              border: "1px solid var(--border-subtle)",
              bgcolor: "var(--surface-card)",
              overflow: "hidden",
            }}
          >
            <DetailRow
              label={tBook("language")}
              value={
                bookLanguageKey(book.language)
                  ? tLang(bookLanguageKey(book.language))
                  : book.language
              }
            />
            <DetailRow label={tBook("scriptType")} value={scriptLabel(book.script_type)} />
            <DetailRow label={tBook("cover")} value={coverLabel(book.cover_type)} />
            <DetailRow label={tBook("publicationYear")} value={book.publication_year} />
            <DetailRow
              label={tBook("pages")}
              value={book.pages ? `${book.pages} ${tBook("pagesUnit")}` : null}
            />
            <DetailRow label={tBook("isbn")} value={book.isbn} />
            <DetailRow label={tBook("postedOn")} value={formatDate(book.created_at)} last />
          </Box>
        </Box>

        {/* ─── Stats — small, contextual ───────────────────────────── */}
        <Stack
          direction="row"
          spacing={3}
          sx={{
            mt: 3,
            color: "var(--text-muted)",
            fontSize: 13,
            flexWrap: "wrap",
            rowGap: 1,
          }}
        >
          {likeCount > 0 && (
            <Stat icon="ph-fill ph-heart" iconColor="#dc2626" text={String(likeCount)} />
          )}
          {book.view_count > 0 && (
            <Stat icon="ph-fill ph-eye" iconColor="#2563eb" text={String(book.view_count)} />
          )}
          {book.comment_count > 0 && (
            <Stat
              icon="ph-fill ph-chat-circle"
              iconColor="#0ea5e9"
              text={String(book.comment_count)}
            />
          )}
        </Stack>

        {/* Edit modal */}
        <BookCreateModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            setBook(updated);
            setShowEditModal(false);
          }}
          editBook={book}
        />
        <ToastContainer />
      </Box>
    </Box>
  );
};

// ── Local presentational helpers ───────────────────────────────────────

const SectionHeading = ({ icon, text }) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        bgcolor: "var(--surface-muted)",
        color: "var(--text-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
      }}
    >
      <Icon className={icon} aria-hidden="true" />
    </Box>
    <Typography component="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
      {text}
    </Typography>
  </Stack>
);

const DetailRow = ({ label, value, last }) => {
  if (value == null || value === "" || value === "—") return null;
  return (
    <Stack
      direction="row"
      sx={{
        px: 1.75,
        py: 1.25,
        borderBottom: last ? "none" : "1px solid var(--border-subtle)",
        gap: 2,
      }}
    >
      <Typography
        sx={{
          flex: "0 0 38%",
          fontSize: 13,
          color: "var(--text-muted)",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          flex: 1,
          fontSize: 13.5,
          fontWeight: 600,
          color: "var(--text-primary)",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
};

const Stat = ({ icon, iconColor, text }) => (
  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
    <Icon className={icon} style={{ color: iconColor, fontSize: 14 }} aria-hidden="true" />
    <span>{text}</span>
  </Stack>
);

export default BookDetails;
