import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { exerciseRequirementDrafts } from "@/lib/db/schema";
import type { ExerciseRefinementMessage } from "./agent";

export function findRequirementDraft(id: string, creatorId: string) {
  return db.query.exerciseRequirementDrafts.findFirst({
    where: and(
      eq(exerciseRequirementDrafts.id, id),
      eq(exerciseRequirementDrafts.creatorId, creatorId)
    ),
  });
}

export function listRequirementDrafts(creatorId: string) {
  return db
    .select({
      id: exerciseRequirementDrafts.id,
      title: exerciseRequirementDrafts.title,
      updatedAt: exerciseRequirementDrafts.updatedAt,
    })
    .from(exerciseRequirementDrafts)
    .where(
      and(
        eq(exerciseRequirementDrafts.creatorId, creatorId),
        isNull(exerciseRequirementDrafts.createdExerciseId)
      )
    )
    .orderBy(desc(exerciseRequirementDrafts.updatedAt))
    .limit(20);
}

export async function saveRequirementDraftTurn({
  id,
  creatorId,
  revision,
  messages,
}: {
  id: string;
  creatorId: string;
  revision: number;
  messages: ExerciseRefinementMessage[];
}) {
  const [draft] = await db
    .update(exerciseRequirementDrafts)
    .set({ messages, revision: sql`${exerciseRequirementDrafts.revision} + 1` })
    .where(
      and(
        eq(exerciseRequirementDrafts.id, id),
        eq(exerciseRequirementDrafts.creatorId, creatorId),
        eq(exerciseRequirementDrafts.revision, revision),
        isNull(exerciseRequirementDrafts.createdExerciseId)
      )
    )
    .returning({ revision: exerciseRequirementDrafts.revision });
  return draft;
}

export async function saveRequirementDraftResponse({
  id,
  creatorId,
  revision,
  messages,
}: {
  id: string;
  creatorId: string;
  revision: number;
  messages: ExerciseRefinementMessage[];
}) {
  const [saved] = await db
    .update(exerciseRequirementDrafts)
    .set({ messages })
    .where(
      and(
        eq(exerciseRequirementDrafts.id, id),
        eq(exerciseRequirementDrafts.creatorId, creatorId),
        eq(exerciseRequirementDrafts.revision, revision),
        isNull(exerciseRequirementDrafts.createdExerciseId)
      )
    )
    .returning({ id: exerciseRequirementDrafts.id });
  if (!saved) {
    throw new Error(
      "El borrador cambió en otra pestaña. Recarga para continuar."
    );
  }
}
