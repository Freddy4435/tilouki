import { test, expect } from "./fixtures";

import {
  addCurrentProductToCart,
  goToCatalogueFromHome,
  openCategoryFromCatalogue,
  openSellableProductFromCatalogue,
  openSellableProductFromCurrentListing,
  expectCataloguePageReady,
} from "./helpers/catalog";
import {
  acceptCgvAndPay,
  assertCgvBlocksPayment,
  assertShippingRecapBeforePayment,
  fillCustomerStep,
  FINAL_PAYMENT_BUTTON,
  openCheckoutFromCart,
  selectMockRelayPoint,
} from "./helpers/checkout";
import { setupPurchaseMocks } from "./helpers/mocks";
import { ensureSeededCartOnPage } from "./helpers/cart";
import {
  expectEditorialTiloukiImage,
  expectHomeProductsBeforeBuyingGuides,
  expectNoTiloukiPackInProductMain,
  openProductSizeGuideSection,
  searchCatalogue,
  toggleFavoriteOnProductPage,
} from "./helpers/retail";

/**
 * Parcours client e-commerce après recentrage retail.
 * Accueil → catalogue → catégorie → fiche → taille → panier → commande (+ recherche, favoris, guide tailles).
 */
test.describe("Parcours de vente complet", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await setupPurchaseMocks(page);
  });

  test("1. Accueil — produits avant guides et accès catalogue", async ({ page }) => {
    await expectHomeProductsBeforeBuyingGuides(page);
    await expect(page.getByRole("link", { name: /catalogue/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /mentions légales/i })).toBeVisible();
  });

  test("2. Accueil → catalogue", async ({ page }) => {
    await goToCatalogueFromHome(page);
    await expect(
      page.getByRole("main").getByRole("heading", { name: /^catalogue$/i }),
    ).toBeVisible();
  });

  test("3. Catalogue → catégorie", async ({ page }) => {
    const categoryHref = await openCategoryFromCatalogue(page, /^bébé$/i);
    test.skip(!categoryHref, "Catégorie bébé inaccessible ou catalogue vide");

    await expect(page).toHaveURL(/\/categorie\/bebe/);
    await expectEditorialTiloukiImage(page);
  });

  test("4. Catégorie → fiche produit (photo commerciale)", async ({ page }) => {
    const categoryHref = await openCategoryFromCatalogue(page, /^pyjamas$/i);
    test.skip(!categoryHref, "Catégorie pyjamas inaccessible");

    const productHref = await openSellableProductFromCurrentListing(page);
    test.skip(!productHref, "Aucun produit vendable dans la catégorie");

    await expect(
      page.getByRole("main").getByRole("heading", { level: 1 }),
    ).toBeVisible();
    await expectNoTiloukiPackInProductMain(page);
  });

  test("5. Recherche produit dans le catalogue", async ({ page }) => {
    await page.goto("/catalogue");
    const ready = await expectCataloguePageReady(page);
    test.skip(!ready, "Catalogue en mode lancement");

    await searchCatalogue(page, "body");
    await expect(page).toHaveURL(/[?&]q=/);
    await expect(
      page.getByRole("main").getByRole("heading", { name: /^catalogue$/i }),
    ).toBeVisible();
  });

  test("6. Fiche — guide des tailles et favoris", async ({ page }) => {
    const href = await openSellableProductFromCatalogue(page);
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await openProductSizeGuideSection(page);
    await expect(page.locator("#size-guide")).toContainText(/taille|âge/i);

    await toggleFavoriteOnProductPage(page);
    await page.goto("/favoris");
    await expect(page.getByRole("heading", { name: /mes favoris/i })).toBeVisible();
    await expect(page.locator("article.tilouki-product-card").first()).toBeVisible();
  });

  test("7. Fiche produit — choix taille et ajout au panier", async ({ page }) => {
    const href = await openSellableProductFromCatalogue(page);
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await addCurrentProductToCart(page);
    await expect(page.getByRole("heading", { name: /votre panier/i })).toBeVisible();
  });

  test("8. Panier → commande — formulaire client", async ({ page }) => {
    const href = await openSellableProductFromCatalogue(page);
    if (href) {
      await addCurrentProductToCart(page);
    } else {
      await ensureSeededCartOnPage(page);
    }

    await openCheckoutFromCart(page);
    await fillCustomerStep(page);

    await expect(page.getByLabel("Code postal")).toBeVisible();
  });

  test("9. Checkout — sélection point relais mock", async ({ page }) => {
    const href = await openSellableProductFromCatalogue(page);
    if (href) {
      await addCurrentProductToCart(page);
    } else {
      await ensureSeededCartOnPage(page);
    }

    await openCheckoutFromCart(page);
    await fillCustomerStep(page);
    await selectMockRelayPoint(page);

    await assertShippingRecapBeforePayment(page);
    await expect(
      page.getByRole("button", { name: FINAL_PAYMENT_BUTTON }),
    ).toBeVisible();
  });

  test("10. Checkout — blocage sans CGV", async ({ page }) => {
    const href = await openSellableProductFromCatalogue(page);
    if (href) {
      await addCurrentProductToCart(page);
    } else {
      await ensureSeededCartOnPage(page);
    }

    await openCheckoutFromCart(page);
    await fillCustomerStep(page);
    await selectMockRelayPoint(page);

    await assertCgvBlocksPayment(page);
  });

  test("11. Checkout — session Stripe mockée", async ({ page }) => {
    const href = await openSellableProductFromCatalogue(page);
    if (href) {
      await addCurrentProductToCart(page);
    } else {
      await ensureSeededCartOnPage(page);
    }

    await openCheckoutFromCart(page);
    await fillCustomerStep(page);
    await selectMockRelayPoint(page);

    const sessionRequest = page.waitForRequest("**/api/checkout/create-session");
    await acceptCgvAndPay(page);
    const request = await sessionRequest;

    const body = request.postDataJSON() as {
      customer: { email: string };
      relayPoint: { id: string };
      items: Array<{ variantId: string; quantity: number }>;
    };

    expect(body.customer.email).toContain("@");
    expect(body.relayPoint.id).toMatch(/^E2E-RELAY-/);
    expect(body.items.length).toBeGreaterThan(0);

    await page.waitForURL(/\/commande\/succes/);
    await expect(page.getByRole("main")).toBeVisible();
  });
});
