"use client";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react";

const languages = [
  { code: "uz", short: "uz" },
  { code: "ru", short: "ru" },
  { code: "en", short: "en" }
];

export default function LanguageSwitcher({ className = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeLocale = useLocale();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = languages.find((l) => l.code === activeLocale);

  const handleChange = (code) => {
    setOpen(false);
    if (code !== activeLocale) router.replace(pathname, { locale: code });
  };

  return (
    <div ref={btnRef} className={`minimal-lang-wrap position-relative ${className}`}>
      <button
        type="button"
        className="d-flex align-items-center px-2 py-1 bg-transparent gap-1"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          border: "none",
          background: "none",
          fontSize: 15,
          fontWeight: 700,
          color: "#191919",
          textTransform: "uppercase",
          letterSpacing: ".5px"
        }}
      >
        <span>{current?.short}</span>
        <span style={{
          fontSize: 13,
          marginLeft: 2,
          color: "#666",
          transform: `rotate(${open ? "180deg" : "0deg"})`,
          transition: "transform 0.18s"
        }}>▼</span>
      </button>
      {open && (
        <div
          className="mt-2 p-1 minimal-lang-dropdown"
          style={{
            position: "absolute",
            right: 0,
            zIndex: 1000,
            background: "#fff",
            borderRadius: 8,
            minWidth: 72,
            boxShadow: "0 2px 14px rgba(0,0,0,0.06)"
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              className="d-flex align-items-center w-100 px-3 py-1"
              style={{
                background: lang.code === activeLocale ? "#f2f2f7" : "transparent",
                fontWeight: lang.code === activeLocale ? 700 : 400,
                color: lang.code === activeLocale ? "#111" : "#444",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                minWidth: 62,
                textTransform: "uppercase",
                letterSpacing: ".5px",
                gap: 4,
                cursor: lang.code === activeLocale ? "default" : "pointer",
                justifyContent: "center"
              }}
              type="button"
              disabled={lang.code === activeLocale}
              onClick={() => handleChange(lang.code)}
            >
              {lang.short}
              {lang.code === activeLocale &&
                <span style={{ marginLeft: 4, fontSize: 14, color: "#2ecc40" }}>✔</span>
              }
            </button>
          ))}
        </div>
      )}
      <style jsx>{`
        .minimal-lang-dropdown button:focus {
          outline: none;
          background: #e8e8e8;
        }
      `}</style>
    </div>
  );
}
