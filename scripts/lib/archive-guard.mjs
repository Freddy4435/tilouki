/**
 * Garde-fous archive de livraison — garder synchronisé avec
 * src/lib/archive/archive-guard.test.ts
 */

/** Chemins qui ne doivent jamais figurer dans le dépôt archivable. */
export const ARCHIVE_FORBIDDEN_FRAGMENTS = [
  ".env.local",
  ".env.vercel",
  ".env.production",
  ".env.development",
  "node_modules/",
  ".next/",
  ".vercel/",
  ".email-preview/",
  "supabase/.temp/",
  "/logs/",
  "archives/",
  "playwright-report/",
  "test-results/",
  "blob-report/",
  "screenshots/",
  "captures/",
  "exports/",
  "tsconfig.tsbuildinfo",
];

/** Présence interdite dans le zip final et dans tout livrable scanné. */
export const ZIP_CRITICAL_FRAGMENTS = [
  ".env.local",
  ".env.vercel",
  ".env.production",
  ".env.development",
  "node_modules/",
  ".next/",
  ".vercel/",
  ".email-preview/",
  "supabase/.temp/",
  "tsconfig.tsbuildinfo",
  "archives/",
  "playwright-report/",
  "test-results/",
  "blob-report/",
  "screenshots/",
  "captures/",
  "exports/",
  "/logs/",
];

/**
 * @param {string} path
 * @returns {string}
 */
export function normalizeArchivePath(path) {
  return path
    .trim()
    .replace(/\r$/, "")
    .replace(/^tilouki\//, "");
}

/**
 * @param {string} path
 * @returns {boolean}
 */
export function isAllowedEnvExamplePath(path) {
  const normalized = normalizeArchivePath(path);
  return normalized === ".env.example" || normalized.endsWith("/.env.example");
}

/**
 * @param {string} path
 * @returns {boolean}
 */
export function isForbiddenEnvPath(path) {
  const normalized = normalizeArchivePath(path);
  if (isAllowedEnvExamplePath(normalized)) {
    return false;
  }
  return /(^|\/)\.env[^/]*$/.test(normalized) || normalized.includes("/.env.");
}

/**
 * @param {string[]} paths
 * @param {{ forbiddenFragments?: string[] }} [options]
 * @returns {Array<{ path: string, reason: string }>}
 */
export function findArchivePathViolations(paths, options = {}) {
  const forbiddenFragments = options.forbiddenFragments ?? ARCHIVE_FORBIDDEN_FRAGMENTS;
  /** @type {Array<{ path: string, reason: string }>} */
  const violations = [];

  for (const path of paths) {
    for (const forbidden of forbiddenFragments) {
      if (path.includes(forbidden)) {
        violations.push({ path, reason: forbidden });
      }
    }

    if (isForbiddenEnvPath(path)) {
      violations.push({ path, reason: "fichier .env autre que .env.example" });
    }

    if (/^[^/]+\.(zip|rar)$/i.test(path)) {
      violations.push({ path, reason: "archive zip/rar à la racine du dépôt" });
    }
  }

  return violations;
}

/**
 * @param {string[]} entries chemins dans le zip (préfixe tilouki/ accepté)
 * @param {{ criticalFragments?: string[] }} [options]
 * @returns {Array<{ path: string, reason: string }>}
 */
export function findZipEntryViolations(entries, options = {}) {
  const criticalFragments = options.criticalFragments ?? ZIP_CRITICAL_FRAGMENTS;
  /** @type {Array<{ path: string, reason: string }>} */
  const violations = [];

  for (const entry of entries) {
    for (const forbidden of criticalFragments) {
      if (entry.includes(forbidden)) {
        violations.push({ path: entry, reason: forbidden });
      }
    }

    if (isForbiddenEnvPath(entry)) {
      violations.push({ path: entry, reason: "fichier .env autre que .env.example" });
    }
  }

  return violations;
}

/**
 * @param {Array<{ path: string, reason: string }>} violations
 */
export function formatArchiveViolations(violations) {
  return violations.map((v) => `    ${v.path} (${v.reason})`).join("\n");
}

/**
 * Contrôle un livrable (zip, dossier extrait, liste de chemins) — règles complètes.
 * @param {string[]} paths
 * @returns {Array<{ path: string, reason: string }>}
 */
export function findDeliverableViolations(paths) {
  const pathViolations = findArchivePathViolations(paths);
  const zipStyleViolations = findZipEntryViolations(
    paths.map((p) => (p.startsWith("tilouki/") ? p : `tilouki/${p}`)),
  );

  const seen = new Set();
  /** @type {Array<{ path: string, reason: string }>} */
  const merged = [];

  for (const violation of [...pathViolations, ...zipStyleViolations]) {
    const key = `${violation.path}::${violation.reason}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(violation);
  }

  return merged;
}
