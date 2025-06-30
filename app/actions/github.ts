"use server";

import { Octokit } from "@octokit/rest";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { Exercise } from "@/lib/db/schema";

const { GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env;

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function getPullRequestNumber(slug: string): Promise<number | null> {
  const row = await db.query.exercises.findFirst({
    where: eq(exercises.slug, slug),
  });

  return row?.prNumber ?? null;
}

export async function getPRComments(slug: string) {
  const prNumber = await getPullRequestNumber(slug);

  if (!prNumber) return [];

  const [owner, repo] = GITHUB_REPOSITORY!.split("/");

  const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });

  const { data: comments } = await octokit.issues.listComments({ owner, repo, issue_number: prNumber, per_page: 100 });

  return [pr, ...comments];
}

export async function addPRComment(slug: string, body: string) {
  const prNumber = await getPullRequestNumber(slug);
  if (!prNumber) throw new Error("PR no encontrado para el ejercicio");

  const [owner, repo] = GITHUB_REPOSITORY!.split("/");
  
  await octokit.issues.createComment({ owner, repo, issue_number: prNumber, body });

  revalidatePath(`/dashboard/exercises/pending/${slug}`);
}

export async function createExercisePR(exercise: Exercise, prompt: string): Promise<void> {
  if (!GITHUB_REPOSITORY) {
    console.warn("Variables de entorno de GitHub no definidas. Se omite la creación de PR.");
    return;
  }

  const [owner, repo] = GITHUB_REPOSITORY.split("/");

  if (!GITHUB_TOKEN || !owner || !repo) {
    console.warn("Variables de entorno de GitHub no definidas. Se omite la creación de PR.");
    return;
  }

  // Obtener la rama por defecto del repositorio
  const {
    data: { default_branch: defaultBranch },
  } = await octokit.repos.get({ owner, repo });

  // SHA del último commit de la rama por defecto
  const {
    data: {
      object: { sha: baseSha },
    },
  } = await octokit.git.getRef({ owner, repo, ref: `heads/${defaultBranch}` });

  const branchName = `exercise/${exercise.slug}`;

  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });

  // Obtener SHA y árbol del commit base para crear commit vacío
  const { data: baseCommit } = await octokit.git.getCommit({ owner, repo, commit_sha: baseSha });

  const emptyCommit = await octokit.git.createCommit({
    owner,
    repo,
    message: `chore: new exercise ${exercise.slug}`,
    tree: baseCommit.tree.sha,
    parents: [baseSha],
  });

  // Mover la referencia de la rama al nuevo commit vacío
  await octokit.git.updateRef({ owner, repo, ref: `heads/${branchName}`, sha: emptyCommit.data.sha });

  const metadata = {
    slug: exercise.slug,
    displayName: exercise.displayName,
    tags: exercise.tags,
    description: exercise.description || null
  }

  // Crear la Pull Request
  const { data: pr } = await octokit.pulls.create({
    owner,
    repo,
    head: branchName,
    base: defaultBranch,
    title: exercise.displayName,
    body: `<metadata>${JSON.stringify(metadata)}</metadata>
    
    <prompt>${prompt}</prompt>`,
  });

  // Añadir etiqueta "new-exercise" para que la action lo detecte
  //await octokit.issues.addLabels({ owner, repo, issue_number: pr.number, labels: ["new-exercise"] });

  // Actualizar registro ejercicio con número de PR
  try {
    await db.update(exercises).set({ prNumber: pr.number }).where(eq(exercises.slug, exercise.slug));
  } catch (err) {
    console.error("Error asignando prNumber al ejercicio:", err);
  }
} 