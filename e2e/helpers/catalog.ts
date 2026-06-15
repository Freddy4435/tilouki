import { expect, type Page } from "@playwright/test";

import { dismissCookieBanner } from "./mocks";

const SELLABLE_PRODUCT_LINK = /choisir la taille|voir le produit/i;

/** Ouvre la première fiche produit vendable (photo commerciale) depuis le catalogue. */
export async function openSellableProductFromCatalogue(
  page: Page,
  options?: { skipGoto?: boolean },
): Promise<string | null> {
  if (!options?.skipGoto) {
    await page.goto("/catalogue");
  }
  await page.getByRole("heading", { name: /catalogue vêtements enfants/i }).waitFor();

  const sellableLink = page.getByRole("link", { name: SELLABLE_PRODUCT_LINK }).first();
  if ((await sellableLink.count()) === 0) return null;

  const href = await sellableLink.getAttribute("href");
  if (!href?.startsWith("/produit/")) return null;

  await sellableLink.click();
  await page.waitForURL(/\/produit\//);
  return href;
}

/** @deprecated Préférer openSellableProductFromCatalogue */
export async function openFirstProductFromCatalogue(
  page: Page,
  options?: { skipGoto?: boolean },
): Promise<string | null> {
  return openSellableProductFromCatalogue(page, options);
}

function addToCartButton(page: Page) {
  const width = page.viewportSize()?.width ?? 1440;
  if (width >= 1024) {
    return page.getByRole("button", { name: "Ajouter au panier" });
  }
  return page
    .locator('[aria-label="Ajouter au panier"]')
    .or(page.getByRole("button", { name: /^ajouter$/i }))
    .first();
}

export async function addCurrentProductToCart(page: Page) {
  await dismissCookieBanner(page);

  const addButton = addToCartButton(page);
  const visible = await addButton.isVisible().catch(() => false);
  if (!visible) {
    throw new Error(
      "Aucun bouton d'achat visible — ouvrez une fiche avec photo commerciale (openSellableProductFromCatalogue).",
    );
  }

  await addButton.scrollIntoViewIfNeeded();
  await addButton.click();

  await expect(page.getByRole("dialog")).toContainText(/panier/i, { timeout: 10_000 });

  await page.goto("/panier");
  await expect(page.getByRole("button", { name: /passer commande/i })).toBeVisible({
    timeout: 20_000,
  });
}
