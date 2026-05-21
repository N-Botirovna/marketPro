import React from "react";
import { serializeJsonLd } from "@/lib/seo/jsonLd";

/**
 * Inline JSON-LD <script> element. Server component — emits markup
 * directly during SSR so search-engine crawlers see structured data
 * without executing JS.
 *
 * Usage:
 *   <JsonLd data={bookLd({ book, locale })} />
 *   <JsonLd data={[bookLd(...), breadcrumbLd(...)]} />
 *
 * Accepts a single schema object, an array (rendered as separate script
 * tags — preferred over a `@graph` wrapper because Google parses both
 * but the script-per-schema form keeps the validator output readable),
 * or null/undefined (renders nothing).
 */
const JsonLd = ({ data }) => {
  if (!data) return null;
  const items = Array.isArray(data) ? data.filter(Boolean) : [data];
  if (!items.length) return null;

  return (
    <>
      {items.map((item, i) => {
        const serialized = serializeJsonLd(item);
        if (!serialized) return null;
        return (
          <script
            key={i}
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: serialized }}
          />
        );
      })}
    </>
  );
};

export default JsonLd;
