import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3002";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const nextStartCommand = `node "${path.join(process.cwd(), "node_modules/next/dist/bin/next")}" start -p ${port}`;
const webServerShutdownTimeoutMs = Number(
  process.env.PLAYWRIGHT_WEBSERVER_SHUTDOWN_MS ?? "15_000",
);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  outputDir: "test-results",
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
      },
    },
  ],
  ...(process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? {}
    : {
        webServer: {
          command: nextStartCommand,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          gracefulShutdown: {
            signal: "SIGTERM",
            timeout: webServerShutdownTimeoutMs,
          },
          env: {
            ...process.env,
            SHIPPING_DEV_MOCK: "true",
          },
        },
      }),
});
