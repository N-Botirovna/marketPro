import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import CollectionMontage from "@/components/shared/CollectionMontage";

// CollectionMontage renders the adaptive cover mosaic for a collection
// thumbnail. The core contract: it shows ONE tile per cover, up to 4 (the
// regression we fixed showed only 3), and a fallback glyph when there are none.
const covers = (n) => Array.from({ length: n }, (_, i) => `/media/books/pictures/b${i}.jpeg`);

describe("CollectionMontage", () => {
  it("renders one image tile per cover for 1–4 covers", () => {
    for (const n of [1, 2, 3, 4]) {
      const { container, unmount } = render(<CollectionMontage covers={covers(n)} />);
      expect(container.querySelectorAll("img")).toHaveLength(n);
      unmount();
    }
  });

  it("caps the montage at 4 tiles even when given more covers", () => {
    const { container } = render(<CollectionMontage covers={covers(7)} />);
    expect(container.querySelectorAll("img")).toHaveLength(4);
  });

  it("drops falsy covers before laying out tiles", () => {
    const { container } = render(
      <CollectionMontage covers={["/media/a.jpeg", null, "", "/media/b.jpeg"]} />,
    );
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });

  it("shows the fallback glyph and no images when there are no covers", () => {
    const { container } = render(<CollectionMontage covers={[]} />);
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(container.querySelector("svg")).not.toBeNull(); // Icon fallback
  });

  it("treats a missing covers prop as empty (no crash)", () => {
    const { container } = render(<CollectionMontage />);
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });
});
