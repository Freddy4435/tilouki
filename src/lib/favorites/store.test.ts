import { beforeEach, describe, expect, it } from "vitest";

import {
  MAX_FAVORITES,
  resetFavoritesStore,
  useFavoritesStore,
} from "@/lib/favorites/store";

describe("favorites store", () => {
  beforeEach(() => {
    resetFavoritesStore();
  });

  it("toggle ajoute et retire un slug", () => {
    const store = useFavoritesStore.getState();

    expect(store.toggle("robe-ete")).toBe(true);
    expect(store.has("robe-ete")).toBe(true);
    expect(store.count()).toBe(1);

    expect(store.toggle("robe-ete")).toBe(false);
    expect(store.has("robe-ete")).toBe(false);
    expect(store.count()).toBe(0);
  });

  it("list retourne une copie des slugs", () => {
    const store = useFavoritesStore.getState();
    store.toggle("body-bebe");
    store.toggle("short-surf");

    const list = store.list();
    expect(list).toEqual(["body-bebe", "short-surf"]);
    list.push("hack");
    expect(store.list()).toEqual(["body-bebe", "short-surf"]);
  });

  it("ignore les slugs vides", () => {
    const store = useFavoritesStore.getState();
    expect(store.toggle("   ")).toBe(false);
    expect(store.count()).toBe(0);
    expect(store.has("")).toBe(false);
  });

  it("limite le nombre de favoris", () => {
    const store = useFavoritesStore.getState();

    for (let index = 0; index < MAX_FAVORITES + 5; index += 1) {
      store.toggle(`produit-${index}`);
    }

    expect(store.count()).toBe(MAX_FAVORITES);
    expect(store.list()[0]).toBe("produit-5");
  });
});
