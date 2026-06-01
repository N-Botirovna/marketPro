"use client";

import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Box } from "@mui/material";
import { PIN_ICON } from "@/components/shared/mapPin";

/**
 * Read-only map showing a single shop's location. Returns null when the shop
 * has no `point`. Touches `window` through Leaflet, so consumers MUST load it
 * with `dynamic(() => import(...), { ssr: false })`.
 *
 * `point` is `{ latitude, longitude }` (the shape the API's PointField returns).
 */
const LocationMap = ({ point, height = 220, zoom = 15 }) => {
  if (!point || typeof point.latitude !== "number" || typeof point.longitude !== "number") {
    return null;
  }
  const pos = [point.latitude, point.longitude];
  return (
    <Box
      sx={{ height, borderRadius: 2, overflow: "hidden", border: "1px solid var(--border-subtle)" }}
    >
      <MapContainer
        center={pos}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={pos} icon={PIN_ICON} />
      </MapContainer>
    </Box>
  );
};

export default LocationMap;
