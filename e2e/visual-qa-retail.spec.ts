import { test, expect } from "./fixtures";

import { expectNoSeriousAxeViolations } from "./helpers/accessibility";
import { ensureSeededCartOnPage } from "./helpers/cart";
import {
  expectCataloguePageReady,
  openCategoryFromCatalogue,
  openSellableProductFromCatalogue,
} from "./helpers/catalog";
import { fillCustomerStep, openCheckoutFromCart } from "./helpers/checkout";
import { dismissCookieBanner, setupPurchaseMocks } from "./helpers/mocks";
import {
  expectEditorialTiloukiImage,
  expectHomeProductsBeforeBuyingGuides,
  expectNoTiloukiPackInProductMain,
} from "./helpers/retail";
import {
  captureFullPage,
  expectNoBottomNavOverlap,
  expectNoNextDevOverlay,
  QA_SCREENSHOT_DIR,
} from "./helpers/visual-qa";

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

function qaPath(filename: string) {
  return `${QA_SCREENSHOT_DIR}/${filename}`;
}

/** Ouvre une fiche produit vendable (catalogue, home ou catégorie). */
async function openProductForVisualQa(page: import("@playwright/test").Page) {
  let href = await openSellableProductFromCatalogue(page);
  if (href) return href;

  await page.goto("/");
  const homeCard = page.locator("article.tilouki-product-card a[href^='/produit/']").first();
  if ((await homeCard.count()) > 0) {
    await homeCard.click();
    await page.waitForURL(/\/produit\//);
    return page.url();
  }

  await page.goto("/catalogue");
  if (!(await expectCataloguePageReady(page))) {
    return null;
  }

  const categoryHref = await openCategoryFromCatalogue(page, /pyjamas/i);
  if (!categoryHref) return null;

  const categoryCard = page
    .locator("article.tilouki-product-card a[href^='/produit/']")
    .first();
  const hasCategoryCard = await categoryCard.isVisible({ timeout: 20_000 }).catch(() => false);
  if (!hasCategoryCard) return null;

  await categoryCard.click();
  await page.waitForURL(/\/produit\//);
  return page.url();
}

test.describe.configure({ mode: "serial" });

test.describe("QA visuelle retail — production", () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieBanner(page);
  });

  test("accueil desktop 1440 — produits avant guides", async ({ page }) => {
    await captureFullPage(page, "/", qaPath("home-desktop-1440.png"), DESKTOP);
    await expectHomeProductsBeforeBuyingGuides(page);
    await expectNoSeriousAxeViolations(page);
  });

  test("accueil mobile 390", async ({ page }) => {
    await captureFullPage(page, "/", qaPath("home-mobile-390.png"), MOBILE);
    await expectHomeProductsBeforeBuyingGuides(page);
    await expectNoBottomNavOverlap(page);
    await expectNoSeriousAxeViolations(page);
  });

  test("catalogue desktop 1440", async ({ page }) => {
    await captureFullPage(page, "/catalogue", qaPath("catalogue-desktop-1440.png"), DESKTOP);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test("catalogue mobile 390", async ({ page }) => {
    await captureFullPage(page, "/catalogue", qaPath("catalogue-mobile-390.png"), MOBILE);
    await expectNoBottomNavOverlap(page);
    await expectNoSeriousAxeViolations(page);
  });

  test("catégorie — visuel Tilouki éditorial autorisé", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/catalogue");
    const ready = await expectCataloguePageReady(page);
    test.skip(!ready, "Catalogue en mode lancement");

    const href = await openCategoryFromCatalogue(page, /bébé/i);
    test.skip(!href, "Catégorie bébé inaccessible");

    await expectEditorialTiloukiImage(page);
    await expectNoSeriousAxeViolations(page);
  });

  test("catalogue vide — lancement éditorial", async ({ page }) => {
    await page.goto("/catalogue");
    const launch = page.getByTestId("catalogue-launch");
    const isLaunch = await launch.isVisible().catch(() => false);

    if (!isLaunch) {
      test.skip(true, "Catalogue avec produits — test lancement non applicable");
    }

    await expect(
      page.getByRole("heading", { name: /le catalogue tilouki arrive/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /guide des tailles|atelier des tailles/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /guides d'achat/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /newsletter|inscrire à la newsletter/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Trier par")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /filtres & tri/i })).toHaveCount(0);

    await captureFullPage(
      page,
      "/catalogue",
      qaPath("catalogue-launch-desktop-1440.png"),
      DESKTOP,
    );
    await expectNoSeriousAxeViolations(page);
  });

  test("fiche produit mobile 390 — pas de photo pack Tilouki", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    const href = await openProductForVisualQa(page);
    test.skip(!href, "Aucun produit vendable — photo commerciale requise");

    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoTiloukiPackInProductMain(page);
    await expectNoNextDevOverlay(page);

    const purchase = page
      .locator('[aria-label="Ajouter au panier"]')
      .or(page.getByRole("button", { name: /ajouter/i }))
      .or(page.getByRole("heading", { level: 1 }))
      .first();
    await purchase.scrollIntoViewIfNeeded();
    await expectNoBottomNavOverlap(page);

    await page.screenshot({
      path: qaPath("product-mobile-390.png"),
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);
  });

  test("panier mobile 390", async ({ page }) => {
    await setupPurchaseMocks(page);
    await page.setViewportSize(MOBILE);
    await ensureSeededCartOnPage(page);
    await page.goto("/panier");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /votre panier/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /passer commande/i })).toBeVisible();
    await expectNoBottomNavOverlap(page);
    await expectNoNextDevOverlay(page);

    await page.screenshot({
      path: qaPath("cart-mobile-390.png"),
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
    await expectNoBottomNavOverlap(page);

    await page.screenshot({
      path: qaPath("checkout-mobile-390.png"),
      fullPage: true,
    });
    await expectNoSeriousAxeViolations(page);
  });
});
