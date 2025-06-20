import { Octokit } from "@octokit/rest";
import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

async function run(): Promise<void> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
  const PR_NUMBER = process.env.PR_NUMBER;

  if (!GITHUB_TOKEN || !GITHUB_REPOSITORY) {
    console.error("Faltan variables de entorno para GitHub");
    process.exit(1);
  }

  if (!PR_NUMBER) {
    console.error("PR_NUMBER no proporcionado por la GitHub Action");
    process.exit(1);
  }

  const [owner, repo] = GITHUB_REPOSITORY.split("/");
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  // Obtener datos de la PR
  const { data: pr } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: Number(PR_NUMBER),
  });

  if (!pr.body) {
    console.error("No se encontró el cuerpo de la PR");
    process.exit(1);
  }

  const slugMatch = pr.body.match(/Slug:\s*(.+)/);
  const slug = slugMatch ? slugMatch[1].trim() : "unknown-slug";

  const promptMatch = pr.body.match(/## Prompt\s*([\s\S]*)/);
  const promptText = promptMatch ? promptMatch[1].trim() : pr.body;

  console.log(`Solicitud de ejercicio leída: ${slug}`);

  const generation = await generateObject({
    model: google("gemini-2.5-pro-preview-05-06"),
    schema: z.array(
      z.object({
        path: z.string(),
        content: z.string(),
      })
    ),
    prompt: `Eres un asistente que genera archivos de ejercicio para una aplicación basada en Next.js siguiendo estrictamente las directrices descritas.\n\nDirectrices:\n${promptText}\n\nDevuelve un array JSON donde cada elemento tiene:\n- path: ruta relativa (ej. components/mi-ejercicio.tsx)\n- content: el código completo del archivo\n\nNo incluyas ningún texto adicional.`,
  });

  const generatedFiles = generation.object;

  console.log(`Se generaron ${generatedFiles.length} archivos`);

  const branchName = pr.head.ref;

  for (const file of generatedFiles) {
    // Asegurarse de que la ruta no empiece por '/'
    const filePath = file.path.replace(/^\/+/, "");

    // Comprobamos si existe ya el archivo para determinar si incluimos sha
    let sha: string | undefined;

    const { data: existing } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branchName,
    });

    if (!Array.isArray(existing)) sha = existing.sha;

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `feat(${slug}): añadir ${filePath}`,
      content: Buffer.from(file.content).toString("base64"),
      branch: branchName,
      sha,
    });
  }

  console.log("Archivos añadidos/actualizados en la rama de la PR");
}

run().catch((err: Error) => {
  console.error(err);
  process.exit(1);
});
