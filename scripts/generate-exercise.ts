import { Octokit } from "@octokit/rest";
import path from "path";
import { generateObject } from "ai";
import { z } from "zod";
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

  // Obtener archivos de la PR
  const { data: files } = await octokit.pulls.listFiles({ owner, repo, pull_number: Number(PR_NUMBER) });
  const requestFile = files.find((f) => f.filename.startsWith("docs/exercises/") && f.filename.endsWith(".md"));
  if (!requestFile) {
    console.log("No se encontró archivo de solicitud");
    return;
  }

  const { data: blob } = await octokit.git.getBlob({ owner, repo, file_sha: requestFile.sha });
  const content = Buffer.from(blob.content, "base64").toString();

  const slug = path.basename(requestFile.filename, ".md");
  console.log(`Solicitud de ejercicio leída: ${slug}`);

  const promptSectionMatch = content.match(/# Prompt[\s\r\n]+([\s\S]*)/);
  const promptText = promptSectionMatch ? promptSectionMatch[1].trim() : content;

  const fileSchema = z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    }),
  );

  console.log("Llamando a OpenAI para generar archivos...");

  const generation = await generateObject({
    model: google("gemini-2.5-pro-preview-05-06"),
    schema: fileSchema,
    prompt: `Eres un asistente que genera archivos de ejercicio para una aplicación basada en Next.js siguiendo estrictamente las directrices descritas.\n\nDirectrices:\n${promptText}\n\nDevuelve un array JSON donde cada elemento tiene:\n- path: ruta relativa (ej. components/mi-ejercicio.tsx)\n- content: el código completo del archivo\n\nNo incluyas ningún texto adicional.`,
  });

  const generatedFiles = generation.object;

  console.log(`Se generaron ${generatedFiles.length} archivos`);

  // -----------------------------
  // 2. Commit de los archivos en la misma rama de la PR
  // -----------------------------

  const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: Number(PR_NUMBER) });
  const branchName = pr.head.ref;

  for (const file of generatedFiles) {
    // Asegurarse de que la ruta no empiece por '/'
    const filePath = file.path.replace(/^\/+/, "");

    // Comprobamos si existe ya el archivo para determinar si incluimos sha
    let sha: string | undefined;
    try {
      const { data: existing } = await octokit.repos.getContent({ owner, repo, path: filePath, ref: branchName });
      if (!Array.isArray(existing)) sha = existing.sha;
    } catch {
      // no existe
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `feat(${slug}): añadir ${filePath}`,
      content: Buffer.from(file.content).toString("base64"),
      branch: branchName,
      ...(sha ? { sha } : {}),
    });
  }

  console.log("Archivos añadidos/actualizados en la rama de la PR");
}

run().catch((err: Error) => {
  console.error(err);
  process.exit(1);
}); 