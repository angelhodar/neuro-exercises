"use server";

import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { NewExerciseLink } from "@/lib/db/schema";
import { exerciseLinks, exerciseResults } from "@/lib/db/schema";
import { getCurrentUser } from "./users";

function generateSecureToken(): string {
  return nanoid(12);
}

type CreateExerciseLink = Pick<NewExerciseLink, "targetUserId" | "templateId">;

export async function createExerciseLink(link: CreateExerciseLink) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("Usuario no autenticado");
    }

    const [newLink] = await db
      .insert(exerciseLinks)
      .values({
        creatorId: currentUser.id,
        targetUserId: link.targetUserId,
        templateId: link.templateId,
        token: generateSecureToken(),
      })
      .returning();

    revalidatePath("/dashboard/links");

    return newLink;
  } catch (error) {
    console.error("Error creating exercise link:", error);
    throw error;
  }
}

export async function getUserExerciseLinks() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("Usuario no autenticado");
    }

    const linksWithDetails = await db.query.exerciseLinks.findMany({
      where: eq(exerciseLinks.creatorId, currentUser.id),
      orderBy: desc(exerciseLinks.createdAt),
      with: {
        targetUser: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
        template: {
          columns: {
            id: true,
            title: true,
            description: true,
          },
          with: {
            exerciseTemplateItems: {
              with: {
                exercise: {
                  columns: {
                    id: true,
                    slug: true,
                    displayName: true,
                    tags: true,
                  },
                },
              },
              orderBy: (item) => item.position,
            },
          },
        },
      },
    });

    return linksWithDetails;
  } catch (error) {
    console.error("Error getting user exercise links:", error);
    throw error;
  }
}

export async function deleteExerciseLink(linkId: number) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("Usuario no autenticado");
    }

    const link = await db
      .select({ id: exerciseLinks.id })
      .from(exerciseLinks)
      .where(
        and(
          eq(exerciseLinks.id, linkId),
          eq(exerciseLinks.creatorId, currentUser.id)
        )
      )
      .limit(1);

    if (!link.length) {
      throw new Error("Enlace no encontrado");
    }

    await db.delete(exerciseLinks).where(eq(exerciseLinks.id, linkId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting exercise link:", error);
    throw error;
  }
}

export async function getExerciseLinkByToken(token: string) {
  try {
    const linkWithDetails = await db.query.exerciseLinks.findFirst({
      where: eq(exerciseLinks.token, token),
      with: {
        targetUser: true,
        creator: true,
        template: {
          with: {
            exerciseTemplateItems: {
              with: {
                exercise: true,
                exerciseResults: true,
              },
            },
          },
        },
      },
    });

    return linkWithDetails || null;
  } catch (error) {
    console.error("Error getting exercise link by token:", error);
    return null;
  }
}

export async function saveExerciseResults(
  linkId: number,
  exerciseItemId: number,
  results: Record<string, unknown>
) {
  try {
    await db.insert(exerciseResults).values({
      linkId,
      templateItemId: exerciseItemId,
      results,
    });
    return { ok: true };
  } catch (error) {
    console.error("Error guardando resultados del ejercicio:", error);
    throw error;
  }
}
