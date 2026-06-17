import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");

function parseEnvFile(filePath) {
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

/**
 * Charge .env.example → .env.local → (.env.production.local si production) → process.env
 * @param {{ production?: boolean }} [options]
 */
export function loadProjectEnv(options = {}) {
  const { production = false } = options;
  const merged = {
    ...parseEnvFile(resolve(root, ".env.example")),
    ...parseEnvFile(resolve(root, ".env.local")),
    ...(production ? parseEnvFile(resolve(root, ".env.production.local")) : {}),
    ...process.env,
  };
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined) process.env[key] = value;
  }
  return merged;
}

export const projectRoot = root;
