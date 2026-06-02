import L from "leaflet";

// A self-contained teardrop pin as an SVG `divIcon` — avoids Leaflet's default
// marker PNGs (which break under bundlers + our CSP). `.kz-map-pin` in
// globals.scss strips Leaflet's default white box around div icons.
export const PIN_ICON = L.divIcon({
  className: "kz-map-pin",
  html: `<svg width="30" height="40" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20s12-11.5 12-20C24 5.373 18.627 0 12 0z" fill="#16a34a"/>
      <circle cx="12" cy="12" r="4.5" fill="#ffffff"/>
    </svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});
