import "dotenv/config";

import { Octokit } from "@octokit/rest";
import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { format } from "prettier";
import { execSync } from "child_process";

const includePaths = [
  "components/exercises/odd-one-out/**/*",
  "components/exercises/color-sequence/**/*",
  "components/exercises/exercise-execution-layout.tsx",
  "components/exercises/exercise-base-fields.tsx",
  "components/exercises/exercise-config-form.tsx",
  "app/registry/**/*",
  "app/dashboard/exercises/[slug]/page.tsx",
  "hooks/use-exercise-*"
];

interface PRComment {
  id: number;
  body: string;
  created_at: string;
  user: {
    login: string;
  };
}

interface GeneratedFile {
  path: string;
  content: string;
}

const createPRCommentsContext = (comments: PRComment[]): string => {
  if (comments.length === 0) {
    return "";
  }

  return `
  
  Además, se han añadido los siguientes comentarios/instrucciones adicionales en la PR (ordenados cronológicamente):
  
  <instrucciones-adicionales>
  ${comments.map((comment, index) => `
  ${index + 1}. [${comment.user.login} - ${new Date(comment.created_at).toLocaleString()}]:
  ${comment.body}
  `).join('\n')}
  </instrucciones-adicionales>
  
  IMPORTANTE: Debes aplicar estas instrucciones adicionales sobre el código inicial, modificando, añadiendo o eliminando archivos según sea necesario.`;
};

const createExistingFilesContext = (existingFiles: GeneratedFile[]): string => {
  if (existingFiles.length === 0) {
    return "";
  }

  return `
  
  Los siguientes archivos ya han sido generados previamente para este ejercicio:
  
  <archivos-existentes>
  ${existingFiles.map(file => `
  Archivo: ${file.path}
  Contenido:
  \`\`\`
  ${file.content}
  \`\`\`
  `).join('\n')}
  </archivos-existentes>
  
  Debes tener en cuenta estos archivos existentes y modificarlos según las nuevas instrucciones, o crear nuevos archivos si es necesario.`;
};

const createPrompt = (
  promptText: string, 
  slug: string, 
  comments: PRComment[], 
  existingFiles: GeneratedFile[]
) => {
  const context = execSync(
    `npx repomix --include "${includePaths.join(",")}" --stdout`,
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  ).trim();

  const commentsSection = createPRCommentsContext(comments);
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

const getExistingFiles = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  slug: string,
  ref: string
): Promise<GeneratedFile[]> => {
  try {
    // Buscar archivos que contengan el slug en rutas típicas de ejercicios
    const searchPaths = [
      `components/exercises/${slug}`,
      `app/registry`
    ];

    const existingFiles: GeneratedFile[] = [];

    for (const searchPath of searchPaths) {
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: searchPath,
          ref
        });

        if (Array.isArray(data)) {
          // Es un directorio, buscar archivos relacionados con el slug
          for (const item of data) {
            if (item.type === 'file' && (
              item.name.includes(slug) || 
              searchPath.includes('registry')
            )) {
              const fileContent = await getFileContent(octokit, owner, repo, item.path, ref);
              if (fileContent) {
                existingFiles.push({
                  path: item.path,
                  content: fileContent
                });
              }
            }
          }
        }
      } catch (error) {
        // El directorio no existe, continuar con el siguiente
        continue;
      }
    }

    return existingFiles;
  } catch (error) {
    console.warn(`No se pudieron obtener archivos existentes: ${error}`);
    return [];
  }
};

const getFileContent = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<string | null> => {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref
    });

    if ('content' in data && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf8');
    }
    return null;
  } catch (error) {
    return null;
  }
};

async function getFileSha(
  octokit: Octokit, 
  owner: string, 
  repo: string, 
  path: string, 
  ref: string
): Promise<string> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref
    });
    
    if ('sha' in data) {
      return data.sha;
    }
    throw new Error("File not found");
  } catch (error) {
    throw new Error(`Could not get SHA for file ${path}: ${error}`);
  }
}

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
  const slug = slugMatch ? slugMatch[1].trim() : null;

  if (!slug) {
    console.error("No se encontró el slug en el cuerpo de la PR");
    process.exit(1);
  }

  const promptMatch = pr.body.match(/## Prompt\s*([\s\S]*)/);
  const promptText = promptMatch ? promptMatch[1].trim() : pr.body;

  // Obtener comentarios de la PR
  const { data: comments } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: Number(PR_NUMBER),
  });

  // Filtrar comentarios relevantes (no del sistema)
  const relevantComments = comments.filter(comment => 
    comment.body && comment.body.trim() !== "" &&
    !comment.body.startsWith("<!-- ") // Ignorar comentarios de sistema
  );

  // Obtener archivos existentes del ejercicio desde la rama de la PR
  const existingFiles = await getExistingFiles(octokit, owner, repo, slug, pr.head.ref);

  // Determinar qué procesar según el estado
  let shouldProcess = false;
  let commentsToUse: PRComment[] = [];

  if (existingFiles.length === 0) {
    // Primera generación: usar prompt inicial
    shouldProcess = true;
    commentsToUse = [];
  } else if (relevantComments.length > 0) {
    // Modificación: usar solo el último comentario
    shouldProcess = true;
    commentsToUse = [relevantComments[relevantComments.length - 1] as PRComment];
  }

  if (!shouldProcess) {
    console.log("No hay nada que procesar");
    return;
  }

  console.log(`Procesando ejercicio: ${slug}`);
  console.log(`Tipo de operación: ${existingFiles.length === 0 ? 'Generación inicial' : 'Modificación'}`);
  console.log(`Archivos existentes: ${existingFiles.length}`);

  const prompt = createPrompt(promptText, slug, commentsToUse, existingFiles);

  const { object: generatedFiles } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: z.array(
      z.object({
        path: z.string(),
        content: z.string(),
        action: z.enum(["create", "update", "delete"]).optional().default("create"),
      }),
    ),
    prompt
  });

  const prettifiedFiles = await Promise.all(
    generatedFiles
      .filter(file => file.action !== "delete") // No formatear archivos que se van a eliminar
      .map(async (file) => {
        try {
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

  // Procesar archivos según su acción
  for (const file of generatedFiles) {
    const filePath = file.path.replace(/^\/+/, "");

    if (file.action === "delete") {
      try {
        await octokit.repos.deleteFile({
          owner,
          repo,
          path: filePath,
          message: `feat(${slug}): eliminar ${filePath}`,
          branch: pr.head.ref,
          sha: await getFileSha(octokit, owner, repo, filePath, pr.head.ref)
        });
        console.log(`Archivo eliminado: ${filePath}`);
      } catch (error) {
        console.warn(`No se pudo eliminar el archivo ${filePath}:`, error);
      }
    } else {
      // Crear o actualizar archivo
      const prettifiedFile = prettifiedFiles.find(pf => pf.path === file.path);
      if (prettifiedFile) {
        const action = file.action === "update" ? "actualizar" : "añadir";
        
        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: filePath,
          message: `feat(${slug}): ${action} ${filePath}`,
          content: Buffer.from(prettifiedFile.content).toString("base64"),
          branch: pr.head.ref
        });
        
        console.log(`Archivo ${action === "actualizar" ? "actualizado" : "creado"}: ${filePath}`);
      }
    }
  }

  console.log("Archivos añadidos/actualizados en la rama de la PR");
}

run().catch((err: Error) => {
  console.error(err);
  process.exit(1);
});