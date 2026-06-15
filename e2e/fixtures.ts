import { test as base } from "@playwright/test";

const COOKIE_CONSENT_KEY = "tilouki-cookie-consent";

/** Préremplit le consentement cookies avant chaque navigation (évite les timeouts UI). */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript((storageKey) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          essential: true,
          analytics: false,
          date: new Date().toISOString(),
        }),
      );
    }, COOKIE_CONSENT_KEY);

    await use(page);
  },
});

export { expect } from "@playwright/test";
