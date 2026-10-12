import assert from "node:assert/strict";
import { test } from "node:test";
import { signInUser } from "../support/sign-in";

const credentials = {
  email: "synthetic@example.invalid",
  password: "synthetic-password",
};

test("fixture login honors server retry headers without bypassing authentication", async () => {
  for (const header of ["retry-after", "x-retry-after"]) {
    const delays: number[] = [];
    let attempts = 0;
    const client = {
      post(path: string, options: { data: typeof credentials }) {
        assert.equal(path, "/api/auth/sign-in/email");
        assert.deepEqual(options.data, credentials);
        attempts += 1;
        return Promise.resolve({
          headers: () => ({ [header]: "2" }),
          status: () => (attempts === 1 ? 429 : 200),
        });
      },
    };
    // biome-ignore lint/performance/noAwaitInLoops: verify each supported server header independently
    await signInUser(client, credentials, (milliseconds) => {
      delays.push(milliseconds);
      return Promise.resolve();
    });
    assert.equal(attempts, 2);
    assert.deepEqual(delays, [2000]);
  }
});

test("invalid credentials, unbounded retry delays, and repeated rate limits fail safely", async () => {
  for (const [status, retry] of [
    [401, "1"],
    [429, "100"],
    [429, "invalid"],
    [429, "1"],
  ] as const) {
    let attempts = 0;
    const client = {
      post() {
        attempts += 1;
        return Promise.resolve({
          headers: () => ({ "x-retry-after": retry }),
          status: () => status,
        });
      },
    };
    // biome-ignore lint/performance/noAwaitInLoops: validate bounded failure for each server response
    await assert.rejects(
      signInUser(client, credentials, () => Promise.resolve())
    );
    assert.equal(attempts, status === 429 && retry === "1" ? 3 : 1);
  }
});
