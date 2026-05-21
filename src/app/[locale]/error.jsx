"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { captureException } from "@/lib/sentry";

export default function ErrorBoundary({ error, reset }) {
  const t = useTranslations("Common");

  useEffect(() => {
    captureException(error, { tags: { boundary: "locale" } });
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[error.jsx]", error);
    }
  }, [error]);

  return (
    <div
      role="alert"
      className="container py-80 text-center"
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h1 className="mb-16 text-3xl fw-semibold">
        {t.has("errorTitle") ? t("errorTitle") : "Nimadir xato ketdi"}
      </h1>
      <p className="mb-32 text-gray-600">
        {t.has("errorDescription")
          ? t("errorDescription")
          : "Sahifani qayta yuklang yoki keyinroq qayting."}
      </p>
      <div className="d-flex justify-content-center gap-12">
        <button type="button" onClick={() => reset()} className="btn btn-main btn-lg px-32">
          {t.has("retry") ? t("retry") : "Qayta urinish"}
        </button>
        <Link href="/" className="btn btn-outline-main btn-lg px-32">
          {t.has("goHome") ? t("goHome") : "Bosh sahifa"}
        </Link>
      </div>
    </div>
  );
}
