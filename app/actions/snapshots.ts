"use server";

import { desc, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import type { SandboxSnapshot } from "@/lib/db/schema";
import { sandboxSnapshots } from "@/lib/db/schema";

export async function getLatestSnapshot(): Promise<SandboxSnapshot | null> {
  try {
    const snapshot = await db.query.sandboxSnapshots.findFirst({
      where: gt(sandboxSnapshots.expiresAt, new Date()),
      orderBy: desc(sandboxSnapshots.createdAt),
    });

    return snapshot ?? null;
  } catch (error) {
    console.error("Error getting latest snapshot:", error);
    return null;
  }
}

export async function saveSnapshot(
  snapshotId: string,
  gitRevision?: string
): Promise<SandboxSnapshot | null> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [snapshot] = await db
      .insert(sandboxSnapshots)
      .values({
        snapshotId,
        gitRevision,
        expiresAt,
      })
      .returning();

    return snapshot;
  } catch (error) {
    console.error("Error saving snapshot:", error);
    return null;
  }
}
