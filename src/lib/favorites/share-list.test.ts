import { describe, expect, it } from "vitest";

import {
  buildSharedFavoritesPath,
  decodeFavoritesListToken,
  encodeFavoritesListToken,
} from "@/lib/favorites/share-list";

describe("share-list", () => {
  it("encode et decode une liste de slugs", () => {
    const token = encodeFavoritesListToken(["body-bebe", "pantalon-pluie"]);
    expect(token).toBeTruthy();
    expect(decodeFavoritesListToken(token!)).toEqual(["body-bebe", "pantalon-pluie"]);
  });

  it("construit un chemin public", () => {
    expect(buildSharedFavoritesPath(["robe-fille"])).toBeTruthy();
  });
});
