"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import { Box, Stack, Button, TextField, Typography } from "@mui/material";
import Icon from "@/components/Icon";

// Default view: Tashkent. Used only until the user picks a point.
const TASHKENT = { latitude: 41.3111, longitude: 69.2797 };

// Reports the map's center after each pan/zoom (that's the selected point in
// the Yandex-style fixed-pin model); a tap pans to the tapped point.
function CenterTracker({ onSettle }) {
  const map = useMapEvents({
    moveend() {
      const c = map.getCenter();
      onSettle({ latitude: c.lat, longitude: c.lng });
    },
    click(e) {
      map.panTo(e.latlng);
    },
  });
  return null;
}

// Imperatively flies to `target` — set ONLY by search / "use my location" /
// the initial value, never by the user's own pans, so there is no feedback
// loop with `onSettle`.
function FlyTo({ target }) {
  const map = useMap();
  const last = useRef("");
  useEffect(() => {
    if (!target) return;
    const key = `${target.latitude.toFixed(6)},${target.longitude.toFixed(6)}`;
    if (key === last.current) return;
    last.current = key;
    map.setView([target.latitude, target.longitude], Math.max(map.getZoom(), 16));
  }, [target, map]);
  return null;
}

/**
 * Yandex-style shop-location picker (Leaflet + OpenStreetMap, no API key).
 *
 * A pin is FIXED at the centre of the map; you drag the map (or tap, or
 * search, or use your location) and the point under the pin is the selection.
 * The chosen address is reverse-geocoded and shown, so it's always clear what
 * was picked. Emits `{ latitude, longitude }` via `onChange`.
 *
 * IMPORTANT: there is intentionally NO `<form>` here — this renders inside the
 * shop create/edit `<form>`, and a nested form makes the browser submit the
 * OUTER form (saving + closing the modal) on Enter/search. Search is wired to a
 * button + the Enter key with propagation stopped.
 *
 * Touches `window` through Leaflet, so consumers MUST load it with
 * `dynamic(() => import(...), { ssr: false })`.
 */
const LocationPicker = ({ value, onChange, height = 280 }) => {
  const t = useTranslations("ShopLocation");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [address, setAddress] = useState("");
  const [target, setTarget] = useState(value || null);

  const initialCenter = value || TASHKENT;
  const revTimer = useRef(null);

  const reverseGeocode = useCallback((lat, lng) => {
    if (revTimer.current) clearTimeout(revTimer.current);
    // Debounce — Nominatim asks for ≤1 req/s, and pans fire many moveends.
    revTimer.current = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`,
        { headers: { Accept: "application/json" } },
      )
        .then((r) => r.json())
        .then((d) => setAddress(d?.display_name || ""))
        .catch(() => {});
    }, 600);
  }, []);

  const handleSettle = useCallback(
    (coords) => {
      onChange?.(coords);
      reverseGeocode(coords.latitude, coords.longitude);
    },
    [onChange, reverseGeocode],
  );

  // Reverse-geocode the initial value once so editing an existing point shows
  // its address immediately.
  useEffect(() => {
    if (value) reverseGeocode(value.latitude, value.longitude);
    return () => {
      if (revTimer.current) clearTimeout(revTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const useMyLocation = () => {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError(t("geoUnsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setTarget({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setGeoError(t("geoDenied")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setGeoError("");
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=uz&accept-language=uz&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const list = await res.json();
      if (Array.isArray(list) && list[0]) {
        setAddress(list[0].display_name || "");
        setTarget({ latitude: parseFloat(list[0].lat), longitude: parseFloat(list[0].lon) });
      } else {
        setGeoError(t("searchEmpty"));
      }
    } catch {
      setGeoError(t("searchEmpty"));
    } finally {
      setSearching(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1 }}>
        <Box sx={{ flex: 1, display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              // Keep Enter inside the picker — never let it submit the modal form.
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                runSearch();
              }
            }}
          />
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={searching}
            onClick={runSearch}
          >
            {t("searchBtn")}
          </Button>
        </Box>
        <Button
          type="button"
          onClick={useMyLocation}
          variant="text"
          size="small"
          startIcon={<Icon className="ph ph-crosshair" aria-hidden="true" />}
          sx={{ whiteSpace: "nowrap" }}
        >
          {t("useMyLocation")}
        </Button>
      </Stack>

      <Box
        sx={{
          position: "relative",
          height,
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <MapContainer
          center={[initialCenter.latitude, initialCenter.longitude]}
          zoom={value ? 16 : 12}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CenterTracker onSettle={handleSettle} />
          <FlyTo target={target} />
        </MapContainer>

        {/* Fixed centre pin — the map moves under it; the point beneath the tip
            is the selection. pointer-events:none so it never blocks gestures. */}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -100%)",
            zIndex: 500,
            pointerEvents: "none",
            filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
          }}
        >
          <svg width="34" height="46" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20s12-11.5 12-20C24 5.373 18.627 0 12 0z"
              fill="#16a34a"
            />
            <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
          </svg>
        </Box>
      </Box>

      <Typography sx={{ mt: 0.75, fontSize: 12, color: "var(--text-muted)" }}>
        {t("dragHint")}
      </Typography>
      {address && (
        <Typography sx={{ mt: 0.25, fontSize: 12.5, color: "var(--text-secondary)" }}>
          <strong>{t("addressLabel")}:</strong> {address}
        </Typography>
      )}
      {geoError && (
        <Typography sx={{ fontSize: 12, color: "var(--danger-600, #dc2626)" }}>
          {geoError}
        </Typography>
      )}
    </Box>
  );
};

export default LocationPicker;
