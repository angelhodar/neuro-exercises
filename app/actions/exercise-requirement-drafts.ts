"use server";

import { randomUUID } from "node:crypto";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { exerciseRequirementDrafts } from "@/lib/db/schema";
import { exerciseIdeaSchema } from "@/lib/schemas/exercises";

export async function createRequirementDraft(prompt: string) {
  const user = await requireAuth();
  const idea = exerciseIdeaSchema.parse({ prompt });
  const [draft] = await db
    .insert(exerciseRequirementDrafts)
    .values({
      creatorId: user.id,
      id: randomUUID(),
      messages: [
        {
          id: randomUUID(),
          parts: [{ text: idea.prompt, type: "text" }],
          role: "user",
        },
      ],
      title: idea.prompt.slice(0, 160),
    })
    .returning({ id: exerciseRequirementDrafts.id });
  if (!draft) {
    throw new Error("No se pudo guardar el borrador. Inténtalo de nuevo.");
  }
  return draft;
}
