import { describe, expect, it, beforeEach } from "vitest";

import {
  resetConsultedSizesStore,
  useConsultedSizesStore,
} from "@/lib/favorites/consulted-sizes-store";

describe("consulted sizes store", () => {
  beforeEach(() => {
    resetConsultedSizesStore();
  });

  it("enregistre une taille consultée par produit", () => {
    const store = useConsultedSizesStore.getState();
    store.track({
      productSlug: "robe-fille",
      productName: "Robe fleurie",
      label: "6 ans",
    });

    expect(store.count()).toBe(1);
    expect(store.listUniqueLabels()).toEqual(["6 ans"]);
  });

  it("remonte la consultation la plus récente en premier", () => {
    const store = useConsultedSizesStore.getState();
    store.track({ productSlug: "a", productName: "A", label: "4 ans" });
    store.track({ productSlug: "b", productName: "B", label: "6 ans" });

    expect(store.listUniqueLabels()).toEqual(["6 ans", "4 ans"]);
  });

  it("dédoublonne slug + taille", () => {
    const store = useConsultedSizesStore.getState();
    store.track({ productSlug: "robe", productName: "Robe", label: "6 ans" });
    store.track({ productSlug: "robe", productName: "Robe", label: "6 ans" });

    expect(store.count()).toBe(1);
  });
});
