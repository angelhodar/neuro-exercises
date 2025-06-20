import { Octokit } from "@octokit/rest";
import { Exercise } from "@/lib/db/schema";

// GITHUB_REPOSITORY: owner/repo

const { GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env;

export async function createExercisePR(
  exercise: Exercise,
  prompt: string
): Promise<void> {
  if (!GITHUB_REPOSITORY) {
    console.warn(
      "Variables de entorno de GitHub no definidas. Se omite la creación de PR."
    );
    return;
  }

  const [owner, repo] = GITHUB_REPOSITORY.split("/");

  if (!GITHUB_TOKEN || !owner || !repo) {
    console.warn(
      "Variables de entorno de GitHub no definidas. Se omite la creación de PR."
    );
    return;
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

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

  // Intentar crear la rama (puede fallar si ya existe)
  try {
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });
  } catch (error: unknown) {
    // 422 = Unprocessable Entity (la ref ya existe)
    if ((error as any)?.status !== 422) {
      throw error;
    }
  }

  // Construir el contenido del archivo de solicitud
  const filePath = `docs/exercises/${exercise.slug}.md`;
  const markdownContent = `---\nslug: ${exercise.slug}\ndisplayName: ${
    exercise.displayName
  }\ncategory: ${exercise.category}\ndescription: ${
    exercise.description ?? ""
  }\ncreatedAt: ${new Date().toISOString()}\n---\n\n# Prompt\n\n${prompt}\n`;
  const encodedContent = Buffer.from(markdownContent).toString("base64");

  // Crear o actualizar el archivo en la rama
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: `chore: solicitud IA para ejercicio ${exercise.slug}`,
    content: encodedContent,
    branch: branchName,
  });

  // Crear la Pull Request
  await octokit.pulls.create({
    owner,
    repo,
    head: branchName,
    base: defaultBranch,
    title: `Generar ejercicio: ${exercise.displayName}`,
    body: `Esta PR ha sido generada automáticamente para que una GitHub Action cree los archivos del ejercicio **${exercise.displayName}** siguiendo la guía exercises-guidelines.mdc.\n\nEl prompt proporcionado por el usuario está incluido en \`${filePath}\`.`,
  });
}
