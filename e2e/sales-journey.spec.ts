import { test, expect } from "./fixtures";

import {
  addCurrentProductToCart,
  openFirstProductFromCatalogue,
} from "./helpers/catalog";
import {
  acceptCgvAndPay,
  assertCgvBlocksPayment,
  fillCustomerStep,
  FINAL_PAYMENT_BUTTON,
  openCheckoutFromCart,
  selectMockRelayPoint,
} from "./helpers/checkout";
import { setupPurchaseMocks } from "./helpers/mocks";

/**
 * Parcours client principal — une suite séquentielle par viewport (desktop + mobile).
 * Critère d'acceptation recette : accueil → catalogue → produit → panier → checkout → relais → CGV → paiement mocké.
 */
test.describe("Parcours de vente complet", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await setupPurchaseMocks(page);
  });

  test("1. Accueil — navigation et liens légaux", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("link", { name: /catalogue/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /mentions légales/i })).toBeVisible();
  });

  test("2. Catalogue — liste et accès fiche produit", async ({ page }) => {
    await page.goto("/catalogue");
    await expect(
      page.getByRole("heading", { name: /catalogue vêtements enfants/i }),
    ).toBeVisible();

    const href = await openFirstProductFromCatalogue(page, { skipGoto: true });
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("3. Fiche produit — ajout au panier", async ({ page }) => {
    const href = await openFirstProductFromCatalogue(page);
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await addCurrentProductToCart(page);
    await expect(page.getByRole("heading", { name: /votre panier/i })).toBeVisible();
  });

  test("4. Checkout — formulaire client", async ({ page }) => {
    const href = await openFirstProductFromCatalogue(page);
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await addCurrentProductToCart(page);
    await openCheckoutFromCart(page);
    await fillCustomerStep(page);

    await expect(page.getByLabel("Code postal")).toBeVisible();
  });

  test("5. Checkout — sélection point relais mock", async ({ page }) => {
    const href = await openFirstProductFromCatalogue(page);
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await addCurrentProductToCart(page);
    await openCheckoutFromCart(page);
    await fillCustomerStep(page);
    await selectMockRelayPoint(page);

    await expect(
      page.getByRole("button", { name: FINAL_PAYMENT_BUTTON }),
    ).toBeVisible();
  });

  test("6. Checkout — blocage sans CGV", async ({ page }) => {
    const href = await openFirstProductFromCatalogue(page);
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await addCurrentProductToCart(page);
    await openCheckoutFromCart(page);
    await fillCustomerStep(page);
    await selectMockRelayPoint(page);

    await assertCgvBlocksPayment(page);
  });

  test("7. Checkout — session Stripe mockée", async ({ page }) => {
    const href = await openFirstProductFromCatalogue(page);
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await addCurrentProductToCart(page);
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
