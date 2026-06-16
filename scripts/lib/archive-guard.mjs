/**
 * Garde-fous archive de livraison — garder synchronisé avec
 * src/lib/archive/archive-guard.test.ts
 */

/**
 * Exclusions obligatoires — l'archive livrée ne doit jamais les contenir.
 * (Liste de référence livraison / Prompt archive.)
 */
export const ARCHIVE_MANDATORY_EXCLUSION_KEYS = [
  ".env.local",
  ".env.vercel",
  ".vercel/",
  ".next/",
  "node_modules/",
  "test-results/",
  "playwright-report/",
  "archives/",
];

/** Chemins qui ne doivent jamais figurer dans le dépôt archivable. */
export const ARCHIVE_FORBIDDEN_FRAGMENTS = [
  ...ARCHIVE_MANDATORY_EXCLUSION_KEYS,
  ".env.production",
  ".env.development",
  ".email-preview/",
  "supabase/.temp/",
  "/logs/",
  "blob-report/",
  "screenshots/",
  "captures/",
  "exports/",
  "tsconfig.tsbuildinfo",
];

/** Présence interdite dans le zip final et dans tout livrable scanné. */
export const ZIP_CRITICAL_FRAGMENTS = [
  ...ARCHIVE_MANDATORY_EXCLUSION_KEYS,
  ".env.production",
  ".env.development",
  ".email-preview/",
  "supabase/.temp/",
  "tsconfig.tsbuildinfo",
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
  return normalized.endsWith(".example");
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
 * Contrôle explicite des exclusions obligatoires (échoue si l'une est présente).
 * @param {string[]} paths
 * @returns {Array<{ path: string, reason: string }>}
 */
export function findMandatoryExclusionViolations(paths) {
  /** @type {Array<{ path: string, reason: string }>} */
  const violations = [];

  for (const rawPath of paths) {
    const normalized = normalizeArchivePath(rawPath);

    if (isAllowedEnvExamplePath(normalized)) {
      continue;
    }

    for (const key of ARCHIVE_MANDATORY_EXCLUSION_KEYS) {
      const bare = key.replace(/\/$/, "");
      if (
        normalized.includes(key) ||
        normalized === bare ||
        normalized.endsWith(`/${bare}`)
      ) {
        violations.push({
          path: rawPath,
          reason: `exclusion obligatoire : ${key}`,
        });
      }
    }

    if (isForbiddenEnvPath(normalized) && !isAllowedEnvExamplePath(normalized)) {
      violations.push({
        path: rawPath,
        reason: "fichier .env autre que .env.example",
      });
    }
  }

  const seen = new Set();
  return violations.filter((violation) => {
    const dedupeKey = `${violation.path}::${violation.reason}`;
    if (seen.has(dedupeKey)) return false;
    seen.add(dedupeKey);
    return true;
  });
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
    if (isAllowedEnvExamplePath(path)) {
      continue;
    }

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
    if (isAllowedEnvExamplePath(entry)) {
      continue;
    }

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
  const mandatory = findMandatoryExclusionViolations(paths);
  const pathViolations = findArchivePathViolations(paths);
  const zipStyleViolations = findZipEntryViolations(
    paths.map((p) => (p.startsWith("tilouki/") ? p : `tilouki/${p}`)),
  );

  const seen = new Set();
  /** @type {Array<{ path: string, reason: string }>} */
  const merged = [];

  for (const violation of [...mandatory, ...pathViolations, ...zipStyleViolations]) {
    const key = `${violation.path}::${violation.reason}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(violation);
  }

  return merged;
}
