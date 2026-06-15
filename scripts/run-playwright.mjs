#!/usr/bin/env node
/**
 * Lance Playwright contre un serveur Next.js production local.
 * Gère explicitement le démarrage / arrêt du serveur (évite les blocages webServer sur Windows).
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.PLAYWRIGHT_PORT ?? "3002";
const baseURL = `http://127.0.0.1:${port}`;
const SERVER_START_TIMEOUT_MS = 180_000;
const SERVER_STOP_TIMEOUT_MS = 15_000;

const playwrightCli = resolve(root, "node_modules/@playwright/test/cli.js");
const nextCli = resolve(root, "node_modules/next/dist/bin/next");

/** @type {import("node:child_process").ChildProcess | null} */
let managedServer = null;
let startedManagedServer = false;

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function isServerUp(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3_000) });
    return response.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isServerUp(url)) return;
    await sleep(500);
  }
  throw new Error(`[e2e] Serveur indisponible après ${timeoutMs}ms — ${url}`);
}

function ensureProductionBuild() {
  console.log("[e2e] Build production (code courant)…");
  const build = spawnSync("npm", ["run", "build"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  if (build.status !== 0) {
    throw new Error("[e2e] npm run build a échoué.");
  }
}

function killProcessTree(child) {
  if (!child?.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    return;
  }
  child.kill("SIGTERM");
}

async function startManagedServer(env) {
  if (!existsSync(nextCli)) {
    throw new Error(`[e2e] Binaire Next introuvable : ${nextCli}`);
  }

  console.log(`[e2e] Démarrage serveur production sur le port ${port}…`);
  managedServer = spawn(process.execPath, [nextCli, "start", "-p", port], {
    cwd: root,
    env,
    stdio: "inherit",
    windowsHide: true,
  });
  startedManagedServer = true;

  managedServer.on("error", (error) => {
    console.error("[e2e] Erreur serveur :", error.message);
  });

  await waitForServer(baseURL, SERVER_START_TIMEOUT_MS);
  console.log(`[e2e] Serveur prêt — ${baseURL}`);
}

async function stopManagedServer() {
  if (!startedManagedServer || !managedServer) return;

  const child = managedServer;
  console.log(`[e2e] Arrêt du serveur (délai max ${SERVER_STOP_TIMEOUT_MS}ms)…`);

  const exited = new Promise((resolveExit) => {
    child.once("exit", (code, signal) => resolveExit({ code, signal }));
  });

  killProcessTree(child);

  if (process.platform !== "win32") {
    setTimeout(() => {
      if (child.exitCode === null) child.kill("SIGKILL");
    }, SERVER_STOP_TIMEOUT_MS).unref();
  }

  const result = await Promise.race([
    exited,
    sleep(SERVER_STOP_TIMEOUT_MS).then(() => null),
  ]);

  if (result === null) {
    console.error(
      `[e2e] Diagnostic : le serveur n'a pas libéré le port ${port} sous ${SERVER_STOP_TIMEOUT_MS}ms — forçage.`,
    );
    killProcessTree(child);
    await sleep(500);
  } else {
    console.log(`[e2e] Serveur arrêté (code ${result.code ?? "?"}).`);
  }

  managedServer = null;
  startedManagedServer = false;

  if (await isServerUp(baseURL)) {
    console.error(
      `[e2e] Diagnostic : ${baseURL} répond encore — un processus occupe peut-être le port ${port}.`,
    );
  }
}

function runPlaywright(env, extraArgs) {
  if (!existsSync(playwrightCli)) {
    throw new Error(`[e2e] CLI Playwright introuvable : ${playwrightCli}`);
  }

  console.log("[e2e] Lancement Playwright…\n");
  return spawnSync(process.execPath, [playwrightCli, "test", ...extraArgs], {
    cwd: root,
    env,
    stdio: "inherit",
  });
}

async function main() {
  const env = {
    ...loadEnvFile(resolve(root, ".env.example")),
    ...loadEnvFile(resolve(root, ".env.local")),
    ...process.env,
    SHIPPING_DEV_MOCK: "true",
    E2E_PROD_SERVER: "1",
    // Serveur `next start` local sans Upstash : fallback mémoire strictement pour les e2e.
    E2E_ALLOW_MEMORY_RATE_LIMIT: "1",
    PLAYWRIGHT_BASE_URL: baseURL,
    PLAYWRIGHT_SKIP_WEBSERVER: "1",
  };

  let exitCode = 1;

  try {
    const serverAlreadyUp = await isServerUp(baseURL);
    if (serverAlreadyUp) {
      console.log(
        `[e2e] Serveur existant réutilisé — ${baseURL} (non arrêté à la fin)`,
      );
    } else {
      ensureProductionBuild();
      await startManagedServer(env);
    }

    const result = runPlaywright(env, process.argv.slice(2));
    exitCode = result.status ?? 1;

    if (exitCode === 0) {
      console.log("\n[e2e] Terminé — tous les tests ont réussi.");
    } else {
      console.log(
        `\n[e2e] Terminé avec le code ${exitCode} — voir le résumé Playwright ci-dessus.`,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[e2e] Échec du lanceur :", message);
    exitCode = 1;
  } finally {
    await stopManagedServer();
  }

  process.exit(exitCode);
}

await main();
