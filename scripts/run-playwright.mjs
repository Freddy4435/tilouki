#!/usr/bin/env node
/**
 * Lance Playwright contre un serveur Next.js production local (fiable pour l'hydratation client).
 * Réutilise le serveur sur PLAYWRIGHT_PORT s'il répond déjà (ex. après npm run build).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const port = process.env.PLAYWRIGHT_PORT ?? "3002";
const baseURL = `http://127.0.0.1:${port}`;

async function isServerUp(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return response.status < 500;
  } catch {
    return false;
  }
}

const env = {
  ...process.env,
  SHIPPING_DEV_MOCK: "true",
  E2E_PROD_SERVER: "1",
  PLAYWRIGHT_BASE_URL: baseURL,
};

if (await isServerUp(baseURL)) {
  env.PLAYWRIGHT_SKIP_WEBSERVER = "1";
  console.log(`[e2e] Serveur production détecté — ${baseURL}`);
} else if (!existsSync(".next/BUILD_ID")) {
  console.log("[e2e] Build manquant — exécution de npm run build…");
  const build = spawnSync("npm", ["run", "build"], { stdio: "inherit", shell: true });
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

const playwrightArgs = ["playwright", "test", ...process.argv.slice(2)];
const result = spawnSync("npx", playwrightArgs, {
  stdio: "inherit",
  shell: true,
  env,
});

process.exit(result.status === null ? 1 : result.status);
