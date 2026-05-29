"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { getFaqs } from "@/services/faqs";
import Spin from "./Spin";

const normalize = (s) =>
  (s || "").toString().toLocaleLowerCase("uz").normalize("NFKD").replace(/[̀-ͯ]/g, "");

const FaqPage = () => {
  const t = useTranslations("FAQ");
  const tPage = useTranslations("FaqPage");
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getFaqs({ limit: 100 })
      .then((res) => {
        if (!alive) return;
        setFaqs(res.faqs || []);
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
  }, [t]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return faqs;
    return faqs.filter((f) => normalize(f.question).includes(q) || normalize(f.answer).includes(q));
  }, [faqs, query]);

  const handleToggle = (id) => (_, isExpanded) => {
    setExpanded(isExpanded ? id : null);
  };

  return (
    <Box
      sx={{
        bgcolor: "var(--surface-page)",
        color: "var(--text-primary)",
        minHeight: "60vh",
        py: { xs: 3, md: 5 },
      }}
    >
      <Box sx={{ maxWidth: 880, mx: "auto", px: { xs: 2, md: 3 } }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 24, md: 32 },
            fontWeight: 700,
            mb: 1,
            lineHeight: 1.2,
          }}
        >
          {t("title")}
        </Typography>
        <Typography sx={{ color: "var(--text-secondary)", mb: { xs: 2.5, md: 3 } }}>
          {t("subtitle")}
        </Typography>

        <TextField
          fullWidth
          placeholder={tPage("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              bgcolor: "var(--surface-card)",
              borderRadius: 2,
            },
          }}
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
            },
          }}
        />

        {loading && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Spin text={t("loading")} />
          </Box>
        )}

        {!loading && error && (
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: "var(--surface-card)",
              border: "1px solid var(--border-subtle)",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            {error}
          </Box>
        )}

        {!loading && !error && filtered.length === 0 && (
          <Box sx={{ py: 6, textAlign: "center", color: "var(--text-muted)" }}>
            <i
              className="ph ph-question"
              style={{ fontSize: 48, display: "inline-block", marginBottom: 12 }}
              aria-hidden="true"
            />
            <Typography>{query ? tPage("noResults") : t("noQuestions")}</Typography>
          </Box>
        )}

        {!loading && !error && filtered.length > 0 && (
          <Stack spacing={1.5}>
            {filtered.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expanded === faq.id}
                onChange={handleToggle(faq.id)}
                disableGutters
                square={false}
                sx={{
                  bgcolor: "var(--surface-card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px !important",
                  boxShadow: "var(--shadow-card)",
                  "&:before": { display: "none" },
                  "&.Mui-expanded": { my: 0 },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <i
                      className="ph ph-caret-down"
                      style={{ fontSize: 18, color: "var(--text-secondary)" }}
                      aria-hidden="true"
                    />
                  }
                  sx={{
                    px: { xs: 2, md: 3 },
                    py: 1,
                    "& .MuiAccordionSummary-content": {
                      my: 1.5,
                      fontWeight: 600,
                      fontSize: { xs: 15, md: 16 },
                    },
                  }}
                >
                  {faq.question}
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: { xs: 2, md: 3 },
                    pt: 0,
                    pb: 2.5,
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    whiteSpace: "pre-line",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  {faq.answer}
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default FaqPage;
