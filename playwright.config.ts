import { defineConfig, devices } from "@playwright/test";
import { appUrl, assertTestEnvironment } from "./tests/support/environment";
import {
  deploymentHeaders,
  previewBaseUrl,
} from "./tests/support/preview-environment";

const preview = previewBaseUrl();
if (!preview) {
  assertTestEnvironment();
}

export default defineConfig({
  expect: { timeout: 15_000 },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  reporter: [
    ["./tests/support/secret-reporter.ts"],
    ["list"],
    ["html", { open: "never" }],
  ],
  retries: process.env.CI ? 1 : 0,
  testDir: "./tests/e2e",
  ...(preview
    ? { testIgnore: ["**/authoring.spec.ts", "**/requirements.spec.ts"] }
    : {}),
  timeout: 60_000,
  use: {
    baseURL: preview ?? appUrl,
    extraHTTPHeaders: preview ? deploymentHeaders() : {},
    screenshot: "only-on-failure",
    // Deployment bypass credentials must not be retained in browser traces.
    trace: preview ? "off" : "retain-on-failure",
  },
  webServer: preview
    ? undefined
    : {
        command: "npm run dev -- --turbopack --hostname 127.0.0.1 --port 3100",
        reuseExistingServer: false,
        timeout: 120_000,
        url: `${appUrl}/login`,
      },
  workers: 1,
});
