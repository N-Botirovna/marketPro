"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Box, Tabs, Tab, Stack, Typography } from "@mui/material";
import { getPolicies } from "@/services/policies";
import { sanitizeHtml } from "@/lib/sanitize";
import Icon from "@/components/Icon";
import Spin from "./Spin";

const POLICY_TYPES = [
  { value: "policy", icon: "ph ph-shield-check" },
  { value: "usage", icon: "ph ph-info" },
];

const looksLikeHtml = (text) => typeof text === "string" && /<[a-z][\s\S]*>/i.test(text);

const PolicyItem = ({ policy }) => {
  const isHtml = looksLikeHtml(policy.description);

  return (
    <Box
      component="article"
      sx={{
        bgcolor: "var(--surface-card)",
        color: "var(--text-primary)",
        borderRadius: 3,
        p: { xs: 2.5, md: 3.5 },
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <Typography component="h2" sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 700, mb: 1.5 }}>
        {policy.title}
      </Typography>
      {isHtml ? (
        <Box
          sx={{
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            "& p": { mb: 1.5 },
            "& h2, & h3, & h4": { mt: 2, mb: 1, color: "var(--text-primary)" },
            "& ul, & ol": { pl: 3, mb: 1.5 },
            "& a": { color: "primary.main", textDecoration: "underline" },
          }}
          /* eslint-disable-next-line no-restricted-syntax -- sanitized via @/lib/sanitize */
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(policy.description || ""),
          }}
        />
      ) : (
        <Typography
          sx={{
            color: "var(--text-secondary)",
            whiteSpace: "pre-line",
            lineHeight: 1.7,
          }}
        >
          {policy.description}
        </Typography>
      )}
    </Box>
  );
};

const PoliciesSection = () => {
  const t = useTranslations("PoliciesPage");
  const [active, setActive] = useState("policy");
  const [byType, setByType] = useState({ policy: null, usage: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    Promise.all([
      getPolicies({ type: "policy", limit: 50 }),
      getPolicies({ type: "usage", limit: 50 }),
    ])
      .then(([policyRes, usageRes]) => {
        if (!alive) return;
        setByType({
          policy: policyRes.policies || [],
          usage: usageRes.policies || [],
        });
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.normalized?.message || err?.message || "Error");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const items = byType[active] || [];

  const counts = useMemo(
    () => ({
      policy: byType.policy?.length ?? 0,
      usage: byType.usage?.length ?? 0,
    }),
    [byType],
  );

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

        <Box
          sx={{
            bgcolor: "var(--surface-card)",
            borderRadius: 3,
            border: "1px solid var(--border-subtle)",
            mb: 3,
            overflow: "hidden",
          }}
        >
          <Tabs
            value={active}
            onChange={(_, value) => setActive(value)}
            variant="fullWidth"
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                color: "var(--text-secondary)",
                minHeight: 48,
              },
              "& .Mui-selected": { color: "var(--text-primary) !important" },
              "& .MuiTabs-indicator": { backgroundColor: "primary.main" },
            }}
          >
            {POLICY_TYPES.map((p) => (
              <Tab
                key={p.value}
                value={p.value}
                label={
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Icon className={p.icon} aria-hidden="true" />
                    <span>{t(`type.${p.value}`)}</span>
                    {counts[p.value] > 0 && (
                      <Box
                        component="span"
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          ml: 0.5,
                        }}
                      >
                        ({counts[p.value]})
                      </Box>
                    )}
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </Box>

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

        {!loading && !error && items.length === 0 && (
          <Box
            sx={{
              py: 6,
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <Icon
              className="ph ph-file-text"
              style={{ fontSize: 48, display: "inline-block", marginBottom: 12 }}
              aria-hidden="true"
            />
            <Typography>{t("empty")}</Typography>
          </Box>
        )}

        {!loading && !error && items.length > 0 && (
          <Stack spacing={2.5}>
            {items.map((policy) => (
              <PolicyItem key={policy.id} policy={policy} />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default PoliciesSection;
