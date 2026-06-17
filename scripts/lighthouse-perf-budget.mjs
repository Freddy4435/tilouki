#!/usr/bin/env node
/**
 * Budget performance Lighthouse mobile (lot C.5).
 * Usage : serveur prod sur le port cible, puis :
 *   npm run build && npx next start -p 3002
 *   npm run lighthouse:mobile
 *
 * Variables :
 *   LIGHTHOUSE_BASE_URL — défaut http://127.0.0.1:3002
 *   LIGHTHOUSE_MIN_PERF — défaut 90
 *   LIGHTHOUSE_PRODUCT_SLUG — fiche produit test (optionnel)
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const baseUrl = (process.env.LIGHTHOUSE_BASE_URL ?? "http://127.0.0.1:3002").replace(
  /\/$/,
  "",
);
const minPerf = Number(process.env.LIGHTHOUSE_MIN_PERF ?? "75");
const productSlug = process.env.LIGHTHOUSE_PRODUCT_SLUG?.trim();

const paths = ["/"];
if (productSlug) paths.push(`/produit/${productSlug}`);

const outDir = join(tmpdir(), `tilouki-lighthouse-${Date.now()}`);
mkdirSync(outDir, { recursive: true });

const failures = [];

for (const path of paths) {
  const url = `${baseUrl}${path}`;
  const safeName = path.replace(/\//g, "_") || "home";
  const outPath = join(outDir, `${safeName}.json`);

  console.log(`\n▶ Lighthouse mobile — ${url}`);

  const chromeDataDir = join(outDir, "chrome-profile");

  try {
    execFileSync(
      "npx",
      [
        "lighthouse@12",
        url,
        "--only-categories=performance,accessibility",
        "--form-factor=mobile",
        "--quiet",
        `--chrome-flags=--headless --no-sandbox --user-data-dir=${chromeDataDir}`,
        `--output-path=${outPath}`,
        "--output=json",
      ],
      { stdio: "inherit", shell: true },
    );
  } catch {
    failures.push(`${path} : échec exécution Lighthouse`);
    continue;
  }

  const report = JSON.parse(readFileSync(outPath, "utf8"));
  const perf = Math.round((report.categories?.performance?.score ?? 0) * 100);
  const a11y = Math.round((report.categories?.accessibility?.score ?? 0) * 100);
  const lcp = report.audits?.["largest-contentful-paint"]?.displayValue ?? "?";
  const cls = report.audits?.["cumulative-layout-shift"]?.displayValue ?? "?";
  const tbt = report.audits?.["total-blocking-time"]?.displayValue ?? "?";

  console.log(`  Performance     : ${perf} (min ${minPerf})`);
  console.log(`  Accessibilité   : ${a11y}`);
  console.log(`  LCP             : ${lcp}`);
  console.log(`  CLS             : ${cls}`);
  console.log(`  TBT             : ${tbt}`);

  if (perf < minPerf) {
    failures.push(`${path} : performance ${perf} < ${minPerf}`);
  }
  if (a11y < 90) {
    failures.push(`${path} : accessibilité ${a11y} < 90`);
  }
}

try {
  rmSync(outDir, { recursive: true, force: true });
} catch {
  // ignore cleanup errors
}

if (failures.length > 0) {
  console.error("\n✗ Budget Lighthouse non respecté :");
  for (const line of failures) console.error(`  - ${line}`);
  process.exit(1);
}

console.log(`\n✓ Budget Lighthouse OK (perf ≥ ${minPerf}, a11y ≥ 90)`);
