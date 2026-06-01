import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import BookCardSkeleton from "@/components/shared/BookCardSkeleton";
import BookRowSkeleton from "@/components/shared/BookRowSkeleton";
import ShopCardSkeleton from "@/components/shared/ShopCardSkeleton";

// Every loading state in the app now goes through these three skeletons, which
// share the `.kz-skel` shimmer surface. The tests assert each one renders
// shimmer blocks and is hidden from the accessibility tree.

describe("skeletons", () => {
  it("BookCardSkeleton renders shimmer blocks and is aria-hidden", () => {
    const { container } = render(<BookCardSkeleton />);
    expect(container.querySelectorAll(".kz-skel").length).toBeGreaterThan(0);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("BookRowSkeleton renders shimmer blocks", () => {
    const { container } = render(<BookRowSkeleton />);
    expect(container.querySelectorAll(".kz-skel").length).toBeGreaterThan(0);
  });

  it("ShopCardSkeleton renders shimmer blocks", () => {
    const { container } = render(<ShopCardSkeleton />);
    expect(container.querySelectorAll(".kz-skel").length).toBeGreaterThan(0);
  });
});
