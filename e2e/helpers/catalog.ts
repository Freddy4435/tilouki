import { expect, type Page } from "@playwright/test";

import { dismissCookieBanner } from "./mocks";

export const CATALOGUE_HEADING = /^catalogue$/i;

function catalogueHeading(page: Page) {
  return page.getByRole("main").getByRole("heading", { name: CATALOGUE_HEADING });
}

export async function expectCataloguePageReady(page: Page) {
  const launch = page.getByTestId("catalogue-launch");
  if (await launch.isVisible().catch(() => false)) {
    return false;
  }
  await expect(catalogueHeading(page)).toBeVisible();
  return true;
}

/** Ouvre la première fiche produit vendable (liste catalogue / catégorie). */
export async function openSellableProductFromCatalogue(
  page: Page,
  options?: { skipGoto?: boolean },
): Promise<string | null> {
  if (!options?.skipGoto) {
    await page.goto("/catalogue");
  }

  const ready = await expectCataloguePageReady(page);
  if (!ready) return null;

  const card = page.locator("article.tilouki-product-card").first();
  const hasCard = await card.isVisible({ timeout: 20_000 }).catch(() => false);
  if (!hasCard) return null;

  const titleLink = card.locator('a[href^="/produit/"]').first();
  const href = await titleLink.getAttribute("href");
  if (!href?.startsWith("/produit/")) return null;

  await titleLink.click();
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

export async function goToCatalogueFromHome(page: Page) {
  await page.goto("/");
  const catalogueLink = page
    .getByRole("link", { name: /voir (tout )?(le )?catalogue|tout le catalogue/i })
    .first();
  await catalogueLink.click();
  await page.waitForURL(/\/catalogue/);
  const ready = await expectCataloguePageReady(page);
  if (!ready) {
    throw new Error("Catalogue en mode lancement — parcours e-commerce interrompu.");
  }
}

/** Page rayon prête : H1 dans main, contenu visible, grille ou état vide. */
export async function expectCategoryPageReady(
  page: Page,
  options?: { slug?: string; title?: RegExp | string },
) {
  if (options?.slug) {
    await expect(page).toHaveURL(new RegExp(`/categorie/${options.slug}(\\?|$)`), {
      timeout: 20_000,
    });
  } else {
    await expect(page).toHaveURL(/\/categorie\//, { timeout: 20_000 });
  }

  await page.waitForLoadState("networkidle").catch(() => undefined);

  const h1 = page.locator("#contenu-principal h1").first();
  await expect(h1).toBeVisible({ timeout: 30_000 });

  if (options?.title) {
    await expect(h1).toHaveText(options.title);
  }

  await expect
    .poll(
      async () =>
        (await page.locator("#contenu-principal").innerText()).trim().length > 20,
      {
        timeout: 20_000,
      },
    )
    .toBe(true);

  const hasProducts = await page
    .locator("article.tilouki-product-card")
    .first()
    .isVisible()
    .catch(() => false);
  const hasEmptyState = await page
    .getByRole("heading", {
      name: /ce rayon se remplit|aucune pièce pour cette sélection|aucun article pour cette sélection/i,
    })
    .isVisible()
    .catch(() => false);

  expect(hasProducts || hasEmptyState).toBe(true);
}

export async function openCategoryFromCatalogue(
  page: Page,
  categoryLabel: RegExp | string = /bébé/i,
): Promise<string | null> {
  await page.goto("/catalogue");
  const ready = await expectCataloguePageReady(page);
  if (!ready) return null;

  const quickNav = page.getByRole("navigation", { name: /raccourcis catalogue/i });
  await expect(quickNav).toBeVisible({ timeout: 20_000 });

  const quickChip = quickNav.getByRole("link", { name: categoryLabel });
  if ((await quickChip.count()) === 0) return null;

  const chip = quickChip.first();
  const href = await chip.getAttribute("href");
  if (!href?.startsWith("/categorie/")) return null;

  await page.goto(href);
  await expectCategoryPageReady(page);

  return href;
}

export async function openSellableProductFromCurrentListing(
  page: Page,
): Promise<string | null> {
  const card = page.locator("article.tilouki-product-card").first();
  if ((await card.count()) === 0) return null;

  const titleLink = card.locator('a[href^="/produit/"]').first();
  const href = await titleLink.getAttribute("href");
  if (!href?.startsWith("/produit/")) return null;

  await titleLink.click();
  await page.waitForURL(/\/produit\//);
  return href;
}

export async function selectFirstInStockVariant(page: Page) {
  const availableVariant = page.getByRole("radio", { checked: false }).filter({
    hasNot: page.locator("[aria-disabled='true']"),
  });

  if ((await availableVariant.count()) > 0) {
    await availableVariant.first().click();
    return;
  }

  const anyVariant = page.getByRole("radio").first();
  if ((await anyVariant.count()) > 0) {
    await anyVariant.click();
  }
}

function addToCartButton(page: Page) {
  const width = page.viewportSize()?.width ?? 1440;
  if (width >= 1024) {
    return page.getByRole("button", { name: "Ajouter au panier" });
  }
  return page
    .locator('[aria-label="Ajouter au panier"]')
    .getByRole("button", { name: /^ajouter$/i })
    .or(page.getByRole("button", { name: /^ajouter$/i }))
    .first();
}

export async function addCurrentProductToCart(page: Page) {
  await dismissCookieBanner(page);
  await selectFirstInStockVariant(page);

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
