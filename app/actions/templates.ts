"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "./users";
import { exerciseTemplates, exerciseTemplateItems } from "@/lib/db/schema";

export async function getExerciseTemplates() {
  const templates = await db.query.exerciseTemplates.findMany({
    with: {
      creator: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      exerciseTemplateItems: {
        with: {
          exercise: {
            columns: {
              id: true,
              slug: true,
              displayName: true,
              thumbnailUrl: true,
              tags: true,
            },
          },
        },
        orderBy: (item) => item.position,
      },
    },
    orderBy: (template) => template.createdAt,
  });
  return templates;
}

interface ExerciseTemplateItem {
  exerciseId: number;
  position: number;
  config: any
}

export async function createExerciseTemplate({ title, description, items }: { title: string; description?: string | null; items: Array<ExerciseTemplateItem> }) {
  const user = await getCurrentUser();

  if (!user) throw new Error("No autenticado");
  
  const [template] = await db.insert(exerciseTemplates).values({
    creatorId: user.id,
    title,
    description: description || null,
  }).returning();

  if (!template) throw new Error("No se pudo crear la plantilla");

  const itemsToInsert = items.map((item) => ({
    templateId: template.id,
    exerciseId: item.exerciseId,
    config: item.config,
    position: item.position,
  }));

  await db.insert(exerciseTemplateItems).values(itemsToInsert);

  return template;
} 