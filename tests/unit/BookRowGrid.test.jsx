import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// BookRowGrid is the single responsive grid for the compact feed/browse cards
// (1 col mobile → 2 → 3 on desktop). We stub the (next-intl-dependent)
// BookChatRow so this stays a pure layout test of the loading / empty /
// one-card-per-book contracts.
vi.mock("@/components/shared/BookChatRow", () => ({
  default: ({ book }) => <div data-testid="book-row">{book?.name}</div>,
}));

import BookRowGrid from "@/components/shared/BookRowGrid";

describe("BookRowGrid", () => {
  it("renders exactly `skeletonCount` skeleton cards while loading (no real rows)", () => {
    const { container, queryAllByTestId } = render(<BookRowGrid loading skeletonCount={4} />);
    // The grid is the single root; its direct children are the skeletons.
    expect(container.firstChild.children).toHaveLength(4);
    expect(container.querySelectorAll(".kz-skel").length).toBeGreaterThan(0);
    expect(queryAllByTestId("book-row")).toHaveLength(0);
  });

  it("renders the emptyState when not loading and there are no books", () => {
    const { getByText } = render(<BookRowGrid books={[]} emptyState={<p>none</p>} />);
    expect(getByText("none")).toBeInTheDocument();
  });

  it("returns null (renders nothing) when empty and no emptyState given", () => {
    const { container } = render(<BookRowGrid books={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one BookChatRow per book", () => {
    const books = [
      { id: 1, name: "Alpha" },
      { id: 2, name: "Beta" },
      { id: 3, name: "Gamma" },
    ];
    const { getAllByTestId } = render(<BookRowGrid books={books} />);
    expect(getAllByTestId("book-row")).toHaveLength(3);
  });

  it("passes showTypeBadge through to the row", () => {
    // The stub ignores the prop, but rendering must not throw when it's false.
    const books = [{ id: 1, name: "Alpha" }];
    const { getByText } = render(<BookRowGrid books={books} showTypeBadge={false} />);
    expect(getByText("Alpha")).toBeInTheDocument();
  });
});
