import { and, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { type ExerciseWorkspace, exerciseWorkspaces } from "@/lib/db/schema";

const WORKSPACE_LOCK_MS = 30 * 60 * 1000;

function harnessSessionId(exerciseId: number) {
  return `exercise-${exerciseId}`;
}

export async function getOrCreateExerciseWorkspace(exerciseId: number) {
  await db
    .insert(exerciseWorkspaces)
    .values({
      exerciseId,
      harnessSessionId: harnessSessionId(exerciseId),
    })
    .onConflictDoNothing({ target: exerciseWorkspaces.exerciseId });

  const workspace = await db.query.exerciseWorkspaces.findFirst({
    where: eq(exerciseWorkspaces.exerciseId, exerciseId),
  });

  if (!workspace) {
    throw new Error("No se pudo crear el espacio de trabajo del ejercicio");
  }

  return workspace;
}

export async function claimExerciseWorkspace(
  exerciseId: number,
  generationId: number
) {
  await getOrCreateExerciseWorkspace(exerciseId);

  const now = new Date();
  const [workspace] = await db
    .update(exerciseWorkspaces)
    .set({
      activeGenerationId: generationId,
      lastActiveAt: now,
      lastError: null,
      lockExpiresAt: new Date(now.getTime() + WORKSPACE_LOCK_MS),
      updatedAt: now,
    })
    .where(
      and(
        eq(exerciseWorkspaces.exerciseId, exerciseId),
        or(
          isNull(exerciseWorkspaces.activeGenerationId),
          isNull(exerciseWorkspaces.lockExpiresAt),
          lt(exerciseWorkspaces.lockExpiresAt, now)
        )
      )
    )
    .returning();

  return workspace ?? null;
}

interface ReleaseWorkspaceUpdates {
  harnessResumeState?: Record<string, unknown>;
  lastError?: string | null;
}

export async function releaseExerciseWorkspace(
  exerciseId: number,
  generationId: number,
  updates: ReleaseWorkspaceUpdates = {}
) {
  const now = new Date();
  const [workspace] = await db
    .update(exerciseWorkspaces)
    .set({
      ...updates,
      activeGenerationId: null,
      lastActiveAt: now,
      lockExpiresAt: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(exerciseWorkspaces.exerciseId, exerciseId),
        eq(exerciseWorkspaces.activeGenerationId, generationId)
      )
    )
    .returning();

  return workspace ?? null;
}

export async function refreshExerciseWorkspaceLock(
  exerciseId: number,
  generationId: number
) {
  const now = new Date();
  const [workspace] = await db
    .update(exerciseWorkspaces)
    .set({
      lastActiveAt: now,
      lockExpiresAt: new Date(now.getTime() + WORKSPACE_LOCK_MS),
      updatedAt: now,
    })
    .where(
      and(
        eq(exerciseWorkspaces.exerciseId, exerciseId),
        eq(exerciseWorkspaces.activeGenerationId, generationId)
      )
    )
    .returning();

  return workspace ?? null;
}

export async function updateExerciseWorkspace(
  exerciseId: number,
  updates: Partial<
    Pick<
      ExerciseWorkspace,
      "baseCommitSha" | "lastActiveAt" | "lastError" | "sandboxName"
    >
  >
) {
  const [workspace] = await db
    .update(exerciseWorkspaces)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(exerciseWorkspaces.exerciseId, exerciseId))
    .returning();

  return workspace ?? null;
}
