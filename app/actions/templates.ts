"use server";

import { db } from "@/lib/db";
import {
  exerciseTemplateItems,
  exerciseTemplates,
  type NewExerciseTemplate,
  type NewExerciseTemplateItem,
} from "@/lib/db/schema";
import { getCurrentUser } from "./users";

export async function getExerciseTemplates() {
  const templates = await db.query.exerciseTemplates.findMany({
    orderBy: (template) => template.createdAt,
    with: {
      creator: {
        columns: {
          email: true,
          id: true,
          name: true,
        },
      },
      exerciseTemplateItems: {
        orderBy: (item) => item.position,
        with: {
          exercise: {
            columns: {
              displayName: true,
              id: true,
              slug: true,
              tags: true,
              thumbnailUrl: true,
            },
          },
        },
      },
    },
  });

  return templates;
}

type CreateExerciseTemplateItemProps = Omit<
  NewExerciseTemplateItem,
  "templateId"
>;
type CreateExerciseTemplateProps = Pick<
  NewExerciseTemplate,
  "title" | "description"
> & { items: CreateExerciseTemplateItemProps[] };

export async function createExerciseTemplate(
  newTemplate: CreateExerciseTemplateProps
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const [template] = await db
    .insert(exerciseTemplates)
    .values({
      creatorId: user.id,
      description: newTemplate.description || null,
      title: newTemplate.title,
    })
    .returning();

  if (!template) {
    throw new Error("No se pudo crear la plantilla");
  }

  const itemsToInsert = newTemplate.items.map((item) => ({
    config: item.config,
    exerciseId: item.exerciseId,
    position: item.position,
    templateId: template.id,
  }));

  await db.insert(exerciseTemplateItems).values(itemsToInsert);

  return template;
}
