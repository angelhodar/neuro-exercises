import { Sandbox } from "@vercel/sandbox";
import { getLatestSnapshot } from "@/app/actions/snapshots";
import { createSnapshot } from "@/lib/sandbox";

async function getOrRefreshSnapshot() {
  const snapshot = await getLatestSnapshot();

  if (snapshot) {
    return snapshot;
  }

  console.log("No valid snapshot found. Creating fresh snapshot...");
  return createSnapshot();
}

export async function getAgentSandbox(): Promise<Sandbox> {
  const snapshot = await getOrRefreshSnapshot();

  const sandbox = await Sandbox.create({
    persistent: false,
    ports: [3000],
    source: { snapshotId: snapshot.snapshotId, type: "snapshot" },
    timeout: 900_000, // 15 min
  });

  console.log(`Created new agent sandbox: ${sandbox.name}`);
  return sandbox;
}
