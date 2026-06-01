"use client";

import React, { useCallback, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import { Box, Stack, Button, TextField, Typography } from "@mui/material";
import Icon from "@/components/Icon";
import { PIN_ICON } from "@/components/shared/mapPin";

// Default view: Tashkent. Used only until the user picks a point.
const TASHKENT = { latitude: 41.3111, longitude: 69.2797 };

// Drops/moves the pin on map click.
function ClickCapture({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

// Recenters when the value changes programmatically (search / "use my location").
function Recenter({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) map.setView([center.latitude, center.longitude], Math.max(map.getZoom(), 15));
  }, [center, map]);
  return null;
}

/**
 * Interactive shop-location picker (Leaflet + OpenStreetMap, no API key).
 *
 * Tap the map (or drag the pin) to place the shop; "use my location" reads the
 * browser geolocation; the search box geocodes a query via Nominatim (biased to
 * Uzbekistan). Emits `{ latitude, longitude }` via `onChange`.
 *
 * Touches `window` through Leaflet, so consumers MUST load it with
 * `dynamic(() => import(...), { ssr: false })`.
 */
const LocationPicker = ({ value, onChange, height = 260 }) => {
  const t = useTranslations("ShopLocation");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState("");
  const center = value || TASHKENT;

  const handlePick = useCallback((coords) => onChange?.(coords), [onChange]);

  const useMyLocation = () => {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError(t("geoUnsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => handlePick({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setGeoError(t("geoDenied")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const search = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=uz&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const list = await res.json();
      if (Array.isArray(list) && list[0]) {
        handlePick({ latitude: parseFloat(list[0].lat), longitude: parseFloat(list[0].lon) });
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
        <Box component="form" onSubmit={search} sx={{ flex: 1, display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" variant="outlined" size="small" disabled={searching}>
            {t("searchBtn")}
          </Button>
        </Box>
        <Button
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
          height,
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <MapContainer
          center={[center.latitude, center.longitude]}
          zoom={value ? 15 : 12}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCapture onPick={handlePick} />
          <Recenter center={value} />
          {value && (
            <Marker
              position={[value.latitude, value.longitude]}
              icon={PIN_ICON}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = e.target.getLatLng();
                  handlePick({ latitude: ll.lat, longitude: ll.lng });
                },
              }}
            />
          )}
        </MapContainer>
      </Box>

      <Typography sx={{ mt: 0.75, fontSize: 12, color: "var(--text-muted)" }}>
        {value
          ? t("picked", { lat: value.latitude.toFixed(5), lng: value.longitude.toFixed(5) })
          : t("tapHint")}
      </Typography>
      {geoError && (
        <Typography sx={{ fontSize: 12, color: "var(--danger-600, #dc2626)" }}>
          {geoError}
        </Typography>
      )}
    </Box>
  );
};

export default LocationPicker;
