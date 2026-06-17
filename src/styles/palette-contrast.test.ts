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

describe("palette Cocon marchand 2026 — contrastes AA", () => {
  it("encre marine sur milk ≥ 4.5:1", () => {
    expect(contrastRatio("#1e2a3d", "#fffcf9")).toBeGreaterThanOrEqual(4.5);
  });

  it("navy sur brand-blue-soft ≥ 4.5:1 pour les titres", () => {
    expect(contrastRatio("#2a3a52", "#e4eaf2")).toBeGreaterThanOrEqual(4.5);
  });

  it("persimmon-dark sur persimmon-soft ≥ 4.5:1 (badges promo)", () => {
    expect(contrastRatio("#9e3d24", "#fbe8e3")).toBeGreaterThanOrEqual(4.5);
  });

  it("navy-dark sur milk ≥ 4.5:1 (CTA)", () => {
    expect(contrastRatio("#1e2a3d", "#fffcf9")).toBeGreaterThanOrEqual(4.5);
  });

  it("navy sur pistache-soft ≥ 4.5:1 (nav active, chips catalogue)", () => {
    expect(contrastRatio("#243147", "#e6ede8")).toBeGreaterThanOrEqual(4.5);
  });

  it("navy sur milk ≥ 4.5:1 (titres sections)", () => {
    expect(contrastRatio("#243147", "#fdf8f2")).toBeGreaterThanOrEqual(4.5);
  });

  it("blanc sur navy-dark ≥ 4.5:1 (hero overlay)", () => {
    expect(contrastRatio("#ffffff", "#1a2435")).toBeGreaterThanOrEqual(4.5);
  });
});
