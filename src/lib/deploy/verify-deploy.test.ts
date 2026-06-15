import { describe, expect, it } from "vitest";

import {
  PRODUCTION_REQUIRED_STRING_KEYS,
  runProductionEnvChecks,
  summarizeDeployChecks,
  verifyGitignoreCoversSecrets,
  verifyStripeWebhookEventsInSource,
  verifyVercelCronConfig,
} from "@/lib/deploy/verify-deploy-checks";

function completeProductionEnv() {
  return {
    NEXT_PUBLIC_SITE_URL: "https://tilouki.fr",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "supabase-anon-key-test-placeholder-only",
    SUPABASE_SERVICE_ROLE_KEY: "supabase-service-role-test-placeholder-only",
    STRIPE_SECRET_KEY: "sk_live_placeholder",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_placeholder",
    STRIPE_WEBHOOK_SECRET: "whsec_placeholder_secret",
    FROM_EMAIL: "commandes@tilouki.fr",
    ADMIN_EMAIL: "admin@tilouki.fr",
    MONDIAL_RELAY_ENSEIGNE: "BDTEST13",
    MONDIAL_RELAY_PRIVATE_KEY: "private-key-placeholder",
    NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID: "BDTEST13",
    CRON_SECRET: "a".repeat(32),
    UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
    UPSTASH_REDIS_REST_TOKEN: "token-placeholder",
    RESEND_API_KEY: "re_placeholder",
  };
}

describe("verify-deploy-checks — production", () => {
  it("liste les variables obligatoires alignées avec .env.example", () => {
    expect(PRODUCTION_REQUIRED_STRING_KEYS).toEqual(
      expect.arrayContaining([
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "MONDIAL_RELAY_PRIVATE_KEY",
        "CRON_SECRET",
        "UPSTASH_REDIS_REST_URL",
        "UPSTASH_REDIS_REST_TOKEN",
      ]),
    );
  });

  it("valide un environnement production complet", () => {
    const summary = summarizeDeployChecks(
      runProductionEnvChecks(completeProductionEnv()),
    );
    expect(summary.valid).toBe(true);
    expect(summary.errorCount).toBe(0);
  });

  it("échoue si Stripe Live ou webhook est absent ou incohérent", () => {
    const summary = summarizeDeployChecks(
      runProductionEnvChecks({
        ...completeProductionEnv(),
        STRIPE_SECRET_KEY: "sk_test_abc",
        STRIPE_WEBHOOK_SECRET: "",
      }),
    );
    expect(summary.valid).toBe(false);
    expect(summary.errors.some((e) => e.id === "STRIPE_WEBHOOK_SECRET")).toBe(true);
    expect(summary.errors.some((e) => e.id === "stripe-live-secret")).toBe(true);
  });

  it("échoue si SHIPPING_DEV_MOCK=true en production", () => {
    const summary = summarizeDeployChecks(
      runProductionEnvChecks({
        ...completeProductionEnv(),
        SHIPPING_DEV_MOCK: "true",
      }),
    );
    expect(summary.valid).toBe(false);
    expect(summary.errors.some((e) => e.id === "shipping-dev-mock")).toBe(true);
  });

  it("échoue si Upstash est absent", () => {
    const summary = summarizeDeployChecks(
      runProductionEnvChecks({
        ...completeProductionEnv(),
        UPSTASH_REDIS_REST_URL: "",
        UPSTASH_REDIS_REST_TOKEN: "",
      }),
    );
    expect(summary.valid).toBe(false);
    expect(
      summary.errors.some(
        (e) =>
          e.id === "UPSTASH_REDIS_REST_URL" &&
          e.message.includes("rate limiting Upstash obligatoire"),
      ),
    ).toBe(true);
  });

  it("échoue si NEXT_PUBLIC_SITE_URL n'est pas HTTPS", () => {
    const summary = summarizeDeployChecks(
      runProductionEnvChecks({
        ...completeProductionEnv(),
        NEXT_PUBLIC_SITE_URL: "http://tilouki.fr",
      }),
    );
    expect(summary.valid).toBe(false);
    expect(summary.errors.some((e) => e.id === "site-url-https")).toBe(true);
  });
});

describe("verify-deploy-checks — structure", () => {
  it("exige les événements webhook Stripe dans le code", () => {
    const ok = verifyStripeWebhookEventsInSource(
      '"checkout.session.completed" "checkout.session.expired"',
    );
    expect(ok.every((c) => c.level === "error")).toBe(true);
  });

  it("valide le cron Vercel", () => {
    const checks = verifyVercelCronConfig({
      crons: [{ path: "/api/cron/expire-pending-orders", schedule: "0 3 * * *" }],
    });
    expect(checks[0]?.level).toBe("ok");
  });

  it("vérifie .gitignore pour les secrets", () => {
    const gitignore = ".env*\n!.env.example\n.vercel\n/.next/\nnode_modules";
    const checks = verifyGitignoreCoversSecrets(gitignore);
    expect(checks.every((c) => c.level === "ok")).toBe(true);
  });
});
