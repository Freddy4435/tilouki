#!/usr/bin/env node
/** Alias utilisé par npm run qa — délègue au lanceur Playwright production. */
import { spawnSync } from "node:child_process";

const result = spawnSync("node", ["scripts/run-playwright.mjs"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
