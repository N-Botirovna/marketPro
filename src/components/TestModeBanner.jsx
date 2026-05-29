import { getTranslations } from "next-intl/server";

/**
 * Slim "site is in test mode" notice pinned at the very top of the page.
 *
 * The text scrolls horizontally (marquee). It lives in normal document flow
 * above the sticky header, so it shows at the top of the page and scrolls
 * away as the user reads on — no fixed-position fight with the sticky header.
 *
 * Server component: zero client JS. The marquee + reduced-motion fallback are
 * pure CSS (`.test-mode-banner*` in globals.scss). The animated copy is
 * `aria-hidden`; a single visually-hidden copy carries the message for
 * screen readers.
 */
const TestModeBanner = async () => {
  const t = await getTranslations("TestMode");
  const message = t("banner");

  // One "group" = the message repeated a few times so short text still spans
  // the viewport. The track holds two identical groups and slides by exactly
  // one group width (-50%), which loops seamlessly.
  const Group = () => (
    <span className="test-mode-banner__group" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="test-mode-banner__item">
          {message}
        </span>
      ))}
    </span>
  );

  return (
    <div className="test-mode-banner" role="status">
      <div className="test-mode-banner__track">
        <Group />
        <Group />
      </div>
      <span className="visually-hidden">{message}</span>
    </div>
  );
};

export default TestModeBanner;
