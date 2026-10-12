import { authorizeE2E, e2eResponse } from "@/lib/e2e/access";
import { e2eRunSchema } from "@/lib/e2e/fixtures";

export async function POST(request: Request) {
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
    const { setupE2ERun } = await import("@/lib/e2e/repository");
    return e2eResponse(
      await setupE2ERun(runId, access.namespace, access.token)
    );
  } catch {
    return e2eResponse(
      {
        error:
          "Could not prepare test fixtures; check preview catalog and account identities",
      },
      409
    );
  }
}
