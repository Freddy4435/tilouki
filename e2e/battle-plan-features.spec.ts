import { test, expect } from "./fixtures";

import { DEFAULT_CART_ITEM, seedMultiItemCartInBrowser } from "./helpers/cart";
import { mockCartValidation } from "./helpers/mocks";

/**
 * Fonctionnalités du plan bataille 15 étapes (hors parcours achat complet).
 */
test.describe("Plan bataille — fonctionnalités storefront", () => {
  test("page Mon compte accessible", async ({ page }) => {
    await page.goto("/compte");
    await expect(
      page.getByRole("heading", { name: /mon compte/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /recevoir un lien de connexion/i }),
    ).toBeVisible();
  });

  test("lien Mon compte dans le header", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /mon compte/i })).toBeVisible();
  });

  test("API recherche suggest répond", async ({ request }) => {
    const response = await request.get("/api/search/suggest?q=pyj");
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as { suggestions?: unknown[] };
    expect(Array.isArray(body.suggestions)).toBe(true);
  });

  test("remise tenue affichée avec 4 articles au panier", async ({ page }) => {
    await mockCartValidation(page);
    await seedMultiItemCartInBrowser(page, 4);
    await page.goto("/panier");
    await expect(page.getByText(DEFAULT_CART_ITEM.productName).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/remise tenue tilouki/i).first()).toBeVisible();
  });
});
