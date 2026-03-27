"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import {
  createBranch,
  createOrUpdateFile,
  createPullRequest,
  getFileSha,
  getMainBranchSha,
} from "@/lib/github";
import { createBlobUrl, downloadFromUrl } from "@/lib/utils";
import { extractFiles } from "@/lib/zip";
import { getLastCompletedGeneration } from "./generations";
import { getCurrentUser } from "./users";

export async function publishExercise(
  exerciseId: number
): Promise<{ prUrl: string; prNumber: number } | { error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "No autenticado" };
    }

    const exercise = await db.query.exercises.findFirst({
      where: eq(exercises.id, exerciseId),
    });

    if (!exercise) {
      return { error: "Ejercicio no encontrado" };
    }

    if (exercise.publishStatus !== "UNPUBLISHED") {
      return { error: "Este ejercicio ya fue enviado para revisión o publicado" };
    }

    const generation = await getLastCompletedGeneration(exerciseId);
    if (!generation?.codeBlobKey) {
      return { error: "No hay una versión completada del ejercicio para publicar" };
    }

    const zipArrayBuffer = await downloadFromUrl(
      createBlobUrl(generation.codeBlobKey)
    );
    const files = extractFiles(Buffer.from(zipArrayBuffer));

    if (files.length === 0) {
      return { error: "No se encontraron archivos en la generación" };
    }

    const branchName = `exercise/publish-${exercise.slug}-${Date.now()}`;
    const mainSha = await getMainBranchSha();
    await createBranch(branchName, mainSha);

    for (const file of files) {
      const existingSha = await getFileSha(file.path, branchName);
      await createOrUpdateFile(
        file.path,
        file.content,
        `feat(exercise): add ${exercise.slug} - ${file.path}`,
        branchName,
        existingSha
      );
    }

    const tags = exercise.tags?.length ? exercise.tags.join(", ") : "ninguna";
    const prBody = [
      `## Ejercicio: ${exercise.displayName}`,
      "",
      exercise.description ? `**Descripción:** ${exercise.description}` : "",
      `**Etiquetas:** ${tags}`,
      "",
      generation.summary
        ? `### Resumen de la generación\n${generation.summary}`
        : "",
      "",
      `---`,
      `_Generado automáticamente desde NeuroGranada por ${user.name ?? user.email}_`,
    ]
      .filter((line) => line !== undefined)
      .join("\n");

    const pr = await createPullRequest(
      `feat(exercise): Add ${exercise.displayName}`,
      prBody,
      branchName
    );

    await db
      .update(exercises)
      .set({ prNumber: pr.number, publishStatus: "PENDING_REVIEW" })
      .where(eq(exercises.id, exerciseId));

    return { prUrl: pr.html_url, prNumber: pr.number };
  } catch (error) {
    console.error("Error publishing exercise:", error);
    return { error: "Error al publicar el ejercicio" };
  }
}
