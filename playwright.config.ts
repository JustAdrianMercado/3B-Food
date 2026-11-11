import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync(edge) ? edge : undefined);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3100";

export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: false, workers: 2,
  globalSetup: "./tests/e2e/global-setup.ts", globalTeardown: "./tests/e2e/global-teardown.ts",
  timeout: 60000, expect: { timeout: 10000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, viewport: { width: 1440, height: 1000 }, launchOptions: { executablePath }, screenshot: "only-on-failure", trace: "retain-on-failure", reducedMotion: "reduce" },
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : { command: "npm run start -- --port 3100", url: baseURL, reuseExistingServer: !process.env.CI, timeout: 120000 },
});
