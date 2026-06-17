import { describe, expect, it } from "vitest";

import { getSafeRedirectPath } from "@/lib/security/safe-redirect";

describe("getSafeRedirectPath", () => {
  it("accepte les chemins admin valides", () => {
    expect(getSafeRedirectPath("/admin")).toBe("/admin");
    expect(getSafeRedirectPath("/admin/commandes")).toBe("/admin/commandes");
  });

  it("accepte les chemins compte et favoris", () => {
    expect(getSafeRedirectPath("/compte")).toBe("/compte");
    expect(getSafeRedirectPath("/favoris")).toBe("/favoris");
  });

  it("rejette les open redirects", () => {
    expect(getSafeRedirectPath("//evil.com")).toBe("/admin");
    expect(getSafeRedirectPath("https://evil.com")).toBe("/admin");
    expect(getSafeRedirectPath("/catalogue")).toBe("/admin");
  });

  it("utilise le fallback si vide", () => {
    expect(getSafeRedirectPath(null)).toBe("/admin");
    expect(getSafeRedirectPath("")).toBe("/admin");
  });
});
