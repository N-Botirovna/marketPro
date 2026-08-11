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
import { getBookById, logBookContact, logBookShare } from "@/services/books";
import { trackEvent } from "@/lib/analytics";
import { useLike } from "@/hooks/useLike";
import { useAuth } from "@/hooks/useAuth";
import { openShareSheet } from "@/lib/shareSheet";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { localizedField } from "@/utils/localizedField";
import { bookTypeVisual, bookTypeI18nKey } from "@/utils/bookType";
import { bookLanguageKey } from "@/utils/bookLanguage";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import Icon from "@/components/Icon";
import { contactPrefillKey, getContactActions } from "@/utils/contactActions";
import { mapValidationError } from "@/lib/mapValidationError";
import EmptyState from "@/components/shared/EmptyState";
import BookCreateModal from "./BookCreateModal";
import MoreFromSellerSection from "./MoreFromSellerSection";
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
  const router = useRouter();
  const pathname = usePathname();
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
        setError(mapValidationError(err).general || tBook("loadError"));
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
    const bookAuthor = localizedField(book, "author", locale);
    trackEvent("book_share", { book_id: book.id });
    openShareSheet({
      title: bookTitle,
      text: bookAuthor
        ? tShare("bookCaption", { name: bookTitle, author: bookAuthor })
        : tShare("bookCaptionNoAuthor", { name: bookTitle }),
      url: typeof window !== "undefined" ? window.location.pathname : "",
    });
  };

  // ── Gift loop ──────────────────────────────────────────────────────────
  // A distribution feature: any visitor (no login needed) can forward this
  // book to a friend either to receive it as a gift (`mode="wish"`) or to gift
  // it to someone (`mode="gift"`). Both open the same share sheet pre-filled
  // with a distinct message; the book link renders a rich Telegram/social
  // preview from the per-book OG image. A fire-and-forget ping also tells the
  // admin channel a warm gift-intent lead exists.
  const handleGift = (mode) => {
    if (!book) return;
    const bookTitle = localizedField(book, "name", locale) || tBook("untitled");
    const text =
      mode === "gift"
        ? tBook("giftGiveText", { name: bookTitle })
        : tBook("giftWishText", { name: bookTitle });
    logBookShare(book.id, mode);
    trackEvent("book_gift_share", { book_id: book.id, mode });
    openShareSheet({
      title: bookTitle,
      text,
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

  // Error and "not found" share one calm, centered empty-state: an icon, a
  // clear message, and a way out (browse all books) so the page is never a
  // dead end.
  if (error || !book) {
    const isError = Boolean(error);
    return (
      <Box sx={{ maxWidth: 560, mx: "auto", px: 2 }}>
        <EmptyState
          icon={isError ? "ph ph-warning-circle" : "ph ph-book-open"}
          title={isError ? error : tBook("notFound")}
        >
          <Button
            component={Link}
            href="/community/all"
            variant="contained"
            disableElevation
            startIcon={<Icon className="ph ph-books" />}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
          >
            {tCommon("viewAll")}
          </Button>
        </EmptyState>
      </Box>
    );
  }

  // ── Derived ──────────────────────────────────────────────────────────
  const typeKey = (book.type || "").toLowerCase();
  const visual = bookTypeVisual(typeKey);
  const typeText = tBook(bookTypeI18nKey(typeKey) || "sell");
  const isMonetary = typeKey === "seller" || typeKey === "rent";
  // A demand post ("I'm looking for this book") carries no condition, price,
  // cover or language — the poster doesn't have the book.
  const isWanted = typeKey === "wanted";

  // Contact is login-gated: the API only returns the seller's phone /
  // telegram handle to authenticated viewers, but the public has_phone /
  // has_telegram booleans let us keep the buttons visible for everyone.
  // Anonymous clicks are intercepted (toast + redirect to /login) instead of
  // opening the channel — see `guardContact` below.
  // next-intl resolves the `{name}` placeholder when the values dict is
  // passed inline. Doing a manual `.replace("{name}", ...)` made the call
  // arity-mismatch in next-intl v4 and the helper returned the raw key
  // path ("BookDetails.contactPrefill") instead of the formatted string.
  // `contactPrefillKey` picks the supply vs demand wording — see its docstring.
  const contactPrefill = tBook(contactPrefillKey(typeKey), { name: book?.name || "" });
  const { hasTelegram, hasPhone, tgUrl, telHref, smsHref } = getContactActions({
    postedBy: book?.posted_by,
    isAuthenticated,
    prefill: contactPrefill,
  });

  // A contact button was tapped. Always fire a (fire-and-forget) channel
  // notification — the backend tags it as a website contact and tells a
  // signed-in buyer apart from an anonymous guest. Signed-in viewers then
  // proceed to the tel:/sms:/t.me link; anonymous viewers are stopped,
  // told to sign in, and bounced to login (preserving where to return to).
  const guardContact = (e) => {
    logBookContact(bookId);
    if (isAuthenticated) return;
    e.preventDefault();
    showToast({
      type: "info",
      title: tBook("loginRequiredTitle"),
      message: tBook("loginRequiredMessage"),
    });
    const next = pathname || "";
    router.push(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  };

  const ownerName =
    book.shop?.name ||
    [book.posted_by?.first_name, book.posted_by?.last_name].filter(Boolean).join(" ") ||
    tBook("user");
  // Backend sends the poster's location as flat `region_name`/`district_name`
  // fields on `posted_by` (UserShortSerializer) — there is no nested
  // `region.name` object, reading that path always came back undefined.
  const ownerLocation = [book.posted_by?.region_name, book.posted_by?.district_name]
    .filter(Boolean)
    .join(", ");
  const ownerSub = book.shop ? tBook("shop") : ownerLocation || tBook("user");
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
      <Box className="kz-fade-up" sx={{ maxWidth: 980, mx: "auto", px: { xs: 2, md: 3 } }}>
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
              {!isWanted && (
                <Chip
                  label={conditionLabel(book.condition, book.is_used)}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}
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

            {/* Demand notice — without it the page reads like an offer, and a
                visitor would tap "contact" expecting to buy the book. */}
            {isWanted && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: "rgba(168, 85, 247, 0.10)",
                  color: "#7e22ce",
                }}
              >
                <Icon className="ph-fill ph-magnifying-glass" style={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {tBook("wantedNotice")}
                </Typography>
              </Stack>
            )}

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
                  for everyone. Contact is login-gated: signed-in viewers get a
                  working tel:/sms:/t.me link; anonymous viewers see the same
                  buttons but a tap is intercepted (toast + redirect to login)
                  via `guardContact`. Button visibility uses the public
                  has_telegram/has_phone booleans so it works pre-login too. */}
              {hasTelegram && (
                <Button
                  component="a"
                  href={isAuthenticated && tgUrl ? tgUrl : "#"}
                  onClick={guardContact}
                  target={isAuthenticated ? "_blank" : undefined}
                  rel={isAuthenticated ? "noopener noreferrer" : undefined}
                  variant="contained"
                  startIcon={<Icon className="ph-fill ph-telegram-logo" />}
                  sx={{
                    bgcolor: "#0088cc",
                    textTransform: "none",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "#0077b3" },
                    flex: { xs: "1 1 auto", sm: "0 1 auto" },
                  }}
                >
                  {tBook("telegram")}
                </Button>
              )}
              {hasPhone && (
                <Button
                  component="a"
                  href={isAuthenticated && telHref ? telHref : "#"}
                  onClick={guardContact}
                  variant="contained"
                  startIcon={<Icon className="ph-fill ph-phone" />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    flex: { xs: "1 1 auto", sm: "0 1 auto" },
                  }}
                >
                  {tBook("call")}
                </Button>
              )}
              {hasPhone && (
                <Button
                  component="a"
                  href={isAuthenticated && smsHref ? smsHref : "#"}
                  onClick={guardContact}
                  variant="outlined"
                  startIcon={<Icon className="ph ph-chat-circle" />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    flex: { xs: "1 1 auto", sm: "0 1 auto" },
                  }}
                >
                  {tBook("sms")}
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

            {/* Gift loop — forward this book to a friend to receive or give as
                a gift. Open to everyone (no login gate): a public link with a
                rich OG preview, plus a warm-lead ping to the admin channel. */}
            <Box
              sx={{
                p: 1.75,
                borderRadius: 2.5,
                border: "1px dashed var(--border-subtle)",
                bgcolor: "var(--surface-card)",
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  mb: 1.25,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  color: "var(--text-primary)",
                }}
              >
                <Icon className="ph-fill ph-gift" style={{ color: "#db2777", fontSize: 16 }} />
                {tBook("giftTitle")}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap>
                <Button
                  onClick={() => handleGift("wish")}
                  variant="outlined"
                  fullWidth
                  startIcon={<Icon className="ph ph-sparkle" />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    justifyContent: "flex-start",
                    color: "var(--text-primary)",
                    borderColor: "var(--border-subtle)",
                    "&:hover": {
                      borderColor: "#db2777",
                      bgcolor: "rgba(219, 39, 119, 0.06)",
                    },
                  }}
                >
                  {tBook("giftWish")}
                </Button>
                <Button
                  onClick={() => handleGift("gift")}
                  variant="outlined"
                  fullWidth
                  startIcon={<Icon className="ph ph-gift" />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    justifyContent: "flex-start",
                    color: "var(--text-primary)",
                    borderColor: "var(--border-subtle)",
                    "&:hover": {
                      borderColor: "#db2777",
                      bgcolor: "rgba(219, 39, 119, 0.06)",
                    },
                  }}
                >
                  {tBook("giftGive")}
                </Button>
              </Stack>
            </Box>

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

        {/* ─── Details list — fold of all metadata, single source. ──
            Shown BEFORE the description: the at-a-glance facts (language,
            cover, year, pages, location…) are what a buyer scans first. */}
        <Box sx={{ mt: { xs: 3, md: 5 } }}>
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
            <DetailRow label={tCommon("location")} value={ownerLocation || null} />
            <DetailRow label={tBook("postedOn")} value={formatDate(book.created_at)} last />
          </Box>
        </Box>

        {/* ─── Description (after the details) ───────────────────────── */}
        {(localized("description") || book.description) && (
          <Box sx={{ mt: { xs: 3, md: 4 } }}>
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

        {/* ─── More from this seller (user or shop) ─────────────────── */}
        <MoreFromSellerSection bookId={book.id} />

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
