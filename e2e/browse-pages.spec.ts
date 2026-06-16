import { test, expect } from "./fixtures";

import {
  addCurrentProductToCart,
  expectCataloguePageReady,
  goToCatalogueFromHome,
  openCategoryFromCatalogue,
  openSellableProductFromCatalogue,
  openSellableProductFromCurrentListing,
} from "./helpers/catalog";
import {
  fillCustomerStep,
  FINAL_PAYMENT_BUTTON,
  openCheckoutFromCart,
  selectMockRelayPoint,
} from "./helpers/checkout";
import { dismissCookieBanner, setupPurchaseMocks } from "./helpers/mocks";
import {
  expectEditorialTiloukiImage,
  expectHomeProductsBeforeBuyingGuides,
  expectNoTiloukiPackInProductMain,
  openProductSizeGuideSection,
  searchCatalogue,
  toggleFavoriteOnProductPage,
} from "./helpers/retail";

test.describe("Pages vitrine — parcours e-commerce", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page);
  });

  test("accueil — produits avant guides, hero et footer légaux", async ({ page }) => {
    await expectHomeProductsBeforeBuyingGuides(page);
    await expect(page.getByRole("link", { name: /catalogue/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /mentions légales/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "CGV", exact: true })).toBeVisible();
  });

  test("accueil → catalogue — bandeau et grille", async ({ page }) => {
    await goToCatalogueFromHome(page);
    await expect(
      page.getByRole("navigation", { name: /raccourcis catalogue/i }),
    ).toBeVisible();
  });

  test("catalogue → catégorie — bandeau éditorial Tilouki", async ({ page }) => {
    const href = await openCategoryFromCatalogue(page, /pyjamas/i);
    test.skip(!href, "Catégorie pyjamas inaccessible");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectEditorialTiloukiImage(page);
  });

  test("catégorie → fiche produit — prix et CTA achat", async ({ page }) => {
    const categoryHref = await openCategoryFromCatalogue(page, /bébé/i);
    test.skip(!categoryHref, "Catégorie bébé inaccessible");

    const productHref = await openSellableProductFromCurrentListing(page);
    test.skip(!productHref, "Aucun produit vendable — photo commerciale requise");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoTiloukiPackInProductMain(page);
    await expect(page.locator("main").locator(".tabular-nums").first()).toBeVisible();
  });

  test("recherche produit — filtre le catalogue", async ({ page }) => {
    await page.goto("/catalogue");
    const ready = await expectCataloguePageReady(page);
    test.skip(!ready, "Catalogue en mode lancement");

    const firstName = await page
      .locator("article.tilouki-product-card h3")
      .first()
      .textContent();
    test.skip(!firstName?.trim(), "Aucun produit listé");

    await searchCatalogue(page, firstName!.trim().split(/\s+/)[0]!);
    await expect(page.locator("article.tilouki-product-card").first()).toBeVisible();
  });

  test("fiche produit — guide tailles et favoris", async ({ page }) => {
    const href = await openSellableProductFromCatalogue(page);
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await openProductSizeGuideSection(page);
    await toggleFavoriteOnProductPage(page);

    await page.goto("/favoris");
    await expect(page.getByRole("heading", { name: /mes favoris/i })).toBeVisible();
  });

  test("fiche produit — ajout panier", async ({ page }) => {
    const href = await openSellableProductFromCatalogue(page);
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await dismissCookieBanner(page);
    await page.getByRole("radio").first().click();
    await page
      .getByRole("button", { name: /ajouter/i })
      .first()
      .click();
    await expect(page.getByRole("link", { name: /panier/i }).first()).toBeVisible();
  });

  test("suivi commande — formulaire vide sans token", async ({ page }) => {
    await page.goto("/suivi-commande");
    await expect(
      page.getByRole("heading", { name: /suivi de commande/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/numéro de suivi/i)).toHaveValue("");
  });

  test("suivi commande — token invalide dans l'URL", async ({ page }) => {
    await page.goto("/suivi-commande?token=pas-un-uuid");
    await expect(page.getByLabel(/numéro de suivi/i)).toHaveValue("pas-un-uuid", {
      timeout: 15_000,
    });
    await expect(page.getByText(/numéro de suivi invalide/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("suivi commande — token valide inconnu", async ({ page }) => {
    const unknownToken = "550e8400-e29b-41d4-a716-446655440000";
    await page.goto(`/suivi-commande?token=${unknownToken}`);
    await expect(page.getByLabel(/numéro de suivi/i)).toHaveValue(unknownToken, {
      timeout: 15_000,
    });
    await expect(page.getByText(/aucune commande trouvée/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("panier et checkout — récapitulatif complet", async ({ page }) => {
    await setupPurchaseMocks(page);

    const productHref = await openSellableProductFromCatalogue(page);
    test.skip(!productHref, "Aucun produit vendable — photo commerciale requise");

    await addCurrentProductToCart(page);
    await expect(page.getByRole("heading", { name: /votre panier/i })).toBeVisible();
    await expect(page.locator("main").locator(".tabular-nums").first()).toBeVisible();

    await openCheckoutFromCart(page);
    await fillCustomerStep(page);
    await selectMockRelayPoint(page);

    await expect(
      page.getByRole("heading", { name: /résumé de commande/i }),
    ).toBeVisible();
    await expect(page.locator("main").locator(".tabular-nums").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: FINAL_PAYMENT_BUTTON }),
    ).toBeVisible();
  });
});
