"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/sentry";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    captureException(error, { tags: { boundary: "global" } });
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[global-error]", error);
    }
  }, [error]);

  return (
    <html lang="uz">
      <body>
        <div
          role="alert"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.75rem", marginBottom: 16 }}>Nimadir xato ketdi</h1>
          <p style={{ color: "#555", maxWidth: 480, marginBottom: 24 }}>
            Ilovani qayta yuklang. Agar muammo davom etsa, biz bilan bog{"'"}laning.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "12px 24px",
              fontSize: "1rem",
              borderRadius: 8,
              border: "none",
              background: "#1d4ed8",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Qayta urinish
          </button>
        </div>
      </body>
    </html>
  );
}
