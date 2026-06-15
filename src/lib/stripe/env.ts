export type StripeEnvIssueLevel = "error" | "warn";

export interface StripeEnvIssue {
  level: StripeEnvIssueLevel;
  message: string;
}

function stripeKeyMode(key: string): "test" | "live" | "unknown" {
  if (key.startsWith("sk_test_") || key.startsWith("pk_test_")) return "test";
  if (key.startsWith("sk_live_") || key.startsWith("pk_live_")) return "live";
  return "unknown";
}

/**
 * Vérifie la cohérence des trois variables Stripe requises.
 * Utilisé par `npm run verify:deploy` (règles alignées) et les tests unitaires.
 */
export function validateStripeEnvironment(options?: {
  production?: boolean;
  env?: NodeJS.ProcessEnv;
}): StripeEnvIssue[] {
  const env = options?.env ?? process.env;
  const production = options?.production ?? process.env.NODE_ENV === "production";
  const issues: StripeEnvIssue[] = [];

  const secret = env.STRIPE_SECRET_KEY?.trim() ?? "";
  const publishable = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";

  if (!secret) {
    issues.push({ level: "error", message: "STRIPE_SECRET_KEY manquant." });
  }
  if (!publishable) {
    issues.push({
      level: "error",
      message: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquant.",
    });
  }
  if (!webhookSecret) {
    issues.push({ level: "error", message: "STRIPE_WEBHOOK_SECRET manquant." });
  }

  if (webhookSecret && !webhookSecret.startsWith("whsec_")) {
    issues.push({
      level: "error",
      message: "STRIPE_WEBHOOK_SECRET doit commencer par whsec_.",
    });
  }

  const secretMode = stripeKeyMode(secret);
  const publishableMode = stripeKeyMode(publishable);

  if (production) {
    if (secret && secretMode !== "live") {
      issues.push({
        level: "error",
        message: "STRIPE_SECRET_KEY doit être en mode Live (sk_live_…) en production.",
      });
    }
    if (publishable && publishableMode !== "live") {
      issues.push({
        level: "error",
        message:
          "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY doit être en mode Live (pk_live_…) en production.",
      });
    }
  } else if (secret && secretMode === "live") {
    issues.push({
      level: "warn",
      message:
        "STRIPE_SECRET_KEY en mode Live détectée en développement — préférez sk_test_ en local.",
    });
  }

  if (
    secretMode !== "unknown" &&
    publishableMode !== "unknown" &&
    secretMode !== publishableMode
  ) {
    issues.push({
      level: "error",
      message:
        "Clés Stripe incohérentes : la clé secrète et la clé publique doivent être toutes deux en test ou toutes deux en live.",
    });
  }

  return issues;
}

export function isStripeEnvironmentValid(options?: {
  production?: boolean;
  env?: NodeJS.ProcessEnv;
}): boolean {
  return !validateStripeEnvironment(options).some((issue) => issue.level === "error");
}

export function isStripeServerConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
}

/** Clé publique Stripe — utilisable côté client si besoin (Elements, etc.). */
export function getStripePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || undefined;
}

export function isStripePublishableConfigured(): boolean {
  return Boolean(getStripePublishableKey());
}

/** Les trois variables requises pour encaisser et recevoir les webhooks. */
export function isStripeCheckoutReady(): boolean {
  return (
    isStripeServerConfigured() &&
    isStripePublishableConfigured() &&
    isStripeWebhookConfigured()
  );
}
