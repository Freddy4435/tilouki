import { expect, type Page } from "@playwright/test";

/** Sélecteurs connus des overlays / indicateurs Next.js en mode dev. */
const NEXT_DEV_OVERLAY_SELECTORS = [
  "nextjs-portal",
  "[data-nextjs-dialog]",
  "[data-nextjs-toast]",
  "#nextjs__container_errors_label",
  "[data-next-badge-root]",
].join(", ");

export async function expectNoNextDevOverlay(page: Page) {
  await expect(page.locator(NEXT_DEV_OVERLAY_SELECTORS)).toHaveCount(0);

  const bodyHtml = await page.locator("body").innerHTML();
  expect(bodyHtml.toLowerCase()).not.toContain("next.js dev");
  expect(bodyHtml).not.toContain("__next-build-watcher");
}

/**
 * Vérifie que le bas de page n'est pas masqué par la bottom nav mobile
 * (marge de scroll suffisante sur le contenu principal).
 */
export async function expectNoBottomNavOverlap(page: Page) {
  const nav = page.getByRole("navigation", { name: /navigation principale mobile/i });
  if (!(await nav.isVisible().catch(() => false))) return;

  const safePadding = await page.evaluate(() => {
    const navEl = document.querySelector(
      'nav[aria-label="Navigation principale mobile"]',
    );
    const main = document.querySelector("main");
    if (!navEl || !main) return true;

    const navHeight = navEl.getBoundingClientRect().height;
    const paddingBottom = parseFloat(
      window.getComputedStyle(main).paddingBottom || "0",
    );
    return paddingBottom >= navHeight - 8;
  });

  expect(
    safePadding,
    "Le main doit avoir un padding-bottom ≥ hauteur de la bottom nav mobile",
  ).toBe(true);
}

export async function captureFullPage(
  page: Page,
  path: string,
  screenshotPath: string,
  viewport: { width: number; height: number },
) {
  await page.setViewportSize(viewport);
  await page.goto(path, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await expectNoNextDevOverlay(page);
  await page.screenshot({ path: screenshotPath, fullPage: true });
}
