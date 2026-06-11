#!/usr/bin/env node
/** Génère les visuels SVG de démo dans public/demo-products/ (DEV uniquement). */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outDir = resolve(import.meta.dirname, "../public/demo-products");

const products = [
  { file: "body-bebe-coton-naturel", label: "Body bébé", accent: "#e8d4d8" },
  { file: "gigoteuse-nuages-bebe", label: "Gigoteuse nuages", accent: "#d4dce8" },
  { file: "robe-liberty-fleurie", label: "Robe liberty", accent: "#e8d4d8" },
  { file: "sweat-capuche-fille", label: "Sweat capuche", accent: "#d4dce8" },
  { file: "tshirt-dinosaure-garcon", label: "T-shirt dinosaure", accent: "#c5d4c8" },
  { file: "pantalon-jogger-garcon", label: "Pantalon jogger", accent: "#d4dce8" },
  { file: "pyjama-etoiles", label: "Pyjama étoiles", accent: "#d4dce8" },
  { file: "pyjama-combi-hiver", label: "Pyjama combi", accent: "#c5d4c8" },
  { file: "bonnet-doux-maille", label: "Bonnet doux", accent: "#e8d4d8" },
  { file: "chaussettes-coton-lot3", label: "Chaussettes x3", accent: "#f0ebe3" },
  { file: "debardeur-fille-ete", label: "Débardeur fille", accent: "#e8d4d8" },
  { file: "short-garcon-promo", label: "Short garçon", accent: "#c5d4c8" },
];

function svg(label, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-label="${label} — visuel démo Tilouki">
  <rect fill="#faf8f5" width="800" height="1000"/>
  <rect fill="${accent}" x="72" y="100" width="656" height="800" rx="28" opacity="0.85"/>
  <circle fill="#faf8f5" cx="400" cy="420" r="120" opacity="0.5"/>
  <text x="400" y="480" text-anchor="middle" font-family="system-ui,sans-serif" font-size="32" font-weight="600" fill="#4a4540">${label}</text>
  <text x="400" y="530" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="#7a7570">Visuel démo — DEV</text>
  <text x="400" y="900" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#9a9590">Tilouki</text>
</svg>
`;
}

mkdirSync(outDir, { recursive: true });

for (const { file, label, accent } of products) {
  writeFileSync(resolve(outDir, `${file}.svg`), svg(label, accent), "utf8");
}

console.log(`✓ ${products.length} visuels générés dans public/demo-products/`);
