import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isStripeCheckoutReady,
  isStripeEnvironmentValid,
  validateStripeEnvironment,
} from "@/lib/stripe/env";

const validTestEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "development",
  STRIPE_SECRET_KEY: "sk_test_abc",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_abc",
  STRIPE_WEBHOOK_SECRET: "whsec_test_secret",
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("validateStripeEnvironment", () => {
  it("accepte un trio test cohérent", () => {
    expect(validateStripeEnvironment({ env: validTestEnv })).toEqual([]);
    expect(isStripeEnvironmentValid({ env: validTestEnv })).toBe(true);

    vi.stubEnv("STRIPE_SECRET_KEY", validTestEnv.STRIPE_SECRET_KEY);
    vi.stubEnv(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      validTestEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    );
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", validTestEnv.STRIPE_WEBHOOK_SECRET);
    expect(isStripeCheckoutReady()).toBe(true);
  });

  it("refuse une clé secrète manquante", () => {
    const issues = validateStripeEnvironment({
      env: { ...validTestEnv, STRIPE_SECRET_KEY: "" },
    });
    expect(issues.some((issue) => issue.message.includes("STRIPE_SECRET_KEY"))).toBe(
      true,
    );
  });

  it("refuse un mélange test/live", () => {
    const issues = validateStripeEnvironment({
      env: {
        ...validTestEnv,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_abc",
      },
    });
    expect(issues.some((issue) => issue.message.includes("incohérentes"))).toBe(true);
  });

  it("refuse sk_test en production", () => {
    const issues = validateStripeEnvironment({
      production: true,
      env: validTestEnv,
    });
    expect(issues.some((issue) => issue.message.includes("sk_live_"))).toBe(true);
  });

  it("accepte sk_live + pk_live en production", () => {
    const issues = validateStripeEnvironment({
      production: true,
      env: {
        NODE_ENV: "production",
        STRIPE_SECRET_KEY: "sk_live_abc",
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_abc",
        STRIPE_WEBHOOK_SECRET: "whsec_live_secret",
      },
    });
    expect(issues.filter((issue) => issue.level === "error")).toEqual([]);
  });

  it("refuse un webhook secret mal formé", () => {
    const issues = validateStripeEnvironment({
      env: { ...validTestEnv, STRIPE_WEBHOOK_SECRET: "not-a-whsec" },
    });
    expect(issues.some((issue) => issue.message.includes("whsec_"))).toBe(true);
  });
});
