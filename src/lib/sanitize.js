/**
 * sanitizeHtml — DOMPurify wrapper with an allowlist tuned for book/post
 * descriptions and similar long-form user content.
 *
 * Backend (CKEditor 5) may allow inline tags but the FE must defend
 * against malicious payloads (e.g. <script>, onerror, <iframe>). The
 * allowlist below permits common formatting but strips event handlers,
 * inline styles, and dangerous tags.
 */

import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "b",
  "i",
  "em",
  "strong",
  "u",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "code",
  "pre",
  "span",
  "div",
];

const ALLOWED_ATTR = ["href", "target", "rel", "title", "name", "id"];

const FORBID_TAGS = ["script", "style", "iframe", "object", "embed", "form", "input"];

const FORBID_ATTR = ["style", "onerror", "onclick", "onload", "onmouseover", "srcset"];

export function sanitizeHtml(dirty) {
  if (dirty == null) return "";
  const input = typeof dirty === "string" ? dirty : String(dirty);

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS,
    FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    USE_PROFILES: { html: true },
  });
}
