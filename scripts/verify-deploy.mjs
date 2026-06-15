#!/usr/bin/env node
/**
 * Vérifie que les variables et prérequis de déploiement sont en place.
 * Usage :
 *   npm run verify:deploy          # .env.local (dev)
 *   npm run verify:deploy:prod     # règles strictes avant vente
 *
 * Documentation : docs/variables-production.md · docs/PRODUCTION_CHECKLIST.md
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  isValidEmail,
  resolveEmailProvider,
  runProductionEnvChecks,
  summarizeDeployChecks,
  verifyGitignoreCoversSecrets,
  verifyStripeWebhookEventsInSource,
  verifyVercelCronConfig,
} from "./lib/verify-deploy-checks.mjs";

const isProduction = process.argv.includes("--production");
const root = resolve(import.meta.dirname, "..");

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

/** @type {import("./lib/verify-deploy-checks.mjs").DeployCheck[]} */
let allChecks = [];

function printCheck(check) {
  if (check.level === "ok") {
    console.log(`  ✓ ${check.message}`);
    return;
  }
  if (check.level === "warn") {
    console.warn(`  ⚠ ${check.message}`);
    if (check.fix) console.warn(`      → ${check.fix}`);
    return;
  }
  console.error(`  ✗ ${check.message}`);
  if (check.fix) console.error(`      → ${check.fix}`);
}

console.log(
  `\nTilouki — vérification déploiement (${isProduction ? "production" : "local"})\n`,
);

if (isProduction) {
  allChecks = runProductionEnvChecks(env);

  if (existsSync(resolve(root, "src/app/api/webhooks/stripe/route.ts"))) {
    allChecks.push({
      id: "stripe-route",
      level: "ok",
      message: "Route API /api/webhooks/stripe présente",
    });
  } else {
    allChecks.push({
      id: "stripe-route",
      level: "error",
      message: "Route API /api/webhooks/stripe introuvable",
      fix: "Vérifiez src/app/api/webhooks/stripe/route.ts dans le dépôt.",
    });
  }

  const eventsPath = resolve(root, "src/lib/stripe/webhook/events.ts");
  if (existsSync(eventsPath)) {
    allChecks.push(
      ...verifyStripeWebhookEventsInSource(readFileSync(eventsPath, "utf8")),
    );
  } else {
    allChecks.push({
      id: "webhook-events-file",
      level: "error",
      message: "Fichier src/lib/stripe/webhook/events.ts introuvable",
    });
  }

  const vercelPath = resolve(root, "vercel.json");
  if (existsSync(vercelPath)) {
    try {
      allChecks.push(
        ...verifyVercelCronConfig(JSON.parse(readFileSync(vercelPath, "utf8"))),
      );
    } catch {
      allChecks.push({
        id: "vercel-json",
        level: "error",
        message: "vercel.json illisible ou JSON invalide",
      });
    }
  } else {
    allChecks.push({
      id: "vercel-json",
      level: "error",
      message: "vercel.json introuvable",
    });
  }
} else {
  const devKeys = [
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

  for (const key of devKeys) {
    if (!env[key]?.trim()) {
      allChecks.push({
        id: key,
        level: "warn",
        message: `${key} absent (optionnel en dev si la fonctionnalité n'est pas testée)`,
        fix: "Copiez .env.example vers .env.local et renseignez les valeurs.",
      });
    } else {
      allChecks.push({ id: key, level: "ok", message: `${key} présent` });
    }
  }

  const emailProvider = resolveEmailProvider(env);
  if (emailProvider) {
    allChecks.push({
      id: "email-provider",
      level: "ok",
      message: `Fournisseur e-mail : ${emailProvider}`,
    });
  } else {
    allChecks.push({
      id: "email-provider",
      level: "warn",
      message: "E-mails non configurés",
      fix: "RESEND_API_KEY ou SMTP — ou prévisualisez via /dev/emails",
    });
  }

  for (const key of ["FROM_EMAIL", "ADMIN_EMAIL"]) {
    const value = env[key]?.trim() ?? "";
    if (value && !isValidEmail(value)) {
      allChecks.push({
        id: `${key}-format`,
        level: "error",
        message: `${key} : format e-mail invalide`,
      });
    }
  }

  const stripeSecret = env.STRIPE_SECRET_KEY?.trim() ?? "";
  const stripePublic = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";
  if (stripeSecret.startsWith("sk_live_")) {
    allChecks.push({
      id: "stripe-live-local",
      level: "warn",
      message: "STRIPE_SECRET_KEY en mode Live en local — préférez sk_test_",
    });
  }
  if (stripeSecret.startsWith("sk_test_") && stripePublic.startsWith("pk_live_")) {
    allChecks.push({
      id: "stripe-mismatch",
      level: "error",
      message: "Clés Stripe incohérentes : sk_test_ avec pk_live_",
    });
  }
  if (stripeSecret.startsWith("sk_live_") && stripePublic.startsWith("pk_test_")) {
    allChecks.push({
      id: "stripe-mismatch",
      level: "error",
      message: "Clés Stripe incohérentes : sk_live_ avec pk_test_",
    });
  }

  allChecks.push({
    id: "email-preview",
    level: "ok",
    message: "Preview e-mails dev : http://localhost:3000/dev/emails",
  });
}

allChecks.push(
  ...verifyGitignoreCoversSecrets(readFileSync(resolve(root, ".gitignore"), "utf8")),
);

for (const check of allChecks) {
  printCheck(check);
}

const summary = summarizeDeployChecks(allChecks);

console.log("");
if (summary.valid) {
  if (isProduction) {
    console.log("Résultat : OK — prêt pour la mise en vente.");
    if (summary.warningCount > 0) {
      console.log(
        `${summary.warningCount} avertissement(s) non bloquant(s) — voir ci-dessus.`,
      );
    }
  } else {
    console.log("Résultat : OK (mode local).");
    console.log(
      "Avant la vente : configurez Vercel puis lancez npm run verify:deploy:prod",
    );
  }
  console.log("");
  process.exit(0);
}

console.error(
  `Résultat : ${summary.errorCount} point(s) bloquant(s) — corrigez avant d'encaisser.`,
);
console.error(
  "Documentation : docs/PRODUCTION_CHECKLIST.md · docs/variables-production.md\n",
);
process.exit(1);
