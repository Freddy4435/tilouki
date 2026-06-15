#!/usr/bin/env node
/**
 * Télécharge les polices variable (latin) pour builds CI hors ligne.
 * Usage : node scripts/fetch-fonts.mjs
 * Fichiers cibles : src/assets/fonts/*.woff2 (versionnés dans git).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "src/assets/fonts");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const GOOGLE_CSS = [
  {
    file: "dm-sans-latin.woff2",
    cssUrl:
      "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400..700&display=swap",
  },
  {
    file: "fraunces-latin.woff2",
    cssUrl:
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&display=swap",
  },
];

async function extractWoff2Url(cssUrl) {
  const response = await fetch(cssUrl, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) {
    throw new Error(`CSS ${cssUrl} → HTTP ${response.status}`);
  }
  const css = await response.text();
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
  if (!match?.[1]) {
    throw new Error(`URL woff2 introuvable dans : ${cssUrl}`);
  }
  return match[1];
}

async function download(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Téléchargement ${url} → HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(dest, buffer);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  for (const entry of GOOGLE_CSS) {
    const woff2Url = await extractWoff2Url(entry.cssUrl);
    const dest = resolve(outDir, entry.file);
    await download(woff2Url, dest);
    console.log(`  ✓ ${entry.file}`);
  }

  console.log(`\nPolices écrites dans ${outDir}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
