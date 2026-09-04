import { Snapshot } from "@vercel/sandbox";
import { getBaseSandboxName } from "@/lib/sandbox";

export interface SnapshotInfo {
  expiresAt: Date | undefined;
  snapshotId: string;
}

export async function getLatestSnapshot(): Promise<SnapshotInfo | null> {
  try {
    const snapshots = await Snapshot.list({
      limit: 1,
      name: getBaseSandboxName(),
      sortOrder: "desc",
    });

    for await (const snapshot of snapshots) {
      if (snapshot.status !== "created") {
        continue;
      }

      const expiresAt = snapshot.expiresAt
        ? new Date(snapshot.expiresAt)
        : undefined;

      if (!expiresAt || expiresAt.getTime() >= Date.now()) {
        return { expiresAt, snapshotId: snapshot.id };
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting latest snapshot:", error);
    return null;
  }
}
