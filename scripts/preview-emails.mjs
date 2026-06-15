#!/usr/bin/env node
/**
 * Exporte les e-mails transactionnels en HTML/TXT dans .email-preview/
 * Usage : npm run email:preview
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vitestBin = resolve(root, "node_modules/vitest/vitest.mjs");

if (!existsSync(vitestBin)) {
  console.error("Vitest introuvable — exécutez npm install.");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [vitestBin, "run", "src/lib/email/preview-export.test.ts"],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, PREVIEW_EMAILS: "1" },
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("\nFichiers écrits dans .email-preview/\n");
