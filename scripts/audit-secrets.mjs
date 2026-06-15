#!/usr/bin/env node
/**
 * Audit anti-fuite de secrets — Tilouki
 *
 * Scanne tous les fichiers suivis par git (node_modules et .next sont exclus
 * par nature, plus une exclusion explicite par sécurité) à la recherche de
 * patterns de secrets :
 *   - JWT / clés Supabase  : eyJhbGci…
 *   - Clés Stripe          : sk_live_…, sk_test_…
 *   - Webhook Stripe       : whsec_…
 *   - Clés API Resend      : re_…
 *   - Clé privée Mondial Relay assignée dans un fichier
 *
 * Échoue (exit 1) dès qu'un fichier suivi contient un secret.
 * Usage : npm run audit:secrets
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

// Les regex exigent un suffixe « aléatoire » suffisamment long pour ne pas
// déclencher sur la documentation (ex. `sk_live_…`) ni sur ce script lui-même.
const SECRET_PATTERNS = [
  {
    name: "JWT (clé Supabase anon/service_role ?)",
    regex: /eyJhbGci[A-Za-z0-9_=+/-]{20,}/g,
  },
  {
    name: "Clé secrète Stripe LIVE",
    regex: /sk_live_[A-Za-z0-9]{16,}/g,
  },
  {
    name: "Clé secrète Stripe TEST",
    regex: /sk_test_[A-Za-z0-9]{16,}/g,
  },
  {
    name: "Secret webhook Stripe",
    regex: /whsec_[A-Za-z0-9]{16,}/g,
  },
  {
    name: "Clé API Resend",
    regex: /\bre_[A-Za-z0-9]{6,}_[A-Za-z0-9]{16,}/g,
  },
  {
    name: "Clé privée Mondial Relay assignée",
    regex:
      /MONDIAL_RELAY_PRIVATE_KEY[ \t]*[=:][ \t]*['"]?[A-Za-z0-9][A-Za-z0-9_-]{7,}/g,
  },
];

// Extensions binaires : inutile (et risqué en faux positifs) de les scanner.
const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".svg",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
  ".pdf",
  ".zip",
  ".gz",
  ".mp4",
  ".webm",
]);

const EXCLUDED_DIRS = ["node_modules/", ".next/"];

// Valeurs manifestement factices utilisées dans la documentation.
const PLACEHOLDER_REGEX =
  /VOTRE|YOUR|EXAMPLE|EXEMPLE|PLACEHOLDER|CHANGE[_-]?ME|XXXX|\.\.\.|…/i;

function gitTrackedFiles() {
  const out = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split("\0").filter(Boolean);
}

function extension(file) {
  const dot = file.lastIndexOf(".");
  return dot === -1 ? "" : file.slice(dot).toLowerCase();
}

console.log("\nTilouki — audit des secrets dans les fichiers suivis par git\n");

let files;
try {
  files = gitTrackedFiles();
} catch {
  console.error("  ✗ Impossible de lister les fichiers git (dépôt git requis).");
  process.exit(1);
}

const findings = [];
let scanned = 0;

for (const file of files) {
  if (EXCLUDED_DIRS.some((dir) => file.startsWith(dir) || file.includes(`/${dir}`)))
    continue;
  if (BINARY_EXTENSIONS.has(extension(file))) continue;

  let content;
  try {
    content = readFileSync(resolve(root, file), "utf8");
  } catch {
    // Fichier suivi mais absent du disque (supprimé non commité) : ignorer.
    continue;
  }
  scanned += 1;

  for (const { name, regex } of SECRET_PATTERNS) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (PLACEHOLDER_REGEX.test(match[0])) continue;
      const line = content.slice(0, match.index).split("\n").length;
      const preview = `${match[0].slice(0, 12)}…`;
      findings.push({ file, line, name, preview });
    }
  }
}

if (findings.length > 0) {
  console.error(`  ✗ ${findings.length} secret(s) potentiel(s) détecté(s) :\n`);
  for (const f of findings) {
    console.error(`    ${f.file}:${f.line} — ${f.name} (${f.preview})`);
  }
  console.error(
    "\n  Retirez le secret du fichier, purgez l'historique git si déjà commité,",
  );
  console.error(
    "  puis FAITES TOURNER LES CLÉS (voir docs/checklist-mise-en-production.md → Rotation des clés).\n",
  );
  process.exit(1);
}

console.log(`  ✓ ${scanned} fichier(s) scanné(s), aucun secret détecté.\n`);
process.exit(0);
