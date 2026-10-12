import { e2eSetupSchema } from "../../lib/e2e/fixtures";
import { deploymentHeaders } from "./preview-environment";

async function request(
  baseURL: string,
  path: string,
  runId: string,
  method: string
) {
  const token = process.env.E2E_TOKEN;
  if (!token) {
    throw new Error("E2E_TOKEN is required for fixture setup and cleanup");
  }
  // Node fetch keeps the privileged token out of browser traffic and Playwright
  // request traces. Never follow a redirect with this authorization header.
  let response: Response;
  try {
    response = await fetch(new URL(path, baseURL), {
      body: JSON.stringify({ runId }),
      headers: {
        ...deploymentHeaders(),
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      method,
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    // Do not retain request/invalid-header errors that may contain credentials.
    // biome-ignore lint/style/useErrorCause: the original error may disclose privileged request headers
    throw new Error(`E2E ${method} ${path} request failed; run ${runId}`);
  }
  if (!response.ok) {
    throw new Error(
      `E2E ${method} ${path} failed (${response.status}); run ${runId}`
    );
  }
  return response;
}

export async function setupRun(baseURL: string, runId: string) {
  const response = await request(baseURL, "/api/e2e/setup", runId, "POST");
  const data = e2eSetupSchema.parse(await response.json());
  if (data.runId !== runId) {
    throw new Error("Fixture setup returned a different test run");
  }
  return data;
}

export async function cleanupRun(baseURL: string, runId: string) {
  await request(baseURL, "/api/e2e/cleanup", runId, "DELETE");
}
