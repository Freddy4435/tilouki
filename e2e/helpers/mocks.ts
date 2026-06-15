import type { Page, Route } from "@playwright/test";

/** Ferme le bandeau cookies s'il est encore visible (secours si init script absent). */
export async function dismissCookieBanner(
  page: Page,
  choice: "accept" | "reject" = "reject",
) {
  const banner = page.getByRole("dialog", { name: /gestion des cookies/i });
  const visible = await banner.isVisible().catch(() => false);
  if (!visible) return;

  if (choice === "accept") {
    await banner.getByRole("button", { name: /^ok$/i }).click();
  } else {
    await banner.getByRole("button", { name: /^refuser$/i }).click();
  }

  await banner.waitFor({ state: "hidden", timeout: 5_000 }).catch(() => undefined);
}

export async function mockCartValidation(page: Page) {
  await page.route("**/api/cart/validate", async (route: Route) => {
    let body: { items?: Array<{ variantId: string; quantity: number }> } = {};
    try {
      body = route.request().postDataJSON() as typeof body;
    } catch {
      body = {};
    }
    const items = (body.items ?? []).map((item) => ({
      variantId: item.variantId,
      stockQuantity: 99,
      unitPriceCents: 2500,
      isAvailable: true,
      requestedQuantity: item.quantity,
      adjustedQuantity: item.quantity,
    }));

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        valid: true,
        items,
        messages: [],
        subtotalCents: items.reduce(
          (sum, i) => sum + i.unitPriceCents * i.requestedQuantity,
          0,
        ),
        shippingCents: 490,
        totalCents:
          items.reduce((sum, i) => sum + i.unitPriceCents * i.requestedQuantity, 0) +
          490,
      }),
    });
  });
}

export async function mockCheckoutSession(
  page: Page,
  options?: { redirectPath?: string },
) {
  const redirectPath = options?.redirectPath ?? "/commande/succes?e2e=1";

  await page.route("**/api/checkout/create-session", async (route: Route) => {
    const base = new URL(page.url()).origin;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ url: `${base}${redirectPath}` }),
    });
  });
}

function buildDevMockRelayPoints(zip: string, city: string) {
  const normalizedZip = zip.replace(/\s/g, "").slice(0, 5) || "75001";
  const normalizedCity = city.trim() || "Paris";
  const names = [
    "[E2E] Tabac Presse du Centre",
    "[E2E] Supérette Proximité",
    "[E2E] Locker Relais Express",
  ];
  const addresses = [
    "12 rue de la Paix",
    "45 avenue Jean Jaurès",
    "8 place de la Mairie",
  ];

  return names.map((name, index) => ({
    id: `E2E-RELAY-${normalizedZip}-0${index + 1}`,
    name,
    address: addresses[index] ?? "1 rue Exemple",
    zip: normalizedZip,
    city: normalizedCity,
    country: "FR",
    openingHours: "Lun-Ven 9h-19h",
    isDevMock: false,
  }));
}

/** Points relais fictifs — nécessaire car le mock serveur est désactivé en NODE_ENV=production. */
export async function mockRelayPoints(page: Page) {
  await page.route("**/api/shipping/relay-points**", async (route: Route) => {
    const url = new URL(route.request().url());
    const zip = url.searchParams.get("zip") ?? "75001";
    const city = url.searchParams.get("city") ?? "Paris";

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        points: buildDevMockRelayPoints(zip, city),
        source: "dev_mock",
        configured: true,
        provider: "dev_mock",
        carrier: "mondial_relay",
        devMock: true,
      }),
    });
  });
}

export async function setupPurchaseMocks(page: Page) {
  await mockCartValidation(page);
  await mockRelayPoints(page);
  await mockCheckoutSession(page);
}
