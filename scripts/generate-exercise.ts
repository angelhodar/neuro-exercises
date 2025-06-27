import "dotenv/config";

import { Octokit } from "@octokit/rest";
import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { format } from "prettier";
import { execSync } from "child_process";

const { GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER } = process.env;

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !PR_NUMBER) {
  console.error("Faltan variables de entorno");
  process.exit(1);
}

const [owner, repo] = GITHUB_REPOSITORY.split("/");
const prNumber = Number(PR_NUMBER);

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const generatedFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  action: z.enum(["create", "update", "delete"]).optional().default("create"),
  sha: z.string().optional(),
});

type GeneratedFile = z.infer<typeof generatedFileSchema>;

const includePaths = [
  "components/exercises/odd-one-out/**/*",
  "components/exercises/color-sequence/**/*",
  "components/exercises/exercise-execution-layout.tsx",
  "components/exercises/exercise-base-fields.tsx",
  "components/exercises/exercise-config-form.tsx",
  "app/registry/**/*",
  "app/dashboard/exercises/[slug]/page.tsx",
  "hooks/use-exercise-*",
];

const createPRCommentContext = (comment: string | null): string => {
  if (!comment) return "";

  return `
  Tu tarea se basará en hacer las modificaciones pertinentes en base a las siguientes instrucciones adicionales:
  
  <instrucciones-adicionales>
  ${comment}
  </instrucciones-adicionales>
  
  IMPORTANTE: Debes aplicar estas instrucciones adicionales sobre el código inicial, modificando, añadiendo o eliminando archivos según sea necesario.`;
};

const createExistingFilesContext = (existingFiles: GeneratedFile[]): string => {
  if (existingFiles.length === 0) return "";

  return `
  Los siguientes archivos ya han sido generados previamente para este ejercicio:
  
  <archivos-existentes>
  ${existingFiles
    .map(
      (file) => `
  <archivo>
  ${file.path}
  </archivo>

  <contenido> 
  ${file.content}
  </contenido>
  `,
    )
    .join("\n")}
  </archivos-existentes>
  
  Debes tener en cuenta estos archivos existentes y modificarlos según las nuevas instrucciones, o crear nuevos archivos si es necesario.`;
};

const createPrompt = (
  promptText: string,
  slug: string,
  lastComment: string | null,
  existingFiles: GeneratedFile[],
) => {
  const context = execSync(
    `npx repomix --include "${includePaths.join(",")}" --stdout`,
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  ).trim();

  const commentsSection = createPRCommentContext(lastComment);
  const existingFilesSection = createExistingFilesContext(existingFiles);

  return `
  Eres un asistente que genera archivos de un ejercicio neurocognitivo para una aplicación basada en Next.js siguiendo estrictamente las directrices descritas.
  
  Las directrices iniciales para el ejercicio son:

  <directrices-iniciales>
  ${promptText}
  </directrices-iniciales>

  ${commentsSection}

  ${existingFilesSection}
  
  Devuelve un array JSON donde cada elemento tiene:
  
  - path: ruta relativa (ej. components/mi-ejercicio.tsx)
  - content: el código completo del archivo, debe ser sintácticamente correcto y estar bien formateado, con saltos de línea entre sentencias (interfaces, funciones, constantes, etc.), como lo haría un desarrollador humano. No concatenes todo el código en una sola línea
  - action: "create", "update" o "delete" (indica si es un archivo nuevo, una actualización o debe eliminarse)

  Dispones de los siguientes componentes de shadcn/ui: 
  
  - accordion, 
  - alert-dialog, 
  - alert, 
  - avatar, 
  - badge, 
  - button, 
  - card, 
  - checkbox, 
  - collapsible, 
  - dialog, 
  - dropdown-menu, 
  - form, 
  - input, 
  - label, 
  - select, 
  - separator, 
  - sheet,
  - popover
  - slider,
  - switch, 
  - tabs, 
  - table, 
  - textarea, 
  - toast
  - tooltip

  Aquí tienes ejemplos de cómo debe ser el código con otros ejercicios ya completados. Fíjate en las rutas de los archivos para que sepas dónde poner el tuyo. En este caso, el slug del ejercicio es ${slug}.

  <ejemplos>
  ${context}
  </ejemplos>
  `;
};

interface FoundFileContent {
  path: string;
  content: string;
  sha: string;
}

const getFileData = async (
  path: string,
  ref: string,
): Promise<FoundFileContent | null> => {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if ("content" in data && data.content && "sha" in data) {
      return {
        path,
        content: Buffer.from(data.content, "base64").toString("utf8"),
        sha: data.sha,
      };
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getExistingFiles = async (
  slug: string,
  ref: string,
): Promise<GeneratedFile[]> => {
  try {
    const searchPaths = [`components/exercises/${slug}`, `app/registry`];
    const existingFiles: GeneratedFile[] = [];

    for (const searchPath of searchPaths) {
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: searchPath,
          ref,
        });

        if (Array.isArray(data)) {
          for (const item of data) {
            if (
              item.type === "file" &&
              (item.name.includes(slug) || searchPath.includes("registry"))
            ) {
              const fileData = await getFileData(item.path, ref);

              if (fileData) {
                existingFiles.push({
                  path: item.path,
                  content: fileData.content,
                  action: "update",
                  sha: fileData.sha,
                });
              }
            }
          }
        }
      } catch (error) {
        // El directorio puede no existir, es normal en la primera ejecución
        continue;
      }
    }
    return existingFiles;
  } catch (error) {
    console.warn(`No se pudieron obtener archivos existentes: ${error}`);
    return [];
  }
};

function getPrMetadata(initialMessageBody: string) {
  const slugMatch = initialMessageBody.match(/Slug:\s*(.+)/);
  const slug = slugMatch ? slugMatch[1].trim() : null;

  if (!slug) throw new Error("No se encontró el slug en el cuerpo de la PR.");

  const promptMatch = initialMessageBody.match(/## Prompt\s*([\s\S]*)/);
  const prompt = promptMatch ? promptMatch[1].trim() : initialMessageBody;

  return { slug, prompt };
}

async function getLastPRComment(byAuthor: string): Promise<string | null> {
  const { data: comments } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: prNumber,
  });

  const comment = comments
    .filter(
      (comment) =>
        !!comment.body?.trim() &&
        !comment.body.startsWith("<!-- ") &&
        comment.user?.login === byAuthor &&
        !comment.user.login.toLowerCase().includes("bot"),
    )
    .map((comment) => comment.body)
    .at(-1);

  return comment || null;
}

async function main(): Promise<void> {
  const { data: pr } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  if (!pr.body) throw new Error("No se encontró el cuerpo de la PR.");
  if (!pr.user) throw new Error("No se encontró el usuario de la PR.");

  const { slug, prompt: initialPrompt } = getPrMetadata(pr.body!);

  const [existingFiles, lastComment] = await Promise.all([
    getExistingFiles(slug, pr.head.ref),
    getLastPRComment(pr.user.login),
  ]);

  if (existingFiles.length === 0) {
    console.log(`Generación inicial para: ${slug}`);
  } else if (lastComment) {
    console.log(`Modificación para: ${slug} (basado en el último comentario)`);
  } else {
    console.log("No hay nada que procesar.");
    return;
  }

  const prompt = createPrompt(initialPrompt, slug, lastComment, existingFiles);

  const { object: generatedFiles } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: z.array(generatedFileSchema),
    prompt,
  });

  const existingFilesByPath = new Map(existingFiles.map((f) => [f.path, f]));

  console.log(`Procesando ${generatedFiles.length} cambios en archivos...`);

  for (const file of generatedFiles) {
    const filePath = file.path.replace(/^\/+/, "");

    try {
      const { sha } = existingFilesByPath.get(filePath) || {};

      if (file.action === "delete") {
        if (!sha) {
          console.warn(`No se puso eliminar ${filePath}, omitiendo...`);
          continue;
        }

        await octokit.repos.deleteFile({
          owner,
          repo,
          path: filePath,
          message: `feat(${slug}): eliminar ${filePath}`,
          branch: pr.head.ref,
          sha,
        });

        console.log(`Archivo eliminado: ${filePath}`);
      } else {
        if (file.action === "update" && !sha) {
          console.warn(
            `No se encontró SHA para actualizar ${filePath}. Se creará como un archivo nuevo.`,
          );
        }

        const content = await format(file.content, { filepath: file.path });
        const action = sha ? "actualizar" : "añadir";

        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: filePath,
          message: `feat(${slug}): ${action} ${filePath}`,
          content: Buffer.from(content).toString("base64"),
          branch: pr.head.ref,
          sha,
        });
        console.log(
          `Archivo ${action === "actualizar" ? "actualizado" : "creado"}: ${filePath}`,
        );
      }
    } catch (error) {
      console.error(`Error procesando el archivo ${filePath}:`, error);
    }
  }

  console.log("Proceso completado.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
