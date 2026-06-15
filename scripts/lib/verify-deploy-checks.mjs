/**
 * Contrôles verify:deploy — garder synchronisé avec
 * src/lib/deploy/verify-deploy.test.ts et docs/PRODUCTION_CHECKLIST.md
 */

export const PRODUCTION_REQUIRED_STRING_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "FROM_EMAIL",
  "ADMIN_EMAIL",
  "MONDIAL_RELAY_PRIVATE_KEY",
  "NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID",
  "CRON_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

export const MONDIAL_RELAY_ENSEIGNE_KEYS = [
  "MONDIAL_RELAY_ENSEIGNE",
  "MONDIAL_RELAY_BRAND_ID",
  "NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID",
];

export const STRIPE_WEBHOOK_EVENTS_REQUIRED = [
  "checkout.session.completed",
  "checkout.session.expired",
  "payment_intent.payment_failed",
  "charge.refunded",
];

/**
 * @typedef {object} DeployCheck
 * @property {string} id
 * @property {"error" | "warn" | "ok"} level
 * @property {string} message
 * @property {string} [fix]
 */

/**
 * @param {string} value
 */
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * @param {Record<string, string | undefined>} envVars
 */
export function resolveMondialRelayBrandId(envVars) {
  return (
    envVars.MONDIAL_RELAY_ENSEIGNE?.trim() ||
    envVars.MONDIAL_RELAY_BRAND_ID?.trim() ||
    envVars.NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID?.trim() ||
    ""
  );
}

/**
 * @param {Record<string, string | undefined>} envVars
 * @returns {"resend" | "smtp" | null}
 */
export function resolveEmailProvider(envVars) {
  if (envVars.RESEND_API_KEY?.trim()) return "resend";
  if (
    envVars.SMTP_HOST?.trim() &&
    envVars.SMTP_USER?.trim() &&
    envVars.SMTP_PASSWORD?.trim()
  ) {
    return "smtp";
  }
  return null;
}

/**
 * @param {Record<string, string | undefined>} envVars
 * @returns {DeployCheck[]}
 */
export function runProductionEnvChecks(envVars) {
  /** @type {DeployCheck[]} */
  const checks = [];

  for (const key of PRODUCTION_REQUIRED_STRING_KEYS) {
    const value = envVars[key]?.trim() ?? "";
    if (!value) {
      const upstashHint =
        key === "UPSTASH_REDIS_REST_URL" || key === "UPSTASH_REDIS_REST_TOKEN";
      checks.push({
        id: key,
        level: "error",
        message: upstashHint
          ? `${key} absent — rate limiting Upstash obligatoire en production (le fallback mémoire est inopérant sur Vercel serverless)`
          : `${key} absent`,
        fix: fixHintForKey(key),
      });
      continue;
    }

    if (key === "NEXT_PUBLIC_SITE_URL" && !value.startsWith("https://")) {
      continue;
    }

    checks.push({
      id: key,
      level: "ok",
      message: `${key} présent`,
    });
  }

  if (!MONDIAL_RELAY_ENSEIGNE_KEYS.some((key) => envVars[key]?.trim())) {
    checks.push({
      id: "mondial-relay-enseigne",
      level: "error",
      message: "Code enseigne Mondial Relay absent",
      fix: "Renseignez MONDIAL_RELAY_ENSEIGNE (ou MONDIAL_RELAY_BRAND_ID) avec le code fourni par Mondial Relay — identique à NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID.",
    });
  }

  const emailProvider = resolveEmailProvider(envVars);
  if (!emailProvider) {
    checks.push({
      id: "email-provider",
      level: "error",
      message: "Aucun fournisseur e-mail configuré",
      fix: "Ajoutez RESEND_API_KEY (recommandé) ou SMTP_HOST + SMTP_USER + SMTP_PASSWORD dans Vercel. Voir docs/variables-production.md.",
    });
  } else {
    checks.push({
      id: "email-provider",
      level: "ok",
      message: `Fournisseur e-mail : ${emailProvider}`,
    });
  }

  for (const key of ["FROM_EMAIL", "ADMIN_EMAIL"]) {
    const value = envVars[key]?.trim() ?? "";
    if (value && !isValidEmail(value)) {
      checks.push({
        id: `${key}-format`,
        level: "error",
        message: `${key} : format e-mail invalide`,
        fix: `Corrigez ${key} (ex. commandes@votre-domaine.fr).`,
      });
    }
  }

  const siteUrl = envVars.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (siteUrl && !siteUrl.startsWith("https://")) {
    checks.push({
      id: "site-url-https",
      level: "error",
      message: "NEXT_PUBLIC_SITE_URL doit être en HTTPS",
      fix: "Utilisez https://votre-domaine.fr (pas http://) dans Vercel → Environment Variables.",
    });
  } else if (siteUrl.startsWith("https://")) {
    const webhookUrl = `${siteUrl.replace(/\/$/, "")}/api/webhooks/stripe`;
    checks.push({
      id: "stripe-webhook-url",
      level: "ok",
      message: `Webhook Stripe attendu : ${webhookUrl}`,
      fix: "Créez cet endpoint en mode Live dans le Dashboard Stripe → Webhooks.",
    });
  }

  const stripeSecret = envVars.STRIPE_SECRET_KEY?.trim() ?? "";
  const stripePublic = envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";
  const webhookSecret = envVars.STRIPE_WEBHOOK_SECRET?.trim() ?? "";

  if (stripeSecret) {
    if (stripeSecret.startsWith("sk_test_")) {
      checks.push({
        id: "stripe-live-secret",
        level: "error",
        message: "STRIPE_SECRET_KEY en mode test (sk_test_)",
        fix: "Basculez en Live : Dashboard Stripe → Developers → API keys → clé secrète sk_live_…",
      });
    } else if (!stripeSecret.startsWith("sk_live_")) {
      checks.push({
        id: "stripe-live-secret",
        level: "error",
        message: "STRIPE_SECRET_KEY : format Live attendu (sk_live_…)",
        fix: "Copiez la clé secrète Live depuis le Dashboard Stripe.",
      });
    }
  }

  if (stripePublic) {
    if (stripePublic.startsWith("pk_test_")) {
      checks.push({
        id: "stripe-live-public",
        level: "error",
        message: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en mode test (pk_test_)",
        fix: "Utilisez la clé publique Live pk_live_… dans Vercel.",
      });
    } else if (!stripePublic.startsWith("pk_live_")) {
      checks.push({
        id: "stripe-live-public",
        level: "error",
        message: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY : format Live attendu (pk_live_…)",
        fix: "Copiez la clé publiable Live depuis le Dashboard Stripe.",
      });
    }
  }

  if (
    stripeSecret.startsWith("sk_live_") &&
    stripePublic.startsWith("pk_live_") === false &&
    stripePublic
  ) {
    checks.push({
      id: "stripe-mode-mismatch",
      level: "error",
      message: "Clés Stripe incohérentes (secrète Live + publique non Live)",
      fix: "Les deux clés doivent être en mode Live (sk_live_ + pk_live_).",
    });
  }
  if (stripeSecret.startsWith("sk_test_") && stripePublic.startsWith("pk_live_")) {
    checks.push({
      id: "stripe-mode-mismatch",
      level: "error",
      message: "Clés Stripe incohérentes (sk_test_ + pk_live_)",
      fix: "Utilisez soit toutes les clés test, soit toutes les clés Live.",
    });
  }

  if (webhookSecret && !webhookSecret.startsWith("whsec_")) {
    checks.push({
      id: "stripe-webhook-format",
      level: "error",
      message: "STRIPE_WEBHOOK_SECRET : format invalide",
      fix: "Le secret d'endpoint Live commence par whsec_ (Dashboard Stripe → Webhooks → Signing secret).",
    });
  }

  const cronSecret = envVars.CRON_SECRET?.trim() ?? "";
  if (cronSecret && cronSecret.length < 32) {
    checks.push({
      id: "cron-secret-length",
      level: "error",
      message: "CRON_SECRET trop court (< 32 caractères)",
      fix: "Générez une chaîne aléatoire longue (voir docs/variables-production.md) et ajoutez-la dans Vercel.",
    });
  }

  const brandId = resolveMondialRelayBrandId(envVars);
  const publicBrandId = envVars.NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID?.trim() ?? "";
  if (brandId && publicBrandId && brandId !== publicBrandId) {
    checks.push({
      id: "mondial-relay-brand-mismatch",
      level: "warn",
      message: "Code enseigne serveur et NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID différents",
      fix: "Alignez les deux sur le même code enseigne Mondial Relay pour éviter les erreurs au checkout.",
    });
  }

  const chronoAccount = envVars.CHRONOPOST_ACCOUNT_NUMBER?.trim() ?? "";
  const chronoPassword = envVars.CHRONOPOST_PASSWORD?.trim() ?? "";
  if (chronoAccount && !chronoPassword) {
    checks.push({
      id: "chronopost-password",
      level: "error",
      message:
        "CHRONOPOST_PASSWORD absent alors que CHRONOPOST_ACCOUNT_NUMBER est défini",
      fix: "Ajoutez CHRONOPOST_PASSWORD ou retirez CHRONOPOST_ACCOUNT_NUMBER.",
    });
  } else if (!chronoAccount && chronoPassword) {
    checks.push({
      id: "chronopost-account",
      level: "error",
      message:
        "CHRONOPOST_ACCOUNT_NUMBER absent alors que CHRONOPOST_PASSWORD est défini",
      fix: "Ajoutez CHRONOPOST_ACCOUNT_NUMBER (8 chiffres) ou retirez CHRONOPOST_PASSWORD.",
    });
  } else if (chronoAccount && chronoPassword) {
    checks.push({
      id: "chronopost",
      level: "ok",
      message: "Chronopost configuré (multi-transporteurs)",
    });
  } else {
    checks.push({
      id: "chronopost",
      level: "warn",
      message: "Chronopost non configuré — mono-transporteur Mondial Relay",
      fix: "Optionnel : voir docs/variables-production.md pour activer Chronopost.",
    });
  }

  if (envVars.SHIPPING_DEV_MOCK === "true") {
    checks.push({
      id: "shipping-dev-mock",
      level: "error",
      message: "SHIPPING_DEV_MOCK=true interdit en production",
      fix: "Supprimez la variable ou définissez SHIPPING_DEV_MOCK=false sur Vercel. Les points relais fictifs ne doivent pas être actifs en prod.",
    });
  } else {
    checks.push({
      id: "shipping-dev-mock",
      level: "ok",
      message: "SHIPPING_DEV_MOCK désactivé ou absent",
    });
  }

  return checks;
}

/**
 * @param {DeployCheck[]} checks
 */
export function summarizeDeployChecks(checks) {
  const errors = checks.filter((c) => c.level === "error");
  const warnings = checks.filter((c) => c.level === "warn");
  return {
    valid: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
  };
}

/**
 * @param {string} key
 */
function fixHintForKey(key) {
  const hints = {
    NEXT_PUBLIC_SITE_URL:
      "Vercel → Environment Variables → https://votre-domaine.fr (HTTPS obligatoire).",
    NEXT_PUBLIC_SUPABASE_URL:
      "Dashboard Supabase → Project Settings → API → Project URL.",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      "Dashboard Supabase → Project Settings → API → anon public key.",
    SUPABASE_SERVICE_ROLE_KEY:
      "Dashboard Supabase → Project Settings → API → service_role (secret serveur uniquement).",
    STRIPE_SECRET_KEY:
      "Dashboard Stripe (mode Live) → Developers → API keys → Secret key sk_live_…",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      "Dashboard Stripe (mode Live) → Developers → API keys → Publishable key pk_live_…",
    STRIPE_WEBHOOK_SECRET:
      "Dashboard Stripe → Webhooks → endpoint Live → Signing secret whsec_…",
    FROM_EMAIL:
      "Adresse expéditeur vérifiée (Resend ou SMTP), ex. commandes@votre-domaine.fr.",
    ADMIN_EMAIL: "Boîte qui reçoit les notifications de nouvelles commandes.",
    MONDIAL_RELAY_PRIVATE_KEY:
      "Clé privée API Mondial Relay (WSI) — fournie par votre contrat e-commerce.",
    NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID:
      "Même code enseigne que MONDIAL_RELAY_ENSEIGNE — widget carte au checkout.",
    CRON_SECRET:
      "Chaîne aléatoire 32+ caractères pour /api/cron/expire-pending-orders (voir docs/variables-production.md).",
    UPSTASH_REDIS_REST_URL:
      "Console Upstash → Redis → REST API → UPSTASH_REDIS_REST_URL (région EU).",
    UPSTASH_REDIS_REST_TOKEN:
      "Console Upstash → Redis → REST API → UPSTASH_REDIS_REST_TOKEN.",
  };
  return hints[key] ?? "Voir docs/variables-production.md et .env.example.";
}

/**
 * @param {string} source
 */
export function verifyStripeWebhookEventsInSource(source) {
  /** @type {DeployCheck[]} */
  const checks = [];
  for (const eventType of STRIPE_WEBHOOK_EVENTS_REQUIRED) {
    if (!source.includes(`"${eventType}"`)) {
      checks.push({
        id: `webhook-event-${eventType}`,
        level: "error",
        message: `Événement webhook manquant dans le code : ${eventType}`,
        fix: "Ajoutez l'événement dans src/lib/stripe/webhook/events.ts.",
      });
    }
  }
  if (checks.length === 0) {
    checks.push({
      id: "webhook-events",
      level: "ok",
      message: `Webhooks Stripe couverts : ${STRIPE_WEBHOOK_EVENTS_REQUIRED.join(", ")}`,
    });
  }
  return checks;
}

/**
 * @param {object} vercelConfig
 */
export function verifyVercelCronConfig(vercelConfig) {
  const crons = vercelConfig.crons ?? [];
  const expireCron = crons.find(
    (entry) => entry.path === "/api/cron/expire-pending-orders",
  );
  if (!expireCron) {
    return [
      {
        id: "vercel-cron",
        level: "error",
        message: "Cron Vercel /api/cron/expire-pending-orders manquant",
        fix: "Vérifiez vercel.json (plan Vercel Pro ou cron externe avec Bearer CRON_SECRET).",
      },
    ];
  }
  return [
    {
      id: "vercel-cron",
      level: "ok",
      message: `Cron expire-pending-orders déclaré (${expireCron.schedule ?? "schedule ?"})`,
    },
  ];
}

/**
 * @param {string} gitignore
 */
export function verifyGitignoreCoversSecrets(gitignore) {
  /** @type {DeployCheck[]} */
  const checks = [];
  const expected = [
    { label: ".env* (sauf .env.example)", ok: gitignore.includes(".env*") },
    { label: ".vercel", ok: gitignore.includes(".vercel") },
    { label: ".next/", ok: gitignore.includes("/.next/") },
    { label: "node_modules", ok: gitignore.includes("node_modules") },
  ];
  for (const item of expected) {
    if (item.ok) {
      checks.push({
        id: `gitignore-${item.label}`,
        level: "ok",
        message: `.gitignore couvre ${item.label}`,
      });
    } else {
      checks.push({
        id: `gitignore-${item.label}`,
        level: "error",
        message: `.gitignore ne couvre pas ${item.label}`,
        fix: "Mettez à jour .gitignore avant tout commit.",
      });
    }
  }
  return checks;
}
