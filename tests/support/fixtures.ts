import { randomUUID } from "node:crypto";
import { test as base } from "@playwright/test";
import { cleanupRun, setupRun } from "./e2e-api";
import { signInUser } from "./sign-in";

type TestRun = Awaited<ReturnType<typeof setupRun>>;

export const publicTest = base.extend<{
  testRun: TestRun;
}>({
  testRun: [
    async ({ baseURL }, use, testInfo) => {
      if (!baseURL) {
        throw new Error("A test application origin is required");
      }
      const runId = randomUUID();
      testInfo.annotations.push({ description: runId, type: "e2e-run" });
      try {
        await use(await setupRun(baseURL, runId));
      } finally {
        await cleanupRun(baseURL, runId);
      }
    },
    { auto: true },
  ],
});

export const test = publicTest.extend<{
  professional: TestRun["professional"];
}>({
  professional: [
    async ({ page, testRun }, use) => {
      const user = testRun.professional;
      await signInUser(page.request, {
        email: user.email,
        password: user.password,
      });
      await use(user);
    },
    { auto: true },
  ],
});
