import { test, expect } from "@playwright/test";

import { openFirstProductFromCatalogue } from "./helpers/catalog";
import { dismissCookieBanner } from "./helpers/mocks";

test.describe("Pages vitrine", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page);
  });

  test("accueil — hero, navigation et footer légaux", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("link", { name: /catalogue/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /mentions légales/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /cgv/i })).toBeVisible();
  });

  test("catalogue — liste produits et lien fiche", async ({ page }) => {
    await page.goto("/catalogue");
    await expect(page.getByRole("heading", { name: /catalogue vêtements enfants/i })).toBeVisible();

    const productHref = await openFirstProductFromCatalogue(page, { skipGoto: true });
    test.skip(!productHref, "Aucun produit actif — exécutez npm run seed:dev");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /ajouter/i }).first()).toBeVisible();
  });

  test("fiche produit — prix et ajout panier", async ({ page }) => {
    const href = await openFirstProductFromCatalogue(page);
    test.skip(!href, "Aucun produit actif — exécutez npm run seed:dev");

    await expect(page.locator("main").locator(".tabular-nums").first()).toBeVisible();
    await dismissCookieBanner(page);
    await page.getByRole("button", { name: /ajouter/i }).first().click();
    await expect(page.getByRole("link", { name: /panier/i }).first()).toBeVisible();
  });
});
