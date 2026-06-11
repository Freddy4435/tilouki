import { expect, type Page } from "@playwright/test";

import { dismissCookieBanner } from "./mocks";

/** Ouvre la première fiche produit disponible depuis le catalogue. */
export async function openFirstProductFromCatalogue(
  page: Page,
  options?: { skipGoto?: boolean },
): Promise<string | null> {
  if (!options?.skipGoto) {
    await page.goto("/catalogue");
  }
  await page.getByRole("heading", { name: /catalogue vêtements enfants/i }).waitFor();

  const productLink = page.locator('a[href^="/produit/"]').first();
  const count = await productLink.count();
  if (count === 0) return null;

  const href = await productLink.getAttribute("href");
  await productLink.click();
  await page.waitForURL(/\/produit\//);
  return href;
}

function addToCartButton(page: Page) {
  const width = page.viewportSize()?.width ?? 1440;
  if (width >= 1024) {
    return page.getByRole("button", { name: "Ajouter au panier" });
  }
  return page.locator('[aria-label="Ajouter au panier"]').getByRole("button", { name: /^ajouter$/i });
}

export async function addCurrentProductToCart(page: Page) {
  await dismissCookieBanner(page);

  const addButton = addToCartButton(page);
  await addButton.waitFor({ state: "visible" });
  await addButton.scrollIntoViewIfNeeded();
  await addButton.click();

  await expect(page.getByRole("dialog")).toContainText(/panier/i, { timeout: 10_000 });

  await page.goto("/panier");
  await expect(page.getByRole("button", { name: /passer commande/i })).toBeVisible({
    timeout: 20_000,
  });
}
