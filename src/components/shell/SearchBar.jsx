"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Icon from "@/components/Icon";

/**
 * App-shell global search. Submitting routes to the community book list with a
 * `?search=` query — which CommunityBooksPage already seeds its filter state
 * from (src/components/CommunityBooksPage.jsx) and forwards to the books API as
 * `q`, so search works end-to-end without a dedicated results page.
 *
 * Self-contained (owns its router) so any shell surface can drop it in. Width
 * is controlled by the parent slot; the form fills it.
 */
export default function SearchBar({ className = "" }) {
  const t = useTranslations("Header");
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/community/all?search=${encodeURIComponent(term)}` : "/community/all");
  };

  return (
    <form className={`kz-search ${className}`} role="search" onSubmit={submit}>
      <span className="kz-search__icon" aria-hidden="true">
        <Icon className="ph ph-magnifying-glass" />
      </span>
      <input
        type="search"
        className="kz-search__input"
        placeholder={t("searchPlaceholder")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label={t("searchPlaceholder")}
        enterKeyHint="search"
      />

      <style jsx>{`
        .kz-search {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          height: 42px;
          padding: 0 14px;
          background: var(--surface-muted);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-pill, 999px);
          transition:
            border-color var(--dur-fast, 0.15s) var(--ease-out, ease),
            box-shadow var(--dur-fast, 0.15s) var(--ease-out, ease),
            background-color var(--dur-fast, 0.15s) var(--ease-out, ease);
        }
        .kz-search:focus-within {
          background: var(--surface-card);
          border-color: var(--brand);
          box-shadow: var(--ring);
        }
        .kz-search__icon {
          display: inline-flex;
          align-items: center;
          font-size: 19px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .kz-search__input {
          flex: 1;
          min-width: 0;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 14px;
        }
        .kz-search__input::placeholder {
          color: var(--text-muted);
        }
        /* Hide the native search "clear" affordance — the styling is
           inconsistent across browsers and clashes with the pill. */
        .kz-search__input::-webkit-search-decoration,
        .kz-search__input::-webkit-search-cancel-button {
          -webkit-appearance: none;
          appearance: none;
        }
      `}</style>
    </form>
  );
}
