import { expect, type Page } from "@playwright/test";

const TILOUKI_PACK_MARKERS = [
  "/images/tilouki/",
  "images%2Ftilouki",
  "images/tilouki",
] as const;

async function pageHasVisibleTiloukiPackImage(page: Page): Promise<boolean> {
  return page.evaluate(
    (markers) => {
      const images = [...document.querySelectorAll("img")];
      return images.some((img) => {
        const sources = `${img.getAttribute("src") ?? ""} ${img.getAttribute("srcset") ?? ""}`;
        const lower = sources.toLowerCase();
        return markers.some((marker: string) => lower.includes(marker.toLowerCase()));
      });
    },
    [...TILOUKI_PACK_MARKERS],
  );
}

async function productMainHasTiloukiPackImage(page: Page): Promise<boolean> {
  return page.evaluate(
    (markers) => {
      const main = document.querySelector("main");
      if (!main) return false;
      const images = [...main.querySelectorAll("img")];
      return images.some((img) => {
        const sources = `${img.getAttribute("src") ?? ""} ${img.getAttribute("srcset") ?? ""}`;
        const lower = sources.toLowerCase();
        return markers.some((marker: string) => lower.includes(marker.toLowerCase()));
      });
    },
    [...TILOUKI_PACK_MARKERS],
  );
}

/** Les guides d'achat / blog ne doivent pas précéder les produits sur l'accueil. */
export async function expectHomeProductsBeforeBuyingGuides(page: Page) {
  await page.goto("/");

  const vestiaire = page.locator("#home-vestiaire");
  const guidesTitle = page.locator("#home-buying-help-title");

  await expect(vestiaire).toBeVisible();

  const guidesFollowProducts = await page.evaluate(() => {
    const products = document.getElementById("home-vestiaire");
    const guides = document.getElementById("home-buying-help-title");
    if (!products || !guides) return guides == null;
    return Boolean(
      products.compareDocumentPosition(guides) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  expect(guidesFollowProducts).toBe(true);

  if (await guidesTitle.isVisible()) {
    const vestiaireBox = await vestiaire.boundingBox();
    const guidesBox = await guidesTitle.boundingBox();
    if (vestiaireBox && guidesBox) {
      expect(vestiaireBox.y).toBeLessThan(guidesBox.y);
    }
  }
}

/** Pack Tilouki autorisé sur surfaces éditoriales (bandeau catégorie, rituels). */
export async function expectEditorialTiloukiImage(page: Page) {
  await page.waitForLoadState("networkidle");
  await expect
    .poll(async () => pageHasVisibleTiloukiPackImage(page), { timeout: 15_000 })
    .toBe(true);
}

/** Aucune photo pack Tilouki dans la galerie produit commerciale. */
export async function expectNoTiloukiPackInProductMain(page: Page) {
  await expect
    .poll(async () => productMainHasTiloukiPackImage(page), { timeout: 5_000 })
    .toBe(false);
}

export async function openProductSizeGuideSection(page: Page) {
  await page
    .getByRole("link", { name: /guide des tailles/i })
    .first()
    .click();
  await expect(page.locator("#size-guide")).toBeVisible();
}

export async function toggleFavoriteOnProductPage(page: Page) {
  const favoriteButton = page.getByRole("button", {
    name: /ajouter aux favoris|retirer des favoris/i,
  });
  await favoriteButton.first().click();
  await expect(favoriteButton.first()).toHaveAttribute("aria-pressed", "true");
}

export async function searchCatalogue(page: Page, query: string) {
  if (!page.url().includes("/catalogue")) {
    await page.goto("/catalogue");
  }

  const width = page.viewportSize()?.width ?? 1440;

  if (width < 768) {
    const headerSearch = page.getByRole("searchbox", { name: /^rechercher$/i });
    if (!(await headerSearch.isVisible().catch(() => false))) {
      await page.getByRole("button", { name: /ouvrir la recherche/i }).click();
    }
    await expect(headerSearch).toBeVisible();
    await headerSearch.fill(query);
    await headerSearch.press("Enter");
  } else {
    const catalogSearch = page.getByLabel(/rechercher dans le catalogue/i);
    await catalogSearch.fill(query);
    await catalogSearch.press("Enter");
  }

  await page.waitForURL(/[?&]q=/);
}
