#!/usr/bin/env node
/**
 * Génère à partir de data/catalog-products.json :
 * - public/products/*.svg (visuels techniques générés — non publiables sans photo réelle)
 * - supabase/seed.catalog-products.sql
 * - docs/import-catalogue-tilouki.csv
 * - public/import-catalogue-tilouki.csv
 *
 * Usage : npm run generate:catalog
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const data = JSON.parse(
  readFileSync(resolve(root, "data/catalog-products.json"), "utf8"),
);

const productsDir = resolve(root, "public/products");
const csvHeader =
  "reference,category,name,description,material,season,made_in,gender,color,size_label,age_label,price_eur,cost_eur,stock_quantity,weight_grams,image_url";

function escapeSql(value) {
  return String(value ?? "").replace(/'/g, "''");
}

function svg(label, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-label="${label}">
  <rect fill="#faf8f5" width="800" height="1000"/>
  <rect fill="${accent}" x="72" y="100" width="656" height="800" rx="28" opacity="0.85"/>
  <circle fill="#faf8f5" cx="400" cy="420" r="120" opacity="0.5"/>
  <text x="400" y="480" text-anchor="middle" font-family="system-ui,sans-serif" font-size="32" font-weight="600" fill="#4a4540">${label}</text>
  <text x="400" y="530" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="#7a7570">Tilouki</text>
</svg>
`;
}

function productId(index) {
  return `c200000${index}-000${index}-4000-8000-00000000000${index}`;
}

function imageId(index) {
  return `d200000${index}-000${index}-4000-8000-00000000000${index}`;
}

function variantId(pIndex, vIndex) {
  return `e200000${pIndex}-000${vIndex}-4000-8000-0000000000${String(pIndex).padStart(2, "0")}${vIndex}`;
}

mkdirSync(productsDir, { recursive: true });

const csvRows = [csvHeader];
const sql = [];

function categorySlug(category) {
  const map = {
    Bébé: "bebe",
    Fille: "fille",
    Garçon: "garcon",
    Pyjamas: "pyjamas",
    Accessoires: "accessoires",
  };
  return map[category] ?? category.toLowerCase();
}

const productValues = data.products.map((p, i) => {
  const idx = i + 1;
  const daysAgo = 20 - i;
  return `  (
    '${productId(idx)}',
    (SELECT id FROM public.categories WHERE slug = '${categorySlug(p.category)}'),
    '${escapeSql(p.name)}',
    '${escapeSql(p.slug)}',
    '${escapeSql(p.shortDescription)}',
    '${escapeSql(p.description)}',
    '${escapeSql(p.material)}',
    '${escapeSql(p.season)}',
    'Tilouki',
    '${escapeSql(p.madeIn)}',
    'Lavage 30 °C sauf indication contraire sur l''étiquette.',
    '${escapeSql(p.gender)}',
    'active',
    timezone('utc', now()) - interval '${daysAgo} days'
  )`;
});

sql.length = 0;
sql.push(`-- =============================================================================
-- Tilouki — Catalogue vendable (20 produits enfants)
-- =============================================================================
--
-- Généré par npm run generate:catalog — ne pas éditer à la main.
-- SKU préfixe TK- (distinct des produits démo DEV-).
-- Images locales techniques : /products/*.svg (visuels générés — non publiables sans photo réelle).
--
-- Idempotent : UPSERT par slug / SKU (pas de DELETE — commandes peuvent référencer).
--
-- Chargement :
--   Local  : inclus dans supabase db reset (config.toml)
--   Cloud  : npm run seed:catalog | npm run catalog:go-live -- --apply
--
-- =============================================================================

INSERT INTO public.products (
  id, category_id, name, slug, short_description, description,
  material, season, brand_label, made_in, care_instructions, gender, status, created_at
) VALUES
${productValues.join(",\n")}
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  season = EXCLUDED.season,
  brand_label = EXCLUDED.brand_label,
  made_in = EXCLUDED.made_in,
  care_instructions = EXCLUDED.care_instructions,
  gender = EXCLUDED.gender,
  status = EXCLUDED.status;
`);

sql.push(`\n-- Images\n`);
sql.push(
  `INSERT INTO public.product_images (id, product_id, url, alt, sort_order) VALUES`,
);

const imageValues = data.products.map((p, i) => {
  const idx = i + 1;
  const url = `/products/${p.imageSlug}.svg`;
  writeFileSync(
    resolve(productsDir, `${p.imageSlug}.svg`),
    svg(p.name, p.accent),
    "utf8",
  );
  return `  ('${imageId(idx)}', (SELECT id FROM public.products WHERE slug = '${escapeSql(p.slug)}'), '${url}', '${escapeSql(p.name)}', 0)`;
});
sql.push(`${imageValues.join(",\n")}
ON CONFLICT (id) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  url = EXCLUDED.url,
  alt = EXCLUDED.alt,
  sort_order = EXCLUDED.sort_order;`);

sql.push(`\n-- Variantes\n`);
sql.push(`INSERT INTO public.product_variants (
  id, product_id, sku, size_label, age_label, color,
  price_cents, compare_at_price_cents, cost_cents, stock_quantity, weight_grams, is_active
) VALUES`);

const variantValues = [];
data.products.forEach((p, i) => {
  const pIdx = i + 1;
  p.variants.forEach((v, vi) => {
    const vIdx = vi + 1;
    const priceCents = Math.round(parseFloat(v.priceEur.replace(",", ".")) * 100);
    const costCents = v.costEur
      ? Math.round(parseFloat(v.costEur.replace(",", ".")) * 100)
      : null;
    const imageUrl = vi === 0 ? `/products/${p.imageSlug}.svg` : "";
    const descQuoted = `"${escapeSql(p.description)}"`;
    csvRows.push(
      [
        p.reference,
        p.category,
        p.name,
        descQuoted,
        p.material,
        p.season,
        p.madeIn,
        p.gender,
        v.color,
        v.size,
        v.age,
        `"${v.priceEur}"`,
        v.costEur ? `"${v.costEur}"` : "",
        v.stock,
        v.weight,
        imageUrl,
      ].join(","),
    );
    variantValues.push(
      `  ('${variantId(pIdx, vIdx)}', (SELECT id FROM public.products WHERE slug = '${escapeSql(p.slug)}'), '${escapeSql(v.sku)}', '${escapeSql(v.size)}', '${escapeSql(v.age)}', '${escapeSql(v.color)}', ${priceCents}, NULL, ${costCents ?? "NULL"}, ${v.stock}, ${v.weight}, true)`,
    );
  });
});
sql.push(`${variantValues.join(",\n")}
ON CONFLICT (sku) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  size_label = EXCLUDED.size_label,
  age_label = EXCLUDED.age_label,
  color = EXCLUDED.color,
  price_cents = EXCLUDED.price_cents,
  compare_at_price_cents = EXCLUDED.compare_at_price_cents,
  cost_cents = EXCLUDED.cost_cents,
  stock_quantity = EXCLUDED.stock_quantity,
  weight_grams = EXCLUDED.weight_grams,
  is_active = EXCLUDED.is_active;`);

const sqlPath = resolve(root, "supabase/seed.catalog-products.sql");
const csvContent = `${csvRows.join("\n")}\n`;

for (const dest of [
  resolve(root, "docs/import-catalogue-tilouki.csv"),
  resolve(root, "public/import-catalogue-tilouki.csv"),
]) {
  writeFileSync(dest, csvContent, "utf8");
}

writeFileSync(sqlPath, `${sql.join("\n")}\n`, "utf8");

console.log(`\n✓ Catalogue généré :`);
console.log(`  - ${data.products.length} produits, ${variantValues.length} variantes`);
console.log(`  - ${data.products.length} visuels dans public/products/`);
console.log(`  - supabase/seed.catalog-products.sql`);
console.log(`  - docs/import-catalogue-tilouki.csv\n`);
