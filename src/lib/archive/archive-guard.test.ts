import { describe, expect, it } from "vitest";

import {
  ARCHIVE_FORBIDDEN_FRAGMENTS,
  findArchivePathViolations,
  findDeliverableViolations,
  findZipEntryViolations,
  isAllowedEnvExamplePath,
  isForbiddenEnvPath,
  ZIP_CRITICAL_FRAGMENTS,
} from "../../../scripts/lib/archive-guard.mjs";

describe("archive-guard — chemins git", () => {
  it("autorise .env.example seul", () => {
    expect(isAllowedEnvExamplePath(".env.example")).toBe(true);
    expect(isForbiddenEnvPath(".env.example")).toBe(false);
    expect(findArchivePathViolations([".env.example"])).toEqual([]);
  });

  it("refuse les fichiers .env locaux versionnés", () => {
    const violations = findArchivePathViolations([
      ".env",
      ".env.local",
      "tilouki/.env.vercel",
    ]);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some((v) => v.path === ".env")).toBe(true);
    expect(violations.some((v) => v.path === ".env.local")).toBe(true);
  });

  it("refuse node_modules, .next, .vercel et artefacts locaux", () => {
    const samples = [
      "node_modules/foo/index.js",
      ".next/server/app.html",
      ".vercel/project.json",
      ".email-preview/order.html",
      "supabase/.temp/cli-latest",
      "tsconfig.tsbuildinfo",
      "playwright-report/index.html",
      "test-results/foo/trace.zip",
    ];

    for (const path of samples) {
      const violations = findArchivePathViolations([path]);
      expect(violations.length, path).toBeGreaterThan(0);
    }
  });

  it("couvre les fragments interdits documentés", () => {
    expect(ARCHIVE_FORBIDDEN_FRAGMENTS).toEqual(
      expect.arrayContaining([
        "node_modules/",
        ".next/",
        ".vercel/",
        ".email-preview/",
        "supabase/.temp/",
        "tsconfig.tsbuildinfo",
      ]),
    );
  });
});

describe("archive-guard — contenu zip", () => {
  it("refuse .env, .vercel, .next et node_modules dans le zip", () => {
    const entries = [
      "tilouki/README.md",
      "tilouki/.env.local",
      "tilouki/node_modules/react/index.js",
      "tilouki/.next/BUILD_ID",
      "tilouki/.vercel/output/config.json",
    ];

    const violations = findZipEntryViolations(entries);
    expect(violations.map((v) => v.reason)).toEqual(
      expect.arrayContaining([".env.local", "node_modules/", ".next/", ".vercel/"]),
    );
  });

  it("refuse playwright-report et test-results dans le zip", () => {
    const violations = findZipEntryViolations([
      "tilouki/playwright-report/index.html",
      "tilouki/test-results/foo/trace.zip",
    ]);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.map((v) => v.reason)).toEqual(
      expect.arrayContaining(["playwright-report/", "test-results/"]),
    );
  });

  it("accepte une archive propre type git archive", () => {
    const entries = [
      "tilouki/package.json",
      "tilouki/.env.example",
      "tilouki/.env.example\r",
      "tilouki/src/app/page.tsx",
    ];
    expect(findZipEntryViolations(entries)).toEqual([]);
  });

  it("aligne les critères critiques zip sur l'audit", () => {
    expect(ZIP_CRITICAL_FRAGMENTS).toEqual(
      expect.arrayContaining([
        "node_modules/",
        ".next/",
        ".vercel/",
        "playwright-report/",
        "test-results/",
      ]),
    );
  });
});

describe("archive-guard — livrable scanné", () => {
  /** Chemins qui doivent faire échouer scan:deliverable / delivery:clean (zip). */
  const FORBIDDEN_DELIVERABLE_PATHS = [
    ".env",
    ".env.local",
    ".env.vercel",
    ".vercel/project.json",
    "node_modules/react/index.js",
    ".next/BUILD_ID",
    "playwright-report/index.html",
    "test-results/trace.zip",
    "blob-report/index.html",
  ] as const;

  it.each(FORBIDDEN_DELIVERABLE_PATHS)(
    "refuse le chemin interdit dans un livrable : %s",
    (path) => {
      expect(findDeliverableViolations([path]).length).toBeGreaterThan(0);
    },
  );

  it("détecte un export manuel type audit (ensemble)", () => {
    const manualExport = [
      ...FORBIDDEN_DELIVERABLE_PATHS,
      ".email-preview/order.html",
      "supabase/.temp/cli-latest",
      "archives/old.zip",
    ];

    const violations = findDeliverableViolations(manualExport);
    expect(violations.length).toBeGreaterThanOrEqual(
      FORBIDDEN_DELIVERABLE_PATHS.length,
    );
  });
});
