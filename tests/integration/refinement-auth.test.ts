import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { NextRequest } from "next/server";

test("the refinement endpoint revalidates sessions instead of trusting cached cookies", async () => {
  process.env.DATABASE_URL = "postgresql://audit:audit@localhost:5432/audit";
  process.env.BETTER_AUTH_SECRET = "isolated-refinement-regression-test-secret";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  const { auth } = await import("../../lib/auth/auth.server");
  const sessionLookup = mock.method(
    auth.api,
    "getSession",
    (options: Parameters<typeof auth.api.getSession>[0]) => {
      assert.equal(options?.query?.disableCookieCache, true);
      return Promise.resolve(null);
    }
  );
  try {
    const { POST } = await import("../../app/api/exercise-refinement/route");
    const response = await POST(
      new NextRequest("http://localhost:3000/api/exercise-refinement", {
        headers: { cookie: "better-auth.session_data=revoked-session" },
        method: "POST",
      })
    );
    assert.equal(response.status, 401);
    assert.equal(sessionLookup.mock.callCount(), 1);
  } finally {
    sessionLookup.mock.restore();
  }
});
