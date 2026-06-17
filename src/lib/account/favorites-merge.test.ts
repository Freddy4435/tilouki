import { describe, expect, it } from "vitest";

import { mergeFavoriteSlugs } from "@/lib/account/favorites-merge";

describe("mergeFavoriteSlugs", () => {
  it("fusionne sans doublons en gardant l'ordre local", () => {
    expect(mergeFavoriteSlugs(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
  });
});
