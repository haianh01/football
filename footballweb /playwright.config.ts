import { defineConfig } from "@playwright/test";

import { e2eDatabaseUrl } from "./test/e2e/db";

const port = Number(process.env.PLAYWRIGHT_PORT || 3005);

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  globalSetup: "./test/e2e/global-setup.ts",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    headless: true,
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || "/snap/bin/chromium"
    }
  },
  webServer: {
    command: `PATH=/home/haianh/.nvm/versions/node/v20.19.6/bin:$PATH node_modules/.bin/next dev --webpack --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      NODE_ENV: "development",
      DATABASE_URL: e2eDatabaseUrl,
      AUTH_SECRET: process.env.AUTH_SECRET || "playwright-dev-secret",
      AUTH_URL: `http://127.0.0.1:${port}`
    }
  }
});
