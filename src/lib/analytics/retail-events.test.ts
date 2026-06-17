import { afterEach, describe, expect, it, vi } from "vitest";

import { trackRetailEvent } from "@/lib/analytics/retail-events";

describe("trackRetailEvent", () => {
  const originalDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  afterEach(() => {
    process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = originalDomain;
    vi.unstubAllGlobals();
  });

  it("n'appelle pas plausible sans domaine configuré", () => {
    process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = "";
    const plausible = vi.fn();
    vi.stubGlobal("window", { plausible });

    trackRetailEvent("add_to_cart", { product_slug: "body-bebe" });

    expect(plausible).not.toHaveBeenCalled();
  });

  it("envoie un goal avec props sérialisées", () => {
    process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = "tilouki.fr";
    const plausible = vi.fn();
    vi.stubGlobal("window", { plausible });

    trackRetailEvent("begin_checkout", { item_count: 2, value_cents: 4500 });

    expect(plausible).toHaveBeenCalledWith("begin_checkout", {
      props: { item_count: 2, value_cents: 4500 },
    });
  });
});
