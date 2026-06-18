"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchSummary, fetchFunnel, fetchDemand, fetchSupply } from "@/services/admin";

const RANGES = [7, 30, 90];
const CHART_COLORS = ["#6abf7d", "#f4a261", "#4aa3df", "#e9c46a", "#9b8cff", "#ef8a8a"];

// --- small primitives ------------------------------------------------------
function KpiCard({ label, value, accent }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: accent || "text.primary", mt: 0.5 }}>
          {Number(value ?? 0).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}

function Panel({ title, children }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        {title && (
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

// Responsive 12-col-ish grid using CSS grid (no Bootstrap, no MUI Grid v9 churn).
function Cols({ children, min = 240 }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", sm: `repeat(auto-fill, minmax(${min}px, 1fr))` },
      }}
    >
      {children}
    </Box>
  );
}

function HBars({ data }) {
  // data: [{label, value}]
  if (!data?.length) return null;
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} strokeOpacity={0.2} />
        <XAxis type="number" allowDecimals={false} fontSize={12} />
        <YAxis type="category" dataKey="label" width={120} fontSize={12} />
        <Tooltip />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function Donut({ data }) {
  if (!data?.length) return null;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" outerRadius={80} innerRadius={45}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// --- sections --------------------------------------------------------------
function SummarySection({ data, t }) {
  const k = data?.kpis || {};
  const series = data?.series || [];
  return (
    <Stack spacing={2}>
      <Cols>
        <KpiCard label={t("kpi.totalUsers")} value={k.total_users} accent="#4aa3df" />
        <KpiCard label={t("kpi.newUsers")} value={k.new_users} accent="#6abf7d" />
        <KpiCard label={t("kpi.activeBooks")} value={k.active_books} accent="#f4a261" />
        <KpiCard label={t("kpi.newBooks")} value={k.new_books} accent="#6abf7d" />
        <KpiCard label={t("kpi.totalShops")} value={k.total_shops} accent="#9b8cff" />
        <KpiCard label={t("kpi.bannedBooks")} value={k.banned_books} accent="#ef8a8a" />
      </Cols>
      <Panel title={t("growth.title")}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={series} margin={{ left: 0, right: 8 }}>
            <CartesianGrid strokeOpacity={0.2} />
            <XAxis dataKey="date" fontSize={11} minTickGap={24} />
            <YAxis allowDecimals={false} fontSize={11} width={32} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="new_users"
              name={t("growth.newUsers")}
              stroke="#4aa3df"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="new_books"
              name={t("growth.newBooks")}
              stroke="#6abf7d"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="active_users"
              name={t("growth.activeUsers")}
              stroke="#f4a261"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
    </Stack>
  );
}

function FunnelSection({ data, t }) {
  const tot = data?.totals || {};
  const rates = data?.rates || {};
  const steps = [
    { label: t("funnel.views"), value: tot.views || 0 },
    { label: t("funnel.contacts"), value: tot.contacts || 0 },
    { label: t("funnel.shares"), value: tot.shares || 0 },
  ];
  const bySource = data?.by_source || {};
  const sourceData = Object.entries(bySource).map(([src, v]) => ({
    label: src === "bot" ? t("funnel.bot") : t("funnel.web"),
    contact: v.contact || 0,
    gift_share: v.gift_share || 0,
    wish_share: v.wish_share || 0,
  }));
  return (
    <Stack spacing={2}>
      <Cols>
        <KpiCard label={t("funnel.views")} value={tot.views} accent="#4aa3df" />
        <KpiCard label={t("funnel.contacts")} value={tot.contacts} accent="#f4a261" />
        <KpiCard label={t("funnel.shares")} value={tot.shares} accent="#6abf7d" />
        <KpiCard
          label={t("funnel.viewToContact")}
          value={`${rates.view_to_contact ?? 0}%`}
          accent="#9b8cff"
        />
        <KpiCard
          label={t("funnel.viewToShare")}
          value={`${rates.view_to_share ?? 0}%`}
          accent="#9b8cff"
        />
      </Cols>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Panel title={t("tabs.funnel")}>
          <HBars data={steps} />
        </Panel>
        <Panel title={t("funnel.bySource")}>
          <ResponsiveContainer width="100%" height={Math.max(180, sourceData.length * 70)}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeOpacity={0.2} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} width={32} />
              <Tooltip />
              <Legend />
              <Bar dataKey="contact" name={t("funnel.contacts")} fill="#f4a261" />
              <Bar dataKey="gift_share" name={t("funnel.gift")} fill="#6abf7d" />
              <Bar dataKey="wish_share" name={t("funnel.wish")} fill="#4aa3df" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </Box>
    </Stack>
  );
}

function DemandTable({ rows, t, showAvg }) {
  if (!rows?.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("empty")}
      </Typography>
    );
  }
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t("demand.query")}</TableCell>
            <TableCell align="right">{t("demand.count")}</TableCell>
            {showAvg && <TableCell align="right">{t("demand.avgResults")}</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${r.query}-${i}`}>
              <TableCell sx={{ wordBreak: "break-word" }}>{r.query}</TableCell>
              <TableCell align="right">{r.count}</TableCell>
              {showAvg && <TableCell align="right">{r.avg_results}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function DemandSection({ data, t }) {
  return (
    <Stack spacing={2}>
      <Cols>
        <KpiCard label={t("demand.totalSearches")} value={data?.total_searches} accent="#4aa3df" />
        <KpiCard label={t("demand.distinct")} value={data?.distinct_queries} accent="#9b8cff" />
        <KpiCard label={t("demand.gaps")} value={data?.gaps?.length} accent="#ef8a8a" />
      </Cols>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Panel title={t("demand.topSearches")}>
          <DemandTable rows={data?.top_searches} t={t} showAvg />
        </Panel>
        <Panel title={t("demand.gaps")}>
          <DemandTable rows={data?.gaps} t={t} />
        </Panel>
      </Box>
    </Stack>
  );
}

function SupplySection({ data, t }) {
  return (
    <Stack spacing={2}>
      <Cols>
        <KpiCard label={t("kpi.totalBooks")} value={data?.totals?.total} accent="#4aa3df" />
        <KpiCard label={t("kpi.activeBooks")} value={data?.totals?.active} accent="#6abf7d" />
        <KpiCard
          label={t("supply.bannedRatio")}
          value={`${data?.banned_ratio ?? 0}%`}
          accent="#ef8a8a"
        />
      </Cols>
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Panel title={t("supply.byType")}>
          <Donut data={data?.books_by_type} />
        </Panel>
        <Panel title={t("supply.byCondition")}>
          <Donut data={data?.books_by_condition} />
        </Panel>
        <Panel title={t("supply.topSellers")}>
          <HBars data={data?.top_sellers} />
        </Panel>
        <Panel title={t("supply.topShops")}>
          <HBars data={data?.top_shops} />
        </Panel>
        <Panel title={t("supply.topCategories")}>
          <HBars data={data?.top_categories} />
        </Panel>
        <Panel title={t("supply.topRegions")}>
          <HBars data={data?.top_regions} />
        </Panel>
      </Box>
    </Stack>
  );
}

const TABS = [
  { key: "summary", fetcher: fetchSummary, Section: SummarySection },
  { key: "funnel", fetcher: fetchFunnel, Section: FunnelSection },
  { key: "demand", fetcher: fetchDemand, Section: DemandSection },
  { key: "supply", fetcher: fetchSupply, Section: SupplySection },
];

export default function AdminDashboard() {
  const t = useTranslations("Admin");
  const [tab, setTab] = useState(0);
  const [days, setDays] = useState(30);
  const [cache, setCache] = useState({}); // `${key}:${days}` -> data
  const [status, setStatus] = useState("idle"); // idle | loading | error

  const active = TABS[tab];
  const cacheKey = `${active.key}:${days}`;
  const data = cache[cacheKey];

  const load = useCallback(
    (signal) => {
      setStatus("loading");
      active
        .fetcher({ days, signal })
        .then((res) => {
          setCache((prev) => ({ ...prev, [cacheKey]: res }));
          setStatus("idle");
        })
        .catch((err) => {
          if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") return;
          setStatus("error");
        });
    },
    [active, cacheKey, days],
  );

  useEffect(() => {
    if (data !== undefined) return; // already cached for this key
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [data, load]);

  const Section = active.Section;
  const showSection = useMemo(() => data !== undefined, [data]);

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 2, md: 4 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t("title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("subtitle")}
          </Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={days}
          onChange={(_e, v) => v && setDays(v)}
          aria-label={t("subtitle")}
        >
          {RANGES.map((r) => (
            <ToggleButton key={r} value={r}>
              {t(`range.${r}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        {TABS.map((tabDef) => (
          <Tab key={tabDef.key} label={t(`tabs.${tabDef.key}`)} />
        ))}
      </Tabs>

      {status === "error" && (
        <Alert severity="error" sx={{ mb: 2 }} action={<button onClick={() => load()}>↻</button>}>
          {t("error")}
        </Alert>
      )}

      {status === "loading" && !showSection ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        showSection && <Section data={data} t={t} />
      )}
    </Box>
  );
}
