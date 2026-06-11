#!/usr/bin/env node
/**
 * Vérifie que les variables et prérequis de déploiement sont en place.
 * Usage :
 *   node scripts/verify-deploy.mjs              # vérifie .env.local (dev)
 *   node scripts/verify-deploy.mjs --production # règles strictes (prod)
 *
 * Documentation : docs/variables-production.md
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const isProduction = process.argv.includes("--production");
const root = resolve(import.meta.dirname, "..");

const STRIPE_WEBHOOK_EVENTS_REQUIRED = [
  "checkout.session.completed",
  "checkout.session.expired",
  "payment_intent.payment_failed",
  "charge.refunded",
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = {
  ...parseEnvFile(resolve(root, ".env.example")),
  ...parseEnvFile(resolve(root, ".env.local")),
  ...process.env,
};

const required = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "FROM_EMAIL",
  "ADMIN_EMAIL",
];

const productionRequired = [
  ...required,
  "MONDIAL_RELAY_PRIVATE_KEY",
  "NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID",
  "CRON_SECRET",
];

const productionEither = [
  ["MONDIAL_RELAY_ENSEIGNE", "MONDIAL_RELAY_BRAND_ID"],
  ["MONDIAL_RELAY_ENSEIGNE", "NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID"],
];

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function warn(msg) {
  console.warn(`  ⚠ ${msg}`);
}

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  return false;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function resolveMondialRelayBrandId(envVars) {
  return (
    envVars.MONDIAL_RELAY_ENSEIGNE?.trim() ||
    envVars.MONDIAL_RELAY_BRAND_ID?.trim() ||
    envVars.NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID?.trim() ||
    ""
  );
}

function isEmailProviderConfigured(envVars) {
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

function verifyStripeWebhookEventsInSource() {
  const eventsPath = resolve(root, "src/lib/stripe/webhook/events.ts");
  if (!existsSync(eventsPath)) {
    return fail("Fichier src/lib/stripe/webhook/events.ts introuvable");
  }

  const source = readFileSync(eventsPath, "utf8");
  let allPresent = true;
  for (const eventType of STRIPE_WEBHOOK_EVENTS_REQUIRED) {
    if (!source.includes(`"${eventType}"`)) {
      allPresent = fail(`Événement webhook manquant dans events.ts : ${eventType}`);
    }
  }
  if (allPresent) {
    ok(
      `Webhooks Stripe couverts : ${STRIPE_WEBHOOK_EVENTS_REQUIRED.join(", ")}`,
    );
  }
  return allPresent;
}

function verifyVercelCron() {
  const vercelPath = resolve(root, "vercel.json");
  if (!existsSync(vercelPath)) {
    return fail("vercel.json introuvable");
  }

  try {
    const config = JSON.parse(readFileSync(vercelPath, "utf8"));
    const crons = config.crons ?? [];
    const expireCron = crons.find(
      (entry) => entry.path === "/api/cron/expire-pending-orders",
    );
    if (!expireCron) {
      return fail(
        "vercel.json : cron /api/cron/expire-pending-orders manquant",
      );
    }
    ok(
      `Cron expire-pending-orders déclaré (${expireCron.schedule ?? "schedule ?"})`,
    );
    return true;
  } catch {
    return fail("vercel.json illisible ou JSON invalide");
  }
}

function verifyStripeWebhookRoute() {
  const routePath = resolve(root, "src/app/api/webhooks/stripe/route.ts");
  if (!existsSync(routePath)) {
    return fail("Route API /api/webhooks/stripe introuvable");
  }
  ok("Route API /api/webhooks/stripe présente");
  return true;
}

let valid = true;

console.log(
  `\nTilouki — vérification déploiement (${isProduction ? "production" : "local"})\n`,
);

const keysToCheck = isProduction ? productionRequired : required;
for (const key of keysToCheck) {
  if (!env[key]?.trim()) {
    valid = fail(`${key} manquant`);
  } else {
    ok(`${key} présent`);
  }
}

if (isProduction) {
  for (const group of productionEither) {
    if (!group.some((key) => env[key]?.trim())) {
      valid = fail(`Configurer l'une de : ${group.join(" ou ")}`);
    }
  }

  const emailProvider = isEmailProviderConfigured(env);
  if (!emailProvider) {
    valid = fail(
      "E-mails : RESEND_API_KEY ou SMTP_HOST + SMTP_USER + SMTP_PASSWORD requis",
    );
  } else if (emailProvider === "resend") {
    ok("Fournisseur e-mail : Resend (RESEND_API_KEY)");
  } else {
    ok("Fournisseur e-mail : SMTP");
  }

  for (const key of ["FROM_EMAIL", "ADMIN_EMAIL"]) {
    const value = env[key]?.trim() ?? "";
    if (value && !isValidEmail(value)) {
      valid = fail(`${key} invalide (${value})`);
    } else if (value) {
      ok(`${key} au format e-mail valide`);
    }
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (!siteUrl.startsWith("https://")) {
    valid = fail(
      "NEXT_PUBLIC_SITE_URL doit commencer par https:// en production",
    );
  } else {
    ok(`URL site : ${siteUrl}`);
    const expectedWebhook = `${siteUrl.replace(/\/$/, "")}/api/webhooks/stripe`;
    ok(`URL webhook Stripe attendue : ${expectedWebhook}`);
  }

  const stripeSecret = env.STRIPE_SECRET_KEY ?? "";
  if (stripeSecret.startsWith("sk_test_")) {
    valid = fail(
      "STRIPE_SECRET_KEY est en mode test — utilisez sk_live_ pour la prod",
    );
  } else if (stripeSecret.startsWith("sk_live_")) {
    ok("Stripe en mode Live (sk_live_)");
  } else {
    warn("Format STRIPE_SECRET_KEY non reconnu");
  }

  const stripePublic = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  if (stripePublic.startsWith("pk_test_")) {
    valid = fail("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est en mode test");
  } else if (stripePublic.startsWith("pk_live_")) {
    ok("Clé publique Stripe Live (pk_live_)");
  }

  const webhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  if (webhookSecret && !webhookSecret.startsWith("whsec_")) {
    valid = fail(
      "STRIPE_WEBHOOK_SECRET doit commencer par whsec_ (secret endpoint Live)",
    );
  } else if (webhookSecret) {
    ok("STRIPE_WEBHOOK_SECRET au format whsec_");
  }

  const cronSecret = env.CRON_SECRET?.trim() ?? "";
  if (cronSecret && cronSecret.length < 32) {
    valid = fail("CRON_SECRET trop court — utilisez au moins 32 caractères");
  } else if (cronSecret) {
    ok("CRON_SECRET longueur suffisante");
  }

  const brandId = resolveMondialRelayBrandId(env);
  const publicBrandId = env.NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID?.trim() ?? "";
  if (brandId && publicBrandId && brandId !== publicBrandId) {
    warn(
      "MONDIAL_RELAY_ENSEIGNE et NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID diffèrent — le widget checkout peut échouer",
    );
  } else if (brandId && publicBrandId) {
    ok("Code enseigne Mondial Relay cohérent (serveur + widget)");
  }

  const chronoAccount = env.CHRONOPOST_ACCOUNT_NUMBER?.trim() ?? "";
  const chronoPassword = env.CHRONOPOST_PASSWORD?.trim() ?? "";
  if (chronoAccount && !chronoPassword) {
    valid = fail("CHRONOPOST_PASSWORD requis si CHRONOPOST_ACCOUNT_NUMBER est défini");
  } else if (!chronoAccount && chronoPassword) {
    valid = fail(
      "CHRONOPOST_ACCOUNT_NUMBER requis si CHRONOPOST_PASSWORD est défini",
    );
  } else if (chronoAccount && chronoPassword) {
    ok("Chronopost configuré (multi-transporteurs actif)");
  } else {
    warn(
      "Chronopost non configuré — boutique en mono-transporteur Mondial Relay (voir docs/variables-production.md)",
    );
  }

  if (env.SHIPPING_DEV_MOCK === "true") {
    valid = fail("SHIPPING_DEV_MOCK=true interdit en production");
  } else {
    ok("SHIPPING_DEV_MOCK désactivé ou absent");
  }

  if (
    env.UPSTASH_REDIS_REST_URL?.trim() &&
    env.UPSTASH_REDIS_REST_TOKEN?.trim()
  ) {
    ok("Rate limiting Upstash Redis configuré");
  } else {
    warn(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN absents — rate limiting en mémoire, inopérant sur Vercel serverless (voir docs/deploiement-vercel.md)",
    );
  }

  if (!verifyStripeWebhookRoute()) valid = false;
  if (!verifyStripeWebhookEventsInSource()) valid = false;
  if (!verifyVercelCron()) valid = false;
} else {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) ok(`URL site : ${siteUrl}`);

  const emailProvider = isEmailProviderConfigured(env);
  if (emailProvider) {
    ok(`Fournisseur e-mail : ${emailProvider}`);
  } else {
    warn(
      "E-mails non configurés (RESEND_API_KEY ou SMTP) — les notifications seront ignorées en dev",
    );
  }
}

const gitignore = readFileSync(resolve(root, ".gitignore"), "utf8");
const gitignoreChecks = [
  { label: ".env.local (via .env*)", ok: gitignore.includes(".env*") },
  { label: ".vercel", ok: gitignore.includes(".vercel") },
  { label: ".next/", ok: gitignore.includes("/.next/") },
  { label: "node_modules", ok: gitignore.includes("node_modules") },
];
for (const check of gitignoreChecks) {
  if (check.ok) ok(`.gitignore couvre ${check.label}`);
  else valid = fail(`.gitignore ne couvre pas ${check.label}`);
}

console.log(
  valid
    ? "\nRésultat : OK\n"
    : "\nRésultat : des points bloquants subsistent.\nVoir docs/variables-production.md et docs/guide-test-production.md\n",
);
process.exit(valid ? 0 : 1);
