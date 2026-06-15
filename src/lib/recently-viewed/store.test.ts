import { beforeEach, describe, expect, it } from "vitest";

import {
  MAX_RECENTLY_VIEWED,
  resetRecentlyViewedStore,
  useRecentlyViewedStore,
} from "@/lib/recently-viewed/store";

describe("recently viewed store", () => {
  beforeEach(() => {
    resetRecentlyViewedStore();
  });

  it("enregistre une vue et remonte l'article en tête", () => {
    const store = useRecentlyViewedStore.getState();

    store.trackView("robe-ete");
    store.trackView("body-bebe");
    store.trackView("robe-ete");

    expect(store.listSlugs()).toEqual(["robe-ete", "body-bebe"]);
    expect(store.count()).toBe(2);
  });

  it("ignore les slugs vides", () => {
    const store = useRecentlyViewedStore.getState();
    store.trackView("   ");
    expect(store.count()).toBe(0);
    expect(store.listSlugs()).toEqual([]);
  });

  it("limite le nombre d'entrées", () => {
    const store = useRecentlyViewedStore.getState();

    for (let index = 0; index < MAX_RECENTLY_VIEWED + 3; index += 1) {
      store.trackView(`produit-${index}`);
    }

    expect(store.count()).toBe(MAX_RECENTLY_VIEWED);
    expect(store.listSlugs()[0]).toBe(`produit-${MAX_RECENTLY_VIEWED + 2}`);
  });
});
