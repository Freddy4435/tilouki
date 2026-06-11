import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Vérifie qu'un contrôle de formulaire a un label associé. */
export async function expectLabeledInputs(page: Page, labels: string[]) {
  for (const label of labels) {
    await expect(page.getByLabel(label, { exact: true })).toBeVisible();
  }
}

/** Boutons interactifs principaux doivent avoir un nom accessible. */
export async function expectNamedButtons(page: Page, names: RegExp[]) {
  for (const name of names) {
    await expect(page.getByRole("button", { name })).toBeVisible();
  }
}

/**
 * Vérifie qu'un élément focalisable affiche un contour visible au focus clavier.
 */
export async function expectVisibleFocusRing(page: Page, selector: string) {
  const outlineWidth = await page.locator(selector).evaluate((el) => {
    el.focus();
    const style = window.getComputedStyle(el);
    const outline = parseFloat(style.outlineWidth || "0");
    const ring = style.boxShadow.includes("rgb") ? 1 : 0;
    return outline > 0 || ring > 0 ? 1 : 0;
  });
  expect(outlineWidth).toBeGreaterThan(0);
}

/**
 * Contraste minimal texte / fond (ratio WCAG AA ~4.5:1 pour texte normal).
 * Contrôle simplifié sur les éléments clés.
 */
export async function expectMinimumContrast(page: Page, selector: string, minRatio = 4.5) {
  const ratio = await page.locator(selector).first().evaluate((el) => {
    function parseRgb(color: string): [number, number, number] | null {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return null;
      return [Number(match[1]), Number(match[2]), Number(match[3])];
    }

    function luminance([r, g, b]: [number, number, number]) {
      const srgb = [r, g, b].map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * srgb[0]! + 0.7152 * srgb[1]! + 0.0722 * srgb[2]!;
    }

    const fg = parseRgb(window.getComputedStyle(el).color);
    let bgEl: Element | null = el;
    let bgColor = "rgba(0, 0, 0, 0)";
    while (bgEl) {
      bgColor = window.getComputedStyle(bgEl).backgroundColor;
      if (bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") break;
      bgEl = bgEl.parentElement;
    }
    const bg = parseRgb(bgColor);
    if (!fg || !bg) return 21;
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  });

  expect(ratio).toBeGreaterThanOrEqual(minRatio);
}

/** Scan axe — violations critiques / sérieuses uniquement. */
export async function expectNoSeriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(serious, serious.map((v) => v.id).join(", ")).toEqual([]);
}
