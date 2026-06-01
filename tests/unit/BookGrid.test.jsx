import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// BookGrid is the single responsive grid for the rich book card. We stub the
// (hook-heavy) BookCard so the test stays a pure layout test: it verifies the
// loading → skeleton, empty → emptyState, and populated → one-card-per-book
// contracts that every consumer (profile, wishlist, public profile) relies on.
vi.mock("@/components/BookCard", () => ({
  default: ({ book }) => <div data-testid="book-card">{book?.name}</div>,
}));

import BookGrid from "@/components/shared/BookGrid";

describe("BookGrid", () => {
  it("renders exactly `skeletonCount` skeletons while loading (no real cards)", () => {
    const { container, queryAllByTestId } = render(<BookGrid loading skeletonCount={5} />);
    // BookCardSkeleton's root carries the `.book-card` class.
    expect(container.querySelectorAll(".book-card")).toHaveLength(5);
    expect(queryAllByTestId("book-card")).toHaveLength(0);
  });

  it("renders the emptyState when not loading and there are no books", () => {
    const { getByText, container } = render(
      <BookGrid books={[]} emptyState={<p>nothing here</p>} />,
    );
    expect(getByText("nothing here")).toBeInTheDocument();
    expect(container.querySelector(".row")).toBeNull();
  });

  it("returns null (renders nothing) when empty and no emptyState given", () => {
    const { container } = render(<BookGrid books={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one default BookCard per book", () => {
    const books = [
      { id: 1, name: "Alpha" },
      { id: 2, name: "Beta" },
    ];
    const { getAllByTestId, getByText } = render(<BookGrid books={books} />);
    expect(getAllByTestId("book-card")).toHaveLength(2);
    expect(getByText("Alpha")).toBeInTheDocument();
    expect(getByText("Beta")).toBeInTheDocument();
  });

  it("uses renderCard when provided instead of the default card", () => {
    const books = [{ id: 1, name: "Alpha" }];
    const { getByText, queryByTestId } = render(
      <BookGrid books={books} renderCard={(b) => <span>custom-{b.name}</span>} />,
    );
    expect(getByText("custom-Alpha")).toBeInTheDocument();
    expect(queryByTestId("book-card")).toBeNull();
  });

  it("applies the 2-up-mobile column class to every cell", () => {
    const books = [{ id: 1, name: "Alpha" }];
    const { container } = render(<BookGrid books={books} />);
    const cell = container.querySelector(".row > div");
    expect(cell).toHaveClass("col-6");
    expect(cell).toHaveClass("col-md-4");
    expect(cell).toHaveClass("col-xl-3");
  });
});
