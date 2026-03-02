import "dotenv/config";

import { createSnapshot } from "@/lib/sandbox";

async function main() {
  if (!process.env.VERCEL) {
    console.log("[deploy-snapshot] Not running on Vercel, skipping.");
    return;
  }

  if (process.env.VERCEL_GIT_COMMIT_REF !== "main") {
    console.log(
      `[deploy-snapshot] Branch is "${process.env.VERCEL_GIT_COMMIT_REF}", not "main". Skipping.`
    );
    return;
  }

  console.log("[deploy-snapshot] Creating fresh sandbox snapshot...");
  const startTime = Date.now();

  const snapshot = await createSnapshot();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[deploy-snapshot] Snapshot created successfully in ${elapsed}s`);
  console.log(`[deploy-snapshot] Snapshot ID: ${snapshot.snapshotId}`);
  console.log(
    `[deploy-snapshot] Expires at: ${snapshot.expiresAt?.toISOString() ?? "no expiration"}`
  );
}

main().catch((error) => {
  console.error("[deploy-snapshot] Failed to create snapshot:", error);
  console.error(
    "[deploy-snapshot] Deploy will continue. Lazy refresh will handle snapshot creation on next user request."
  );
});
