"use client";
import { useEffect } from "react";

const WEIGHTS = ["thin", "light", "duotone"];
const BASE = "https://unpkg.com/@phosphor-icons/web@2.1.1/src/";
const LOADED_ID = "__phosphor_extra_loaded__";

export default function PhosphorIconInit() {
  useEffect(() => {
    if (document.getElementById(LOADED_ID)) return;

    const marker = document.createElement("meta");
    marker.id = LOADED_ID;
    document.head.appendChild(marker);

    WEIGHTS.forEach((weight) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `${BASE}${weight}/style.css`;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}
