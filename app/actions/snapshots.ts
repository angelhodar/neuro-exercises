import { Snapshot } from "@vercel/sandbox";

export interface SnapshotInfo {
  snapshotId: string;
  expiresAt: Date | undefined;
}

export async function getLatestSnapshot(): Promise<SnapshotInfo | null> {
  try {
    const { snapshots } = await Snapshot.list({ limit: 1 });

    const latest = snapshots.find((s) => s.status === "created");

    if (!latest) {
      return null;
    }

    const expiresAt = latest.expiresAt ? new Date(latest.expiresAt) : undefined;

    if (expiresAt && expiresAt.getTime() < Date.now()) {
      return null;
    }

    return { snapshotId: latest.id, expiresAt };
  } catch (error) {
    console.error("Error getting latest snapshot:", error);
    return null;
  }
}

export async function deleteOldSnapshots(
  currentSnapshotId: string
): Promise<void> {
  try {
    const { snapshots } = await Snapshot.list();

    const toDelete = snapshots.filter(
      (s) => s.id !== currentSnapshotId && s.status === "created"
    );

    for (const s of toDelete) {
      const snapshot = await Snapshot.get({ snapshotId: s.id });
      await snapshot.delete();
      console.log(`Deleted old snapshot: ${s.id}`);
    }

    if (toDelete.length > 0) {
      console.log(`Cleaned up ${toDelete.length} old snapshot(s)`);
    }
  } catch (error) {
    console.error("Error deleting old snapshots:", error);
  }
}
