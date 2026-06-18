import React from "react";
import { Box } from "@mui/material";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import Icon from "@/components/Icon";

/**
 * Adaptive cover montage for a collection thumbnail.
 *
 * Fills its parent (which owns the size, radius and clipping) with up to 4
 * member covers, laid out so the square is always fully covered — no empty
 * quadrants when the collection has fewer than 4 books:
 *
 *   1 cover   2 covers   3 covers      4 covers
 *   ┌─────┐   ┌──┬──┐    ┌──┬──┐       ┌──┬──┐
 *   │     │   │  │  │    │  ├──┤       ├──┼──┤
 *   └─────┘   └──┴──┘    └──┴──┘       └──┴──┘
 *
 * Covers should already be deduped/ordered by the caller; we defensively cap
 * at 4. Falls back to a "stack" glyph when there are no covers at all.
 */
const HAIRLINE = "2px";

// Per-count grid template + the special cell spans that make the layout read
// as a balanced mosaic (only count 3 needs a spanning lead tile).
const LAYOUT = {
  1: { cols: "1fr", rows: "1fr" },
  2: { cols: "1fr 1fr", rows: "1fr" },
  3: { cols: "1fr 1fr", rows: "1fr 1fr" },
  4: { cols: "1fr 1fr", rows: "1fr 1fr" },
};

const CollectionMontage = ({ covers, iconSize = 24 }) => {
  const tiles = (covers || []).filter(Boolean).slice(0, 4);
  const n = tiles.length;

  if (!n) {
    return (
      <Icon
        className="ph ph-stack"
        style={{
          fontSize: iconSize,
          color: "var(--text-muted)",
          position: "absolute",
          inset: 0,
          margin: "auto",
        }}
        aria-hidden="true"
      />
    );
  }

  const { cols, rows } = LAYOUT[n];

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: cols,
        gridTemplateRows: rows,
        gap: HAIRLINE,
        bgcolor: "var(--border-subtle)", // shows through the gap as a hairline
      }}
    >
      {tiles.map((src, i) => (
        <Box
          key={i}
          sx={{
            overflow: "hidden",
            // 3-cover layout: the first cover spans both rows of column 1,
            // the other two stack in column 2. The rest auto-flow into a tidy grid.
            ...(n === 3 && i === 0 ? { gridColumn: 1, gridRow: "1 / 3" } : null),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small montage tile */}
          <img
            src={resolveMediaUrl(src)}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            loading="lazy"
          />
        </Box>
      ))}
    </Box>
  );
};

export default CollectionMontage;
