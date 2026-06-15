import { test, expect } from "./fixtures";

import {
  addCurrentProductToCart,
  openFirstProductFromCatalogue,
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
import { dismissCookieBanner, setupPurchaseMocks } from "./helpers/mocks";

test.describe("Parcours achat principal", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await setupPurchaseMocks(page);
    await dismissCookieBanner(page);
  });

  test("panier → checkout → relais mock → blocage CGV → session mockee", async ({
    page,
  }) => {
    const productHref = await openFirstProductFromCatalogue(page);
    test.skip(!productHref, "Aucun produit vendable — photo commerciale requise");

    await addCurrentProductToCart(page);
    await openCheckoutFromCart(page);

    await fillCustomerStep(page);
    await selectMockRelayPoint(page);
    await assertShippingRecapBeforePayment(page);

    await assertCgvBlocksPayment(page);

    const sessionRequest = page.waitForRequest("**/api/checkout/create-session");
    await acceptCgvAndPay(page);
    await sessionRequest;

    await page.waitForURL(/\/commande\/succes/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("création session checkout — payload client et point relais mock", async ({
    page,
  }) => {
    const productHref = await openFirstProductFromCatalogue(page);
    test.skip(!productHref, "Aucun produit vendable — photo commerciale requise");

    await addCurrentProductToCart(page);
    await openCheckoutFromCart(page);

    await fillCustomerStep(page);
    await selectMockRelayPoint(page);
    await page.getByRole("checkbox", { name: /j'ai lu et j'accepte/i }).click();

    const [request] = await Promise.all([
      page.waitForRequest("**/api/checkout/create-session"),
      page.getByRole("button", { name: FINAL_PAYMENT_BUTTON }).click(),
    ]);

    const body = request.postDataJSON() as {
      customer: { email: string };
      relayPoint: { id: string };
      items: Array<{ variantId: string; quantity: number }>;
    };

    expect(body.customer.email).toContain("@");
    expect(body.relayPoint.id).toMatch(/^E2E-RELAY-/);
    expect(body.items.length).toBeGreaterThan(0);
    await page.waitForURL(/\/commande\/succes/);
  });
});
