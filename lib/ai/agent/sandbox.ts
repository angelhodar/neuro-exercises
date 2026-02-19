import { Sandbox } from "@vercel/sandbox";
import { getLatestSnapshot } from "@/app/actions/snapshots";
import { createSnapshot } from "@/lib/sandbox";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

async function getOrRefreshSnapshot() {
  const snapshot = await getLatestSnapshot();

  if (
    snapshot &&
    new Date(snapshot.expiresAt).getTime() - Date.now() > TWO_DAYS_MS
  ) {
    return snapshot;
  }

  console.log(
    snapshot
      ? "Snapshot expiring soon. Creating fresh snapshot..."
      : "No valid snapshot found. Creating fresh snapshot..."
  );

  return createSnapshot();
}

export async function getAgentSandbox(
  previousSandboxId: string | null
): Promise<Sandbox> {
  if (previousSandboxId) {
    try {
      const sandbox = await Sandbox.get({ sandboxId: previousSandboxId });

      if (sandbox.status === "running") {
        console.log(`Reusing existing sandbox: ${previousSandboxId}`);
        return sandbox;
      }
    } catch {
      console.log(
        `Previous sandbox ${previousSandboxId} unavailable, creating new one...`
      );
    }
  }

  const snapshot = await getOrRefreshSnapshot();

  const sandbox = await Sandbox.create({
    source: { type: "snapshot", snapshotId: snapshot.snapshotId },
    ports: [3000],
    timeout: 900_000, // 15 min
  });

  console.log(`Created new agent sandbox: ${sandbox.sandboxId}`);
  return sandbox;
}
