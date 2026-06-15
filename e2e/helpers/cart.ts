import { expect, type Page } from "@playwright/test";

import { mockCartValidation } from "./mocks";

export const DEFAULT_CART_ITEM = {
  productId: "00000000-0000-0000-0000-000000000099",
  variantId: "00000000-0000-0000-0000-000000000098",
  productName: "Article test E2E",
  slug: "article-test-e2e",
  image: null,
  sizeLabel: "4A",
  ageLabel: "4 ans",
  sku: "E2E-TEST",
  unitPriceCents: 2500,
  quantity: 1,
  stockQuantity: 10,
  weightGrams: 200,
};

/** Injecte un panier minimal avant chargement (Zustand persist). */
export async function seedCartInBrowser(page: Page, variantId?: string) {
  const item = {
    ...DEFAULT_CART_ITEM,
    variantId: variantId ?? DEFAULT_CART_ITEM.variantId,
  };
  await page.addInitScript((cartItem) => {
    localStorage.setItem(
      "tilouki-cart",
      JSON.stringify({
        state: { items: [cartItem], carrier: "mondial_relay" },
        version: 1,
      }),
    );
  }, item);
}

export async function waitForCartHydrated(page: Page) {
  await page.waitForFunction(() => {
    const raw = localStorage.getItem("tilouki-cart");
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw) as { state?: { items?: unknown[] } };
      return (parsed.state?.items?.length ?? 0) > 0;
    } catch {
      return false;
    }
  });
}

async function waitForSeededCartInDom(page: Page) {
  await expect(page.getByText(DEFAULT_CART_ITEM.productName)).toBeVisible({
    timeout: 20_000,
  });
  const checkoutReady = page.getByRole("button", { name: /passer commande/i });
  await expect(checkoutReady).toBeVisible({ timeout: 20_000 });
  await expect(checkoutReady).toBeEnabled({ timeout: 20_000 });
}

/** Panier prérempli + attente réhydratation Zustand avant checkout. */
export async function ensureSeededCartOnPage(page: Page) {
  await mockCartValidation(page);
  await seedCartInBrowser(page);
  await page.goto("/panier");
  await waitForCartHydrated(page);

  try {
    await waitForSeededCartInDom(page);
    return;
  } catch {
    // Réinjection + reload si la validation serveur a vidé le store avant hydratation.
  }

  await page.evaluate((cartItem) => {
    localStorage.setItem(
      "tilouki-cart",
      JSON.stringify({
        state: { items: [cartItem], carrier: "mondial_relay" },
        version: 1,
      }),
    );
  }, DEFAULT_CART_ITEM);

  await page.reload();
  await waitForCartHydrated(page);
  await waitForSeededCartInDom(page);
}
