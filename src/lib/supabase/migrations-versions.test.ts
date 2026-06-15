import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const MIGRATIONS_DIR = resolve(import.meta.dirname, "../../../supabase/migrations");
const SHOP_SETTINGS_BOOTSTRAP = "20260611180000_shop_settings_bootstrap.sql";

/** Préfixe version Supabase : YYYYMMDDHHMMSS (14 chiffres). */
const VERSION_PREFIX = /^(\d{14})_/;

function listMigrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));
}

function extractVersion(filename: string): string {
  const match = VERSION_PREFIX.exec(filename);
  if (!match) {
    throw new Error(
      `Nom de migration invalide (préfixe attendu YYYYMMDDHHMMSS_) : ${filename}`,
    );
  }
  return match[1];
}

describe("supabase/migrations — versions uniques", () => {
  it("n'a pas deux fichiers avec le même préfixe de version", () => {
    const files = listMigrationFiles();
    const byVersion = new Map<string, string[]>();

    for (const file of files) {
      const version = extractVersion(file);
      const group = byVersion.get(version) ?? [];
      group.push(file);
      byVersion.set(version, group);
    }

    const duplicates = [...byVersion.entries()].filter(([, names]) => names.length > 1);

    expect(
      duplicates,
      duplicates.length > 0
        ? `Versions en double :\n${duplicates.map(([v, names]) => `  ${v} → ${names.join(", ")}`).join("\n")}`
        : undefined,
    ).toEqual([]);
  });

  it("a des préfixes de version strictement croissants", () => {
    const versions = listMigrationFiles().map(extractVersion);
    for (let i = 1; i < versions.length; i += 1) {
      expect(
        versions[i] > versions[i - 1],
        `${versions[i]} doit être > ${versions[i - 1]}`,
      ).toBe(true);
    }
  });

  it("inclut la migration bootstrap shop_settings idempotente", () => {
    const files = listMigrationFiles();
    expect(files).toContain(SHOP_SETTINGS_BOOTSTRAP);

    const sql = readFileSync(resolve(MIGRATIONS_DIR, SHOP_SETTINGS_BOOTSTRAP), "utf8");
    expect(sql).toMatch(/INSERT INTO public\.shop_settings/i);
    expect(sql).toMatch(
      /WHERE NOT EXISTS\s*\(\s*SELECT 1 FROM public\.shop_settings\s*\)/i,
    );
  });
});

describe("supabase seeds — pas de double bootstrap shop_settings", () => {
  const SEEDS_DIR = resolve(import.meta.dirname, "../../../supabase");

  it("n'insère pas shop_settings dans les seeds produits", () => {
    for (const seed of ["seed.dev-products.sql", "seed.catalog-products.sql"]) {
      const sql = readFileSync(resolve(SEEDS_DIR, seed), "utf8");
      expect(sql).not.toMatch(/INSERT INTO public\.shop_settings/i);
    }
  });

  it("enrichit shop_settings via UPDATE dans seed.dev (pas INSERT)", () => {
    const sql = readFileSync(resolve(SEEDS_DIR, "seed.dev.sql"), "utf8");
    expect(sql).not.toMatch(/INSERT INTO public\.shop_settings/i);
    expect(sql).toMatch(/UPDATE public\.shop_settings/i);
  });
});
