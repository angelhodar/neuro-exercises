import { authorizeE2E, e2eResponse } from "@/lib/e2e/access";
import { e2eRunSchema } from "@/lib/e2e/fixtures";

export async function DELETE(request: Request) {
  const access = authorizeE2E(request);
  if (access instanceof Response) {
    return access;
  }
  let runId: string;
  try {
    ({ runId } = e2eRunSchema.parse(await request.json()));
  } catch {
    return e2eResponse({ error: "Invalid test run" }, 400);
  }
  try {
    const { cleanupE2ERun } = await import("@/lib/e2e/repository");
    await cleanupE2ERun(runId, access.namespace, access.token);
    return e2eResponse({ cleaned: true, runId });
  } catch {
    return e2eResponse({ error: "Could not clean test fixtures" }, 500);
  }
}
