import { test, expect } from "./fixtures";

import { expectNoSeriousAxeViolations } from "./helpers/accessibility";
import { ensureSeededCartOnPage } from "./helpers/cart";
import { openSellableProductFromCatalogue } from "./helpers/catalog";
import { fillCustomerStep, openCheckoutFromCart } from "./helpers/checkout";
import { dismissCookieBanner, setupPurchaseMocks } from "./helpers/mocks";
import {
  captureFullPage,
  expectNoBottomNavOverlap,
  expectNoNextDevOverlay,
} from "./helpers/visual-qa";

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

test.describe.configure({ mode: "serial" });

test.describe("QA visuelle retail — production", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page);
  });

  test("accueil desktop 1440", async ({ page }) => {
    await captureFullPage(page, "/", "docs/retail-qa-home-desktop-1440.png", DESKTOP);
    await expectNoBottomNavOverlap(page);
    await expectNoSeriousAxeViolations(page);
  });

  test("accueil mobile 390", async ({ page }) => {
    await captureFullPage(page, "/", "docs/retail-qa-home-mobile-390.png", MOBILE);
    await expectNoBottomNavOverlap(page);
    await expectNoSeriousAxeViolations(page);
  });

  test("catalogue desktop 1440", async ({ page }) => {
    await captureFullPage(
      page,
      "/catalogue",
      "docs/retail-qa-catalogue-desktop-1440.png",
      DESKTOP,
    );
    await expect(
      page.getByRole("heading", { name: /catalogue vêtements enfants/i }),
    ).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test("catalogue mobile 390", async ({ page }) => {
    await captureFullPage(
      page,
      "/catalogue",
      "docs/retail-qa-catalogue-mobile-390.png",
      MOBILE,
    );
    await expectNoBottomNavOverlap(page);
    await expectNoSeriousAxeViolations(page);
  });

  test("fiche produit mobile 390", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    const href = await openSellableProductFromCatalogue(page);
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoNextDevOverlay(page);

    const purchase = page
      .locator('[aria-label="Ajouter au panier"]')
      .or(page.getByRole("button", { name: /ajouter/i }))
      .or(page.getByRole("heading", { level: 1 }))
      .first();
    await purchase.scrollIntoViewIfNeeded();
    await expectNoBottomNavOverlap(page);

    await page.screenshot({
      path: "docs/retail-qa-product-mobile-390.png",
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);
  });

  test("checkout mobile 390", async ({ page }) => {
    await setupPurchaseMocks(page);
    await page.setViewportSize(MOBILE);
    await ensureSeededCartOnPage(page);
    await openCheckoutFromCart(page);
    await fillCustomerStep(page);

    await page.waitForLoadState("networkidle");
    await expectNoNextDevOverlay(page);
    await expect(page.getByLabel("Code postal")).toBeVisible();

    await page.screenshot({
      path: "docs/retail-qa-checkout-mobile-390.png",
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);
  });
});
