"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, Box, Stack, Typography, IconButton } from "@mui/material";
import { useTranslations } from "next-intl";
import Icon from "@/components/Icon";
import {
  POST_BOOK_MODAL_EVENT,
  POST_BOOK_CHOOSER_EVENT,
  openPostBookModal,
  openPostBookFromShopModal,
} from "@/lib/postBookModal";
import {
  POST_COLLECTION_MODAL_EVENT,
  openPostCollectionModal,
  openPostCollectionFromShopModal,
} from "@/lib/postCollectionModal";

// Both modals are heavy; keep them off the wire until first opened.
const BookCreateModal = dynamic(() => import("./BookCreateModal"), {
  ssr: false,
  loading: () => null,
});
const CollectionCreateModal = dynamic(() => import("./CollectionCreateModal"), {
  ssr: false,
  loading: () => null,
});

// Single chooser → "single book" vs "collection". Lives here so every entry
// point (FAB, shop "add") gets the same pre-question.
function PostChooser({ open, onClose, onPick }) {
  const t = useTranslations("CollectionCreateModal");
  const options = [
    {
      key: "single",
      icon: "ph-fill ph-book",
      title: t("chooseSingle"),
      desc: t("chooseSingleDesc"),
    },
    {
      key: "collection",
      icon: "ph-fill ph-stack",
      title: t("chooseCollection"),
      desc: t("chooseCollectionDesc"),
    },
  ];
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 17 }}>{t("chooseTitle")}</Typography>
          <IconButton size="small" onClick={onClose} aria-label="close">
            <Icon className="ph ph-x" />
          </IconButton>
        </Stack>
        <Stack spacing={1.25}>
          {options.map((o) => (
            <Box
              key={o.key}
              component="button"
              type="button"
              onClick={() => onPick(o.key)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
                textAlign: "left",
                p: 1.75,
                borderRadius: 2.5,
                border: "1px solid var(--border-subtle)",
                bgcolor: "var(--surface-card)",
                cursor: "pointer",
                transition: "border-color 0.15s ease, background 0.15s ease",
                "&:hover": {
                  borderColor: "var(--main-600, #2e7d32)",
                  bgcolor: "var(--main-50, #e6f4ea)",
                },
              }}
            >
              <Icon
                className={o.icon}
                style={{ fontSize: 26, color: "var(--main-600, #2e7d32)" }}
                aria-hidden="true"
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{o.title}</Typography>
                <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                  {o.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default function PostBookMount() {
  const [bookOpen, setBookOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [bookMounted, setBookMounted] = useState(false);
  const [collMounted, setCollMounted] = useState(false);
  const [shopId, setShopId] = useState(null);
  const [chooser, setChooser] = useState({ open: false, shopId: null });

  useEffect(() => {
    const onBook = (e) => {
      setShopId(e?.detail?.shopId ?? null);
      setBookMounted(true);
      setBookOpen(true);
    };
    const onCollection = (e) => {
      setShopId(e?.detail?.shopId ?? null);
      setCollMounted(true);
      setCollectionOpen(true);
    };
    const onChooser = (e) => setChooser({ open: true, shopId: e?.detail?.shopId ?? null });
    window.addEventListener(POST_BOOK_MODAL_EVENT, onBook);
    window.addEventListener(POST_COLLECTION_MODAL_EVENT, onCollection);
    window.addEventListener(POST_BOOK_CHOOSER_EVENT, onChooser);
    return () => {
      window.removeEventListener(POST_BOOK_MODAL_EVENT, onBook);
      window.removeEventListener(POST_COLLECTION_MODAL_EVENT, onCollection);
      window.removeEventListener(POST_BOOK_CHOOSER_EVENT, onChooser);
    };
  }, []);

  const handlePick = (kind) => {
    const sid = chooser.shopId;
    setChooser({ open: false, shopId: null });
    if (kind === "single") {
      sid ? openPostBookFromShopModal(sid) : openPostBookModal();
    } else {
      sid ? openPostCollectionFromShopModal(sid) : openPostCollectionModal();
    }
  };

  return (
    <>
      <PostChooser
        open={chooser.open}
        onClose={() => setChooser({ open: false, shopId: null })}
        onPick={handlePick}
      />
      {bookMounted && (
        <BookCreateModal
          isOpen={bookOpen}
          initialShopId={shopId}
          onClose={() => setBookOpen(false)}
          onSuccess={() => setBookOpen(false)}
        />
      )}
      {collMounted && (
        <CollectionCreateModal
          isOpen={collectionOpen}
          initialShopId={shopId}
          onClose={() => setCollectionOpen(false)}
          onSuccess={() => setCollectionOpen(false)}
        />
      )}
    </>
  );
}
