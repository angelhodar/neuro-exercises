import "dotenv/config";

import { Octokit } from "@octokit/rest";
import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { writeFileSync } from "fs";
import { format } from "prettier";
import { execSync } from "child_process";

const createPrompt = (promptText: string, slug: string) => {
  const context = execSync(
    'npx repomix --include "components/exercises/**/*" --ignore "components/exercises/exercise-*" --stdout',
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  ).trim();

  return `Eres un asistente que genera archivos de un ejercicio neurocognitivo para una aplicación basada en Next.js siguiendo estrictamente las directrices descritas.
  
  Las directrices para el ejercicio son:

  <directrices>
  ${promptText}
  </directrices>
  
  Devuelve un array JSON donde cada elemento tiene:
  
  - path: ruta relativa (ej. components/mi-ejercicio.tsx)
  - content: el código completo del archivo

  Aquí tienes ejemplos de cómo debe ser el código con otros ejercicios ya completados. Fíjate en las rutas de los archivos para que sepas dónde poner el tuyo. En este caso, el slug del ejercicio es ${slug}:

  <ejemplos>
  ${context}
  </ejemplos>

  IMPORTANTE: El código en 'content' debe ser sintácticamente correcto y estar bien formateado, con saltos de línea entre sentencias (interfaces, funciones, constantes, etc.), como lo haría un desarrollador humano. No concatenes todo el código en una sola línea`;
};

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

  const prompt = createPrompt(promptText, slug);

  console.log(`Solicitud de ejercicio leída: ${slug}`);

  const { object: generatedFiles } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: z.array(
      z.object({
        path: z.string(),
        content: z.string(),
      }),
    ),
    prompt
  });

  const prettifiedFiles = await Promise.all(
    generatedFiles.map(async (file) => {
      try {
        // Prettier automatically finds .prettierrc.json and uses its rules.
        const formattedContent = await format(file.content, {
          filepath: file.path,
        });

        return { ...file, content: formattedContent };
      } catch (error) {
        console.warn(`Could not format file ${file.path}. Error:`, error);
        return file;
      }
    }),
  );

  console.log(`Se generaron ${prettifiedFiles.length} archivos`);

  writeFileSync(
    "generated-files.json",
    JSON.stringify(prettifiedFiles, null, 2),
  );

  for (const file of prettifiedFiles) {
    // Asegurarse de que la ruta no empiece por '/'
    const filePath = file.path.replace(/^\/+/, "");

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `feat(${slug}): añadir ${filePath}`,
      content: Buffer.from(file.content).toString("base64"),
      branch: pr.head.ref
    });
  }

  console.log("Archivos añadidos/actualizados en la rama de la PR");
}

run().catch((err: Error) => {
  console.error(err);
  process.exit(1);
});
