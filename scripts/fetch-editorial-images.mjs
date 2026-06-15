#!/usr/bin/env node
/**
 * Télécharge et compresse les images éditoriales locales (Pexels → WebP).
 * Usage : node scripts/fetch-editorial-images.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "public/editorial");

/** @type {Array<{ file: string; pexelsId: number; width: number }>} */
const ASSETS = [
  { file: "hero-home.webp", pexelsId: 7286888, width: 1600 },
  { file: "baby-clothes-flatlay.webp", pexelsId: 3875085, width: 1400 },
  { file: "nursery-wardrobe.webp", pexelsId: 1457842, width: 1400 },
  { file: "cotton-texture.webp", pexelsId: 6287554, width: 1200 },
  { file: "pajamas-evening.webp", pexelsId: 6591639, width: 1400 },
  { file: "size-guide.webp", pexelsId: 4467683, width: 1400 },
  { file: "laundry-care.webp", pexelsId: 373543, width: 1400 },
  { file: "weekend-bag.webp", pexelsId: 2901538, width: 1400 },
  { file: "colors-soft.webp", pexelsId: 6348091, width: 1400 },
  { file: "blog-default.webp", pexelsId: 4239346, width: 1400 },
  { file: "newsletter.webp", pexelsId: 706511, width: 1200 },
  { file: "material-closeup.webp", pexelsId: 3771690, width: 1200 },
  { file: "universe-garcon.webp", pexelsId: 5251636, width: 1400 },
  { file: "universe-fille.webp", pexelsId: 15075852, width: 1400 },
  { file: "universe-bebe.webp", pexelsId: 11387533, width: 1400 },
  { file: "night-calm.webp", pexelsId: 7938251, width: 1400 },
  { file: "universe-accessoires.webp", pexelsId: 4489702, width: 1400 },
  { file: "ritual-morning.webp", pexelsId: 8613145, width: 1400 },
  { file: "ritual-family-outing.webp", pexelsId: 8534085, width: 1400 },
  { file: "ritual-rainy-day.webp", pexelsId: 1835670, width: 1400 },
];

function pexelsUrl(id, width) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

async function main() {
  await mkdir(outDir, { recursive: true });

  for (const asset of ASSETS) {
    const target = resolve(outDir, asset.file);
    const response = await fetch(pexelsUrl(asset.pexelsId, asset.width));
    if (!response.ok) {
      throw new Error(`Échec ${asset.file} (${response.status})`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const webp = await sharp(buffer)
      .rotate()
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    await writeFile(target, webp);
    const kb = Math.round(webp.length / 1024);
    console.log(`✓ ${asset.file} (${kb} Ko)`);
  }

  console.log("\nTerminé — mettez à jour docs/image-credits.md si les IDs changent.");
}

await main();
