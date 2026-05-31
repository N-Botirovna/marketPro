import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Icon from "@/components/Icon";

// The <Icon> component replaced the Phosphor webfont (<i className="ph ph-x">)
// with tree-shaken @phosphor-icons/react SVGs. It must keep accepting the exact
// legacy class strings (static, dynamic, and template-literal) so the ~150
// migrated call-sites — and the data-driven `icon: "ph-fill ph-..."` configs —
// keep working unchanged.

describe("Icon", () => {
  it("renders an <svg> for a regular-weight phosphor class", () => {
    const { container } = render(<Icon className="ph ph-heart" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders an <svg> for a fill-weight phosphor class", () => {
    const { container } = render(<Icon className="ph-fill ph-heart" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("forwards non-phosphor classes onto the svg and strips the ph- tokens", () => {
    const { container } = render(
      <Icon className="ph-fill ph-heart text-lg book-card__meta-icon" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-lg");
    expect(svg).toHaveClass("book-card__meta-icon");
    // The phosphor tokens are consumed, never leaked as CSS classes.
    expect(svg.getAttribute("class")).not.toMatch(/\bph-/);
  });

  it("forwards arbitrary props (aria-hidden, style) to the svg", () => {
    const { container } = render(
      <Icon className="ph ph-x" aria-hidden="true" style={{ fontSize: 18 }} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveStyle({ fontSize: "18px" });
  });

  it("accepts a dynamic class string (data-driven config usage)", () => {
    const fromConfig = "ph-fill ph-telegram-logo";
    const { container } = render(<Icon className={fromConfig} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("maps the legacy `store` alias to Storefront", () => {
    const { container } = render(<Icon className="ph ph-store" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders nothing for an unknown icon name", () => {
    const { container } = render(<Icon className="ph ph-definitely-not-an-icon" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when no phosphor name is present", () => {
    const { container } = render(<Icon className="text-lg" />);
    expect(container).toBeEmptyDOMElement();
  });
});
