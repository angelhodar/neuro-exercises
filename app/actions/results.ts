"use server";

import { db } from "@/lib/db";
import { exerciseResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getResultsById(resultId: number) {
  try {
    const result = await db.query.exerciseResults.findFirst({
      where: eq(exerciseResults.id, resultId),
      with: {
        exerciseLink: {
          columns: {
            publicId: true,
          },
        },
        templateItem: {
          columns: {
            config: true,
          },
          with: {
            exercise: {
              columns: {
                slug: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!result) return null;

    return {
      id: result.id,
      results: result.results,
      config: result.templateItem.config,
      exerciseSlug: result.templateItem.exercise.slug,
      exerciseDisplayName: result.templateItem.exercise.displayName,
      completedAt: result.completedAt,
      startedAt: result.startedAt,
      backUrl: `/s/${result.exerciseLink.publicId}`,
    };
  } catch (error) {
    console.error("Error fetching result by ID:", error);
    return null;
  }
} 