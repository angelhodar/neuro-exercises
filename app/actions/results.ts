"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { exerciseResults } from "@/lib/db/schema";

export async function getResultsById(resultId: number) {
  try {
    const result = await db.query.exerciseResults.findFirst({
      where: eq(exerciseResults.id, resultId),
      with: {
        exerciseLink: {
          columns: {
            token: true,
          },
        },
        templateItem: {
          columns: {
            config: true,
          },
          with: {
            exercise: {
              columns: {
                displayName: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    return {
      backUrl: `/s/${result.exerciseLink.token}`,
      completedAt: result.completedAt,
      config: result.templateItem.config,
      exerciseDisplayName: result.templateItem.exercise.displayName,
      exerciseSlug: result.templateItem.exercise.slug,
      id: result.id,
      results: result.results,
      startedAt: result.startedAt,
    };
  } catch (error) {
    console.error("Error fetching result by ID:", error);
    return null;
  }
}
