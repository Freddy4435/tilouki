import { describe, expect, it } from "vitest";

/** Ratio de contraste WCAG — formule relative luminance simplifiée. */
function contrastRatio(foreground: string, background: string): number {
  const parse = (hex: string) => {
    const normalized = hex.replace("#", "");
    const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
    const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
    const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;
    const channel = (c: number) =>
      c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };

  const l1 = parse(foreground);
  const l2 = parse(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("palette Maison Tilouki — contrastes AA", () => {
  it("butter-ink sur butter-soft ≥ 4.5:1", () => {
    expect(contrastRatio("#5c4510", "#faf3dc")).toBeGreaterThanOrEqual(4.5);
  });

  it("plum sur plum-soft ≥ 4.5:1 pour les titres", () => {
    expect(contrastRatio("#5b2a3e", "#f5ebf0")).toBeGreaterThanOrEqual(4.5);
  });

  it("encre sur milk ≥ 4.5:1", () => {
    expect(contrastRatio("#2e2a25", "#fffcf7")).toBeGreaterThanOrEqual(4.5);
  });

  it("teal-dark sur milk ≥ 4.5:1 (CTA secondaires)", () => {
    expect(contrastRatio("#185b55", "#fffcf7")).toBeGreaterThanOrEqual(4.5);
  });
});
