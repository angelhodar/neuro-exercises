import { z } from "zod";
import { tool } from "ai";
import { format } from "prettier";
import { execSync } from "child_process";
import {
  octokit,
  owner,
  repo,
  prNumber,
  includePaths,
  generatedFileSchema,
  getFileData,
  type GeneratedFile,
} from "./context";

// Herramienta para obtener el contexto de otros ejercicios y componentes
export const getCodeContext = tool({
  description:
    "Obtiene el contexto de otros ejercicios, hooks y componentes existentes para usar como referencia",
  parameters: z.object({}),
  execute: async () => {
    console.log("Obteniendo contexto de otros ejercicios y componentes");
    try {
      const context = execSync(
        `npx -y repomix --include "${includePaths.join(",")}" --stdout`,
        { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
      ).trim();

      return context;
    } catch (error) {
      console.error("Error obteniendo contexto:", error);
      return "No se pudo obtener el contexto de otros ejercicios.";
    }
  },
});

// Herramienta para leer archivos existentes
export const readFiles = tool({
  description:
    "Lee los archivos existentes para un ejercicio específico desde el repositorio. Si todavía no se han creado los archivos, devuelve un array vacío.",
  parameters: z.object({
    slug: z.string().describe("El slug del ejercicio"),
    ref: z.string().describe("La referencia del branch (ej: pr.head.ref)"),
  }),
  execute: async ({ slug, ref }) => {
    console.log("Leyendo archivos existentes para el ejercicio", slug, ref);
    try {
      const searchPaths = [
        `components/exercises/${slug}`,
        `app/exercises/registry.tsx`,
      ];
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
              if (item.type !== "file") continue;

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
          else if (data.type === "file") {
            existingFiles.push({
              path: data.path,
              content: data.content,
              action: "update",
              sha: data.sha,
            });
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
  },
});

// Herramienta para escribir archivos al PR
export const writeFiles = tool({
  description: "Escribe, actualiza o elimina archivos en el branch del PR",
  parameters: z.object({
    files: z
      .array(generatedFileSchema)
      .describe("Array de archivos a procesar"),
    slug: z.string().describe("El slug del ejercicio"),
    branch: z.string().describe("El branch donde escribir los archivos"),
  }),
  execute: async ({ files, slug, branch }) => {
    console.log(`Procesando ${files.length} cambios en archivos...`);
    const results = [];

    for (const file of files) {
      const filePath = file.path.replace(/^\/+/, "");

      try {
        if (file.action === "delete") {
          if (!file.sha) {
            console.warn(`No se pudo eliminar ${filePath}, falta SHA`);
            results.push({
              path: filePath,
              status: "error",
              message: "SHA faltante para eliminación",
            });
            continue;
          }

          await octokit.repos.deleteFile({
            owner,
            repo,
            path: filePath,
            message: `feat(${slug}): eliminar ${filePath}`,
            branch,
            sha: file.sha,
          });

          console.log(`Archivo eliminado: ${filePath}`);
          results.push({ path: filePath, status: "deleted" });
        } else {
          const content = await format(file.content, { filepath: file.path });
          const action = file.sha ? "actualizar" : "añadir";

          await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: filePath,
            message: `feat(${slug}): ${action} ${filePath}`,
            content: Buffer.from(content).toString("base64"),
            branch,
            sha: file.sha,
          });

          console.log(
            `Archivo ${action === "actualizar" ? "actualizado" : "creado"}: ${filePath}`,
          );
          results.push({
            path: filePath,
            status: action === "actualizar" ? "updated" : "created",
          });
        }
      } catch (error) {
        console.error(`Error procesando el archivo ${filePath}:`, error);
        results.push({
          path: filePath,
          status: "error",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  },
});

// Herramienta para obtener los últimos requerimientos del usuario
export const getLastRequirements = tool({
  description:
    "Obtiene el último comentario con requerimientos del autor del PR",
  parameters: z.object({
    authorLogin: z.string().describe("El login del autor del PR"),
  }),
  execute: async ({ authorLogin }) => {
    console.log("Obteniendo últimos requerimientos del usuario", authorLogin);
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
          comment.user?.login === authorLogin &&
          !comment.user.login.toLowerCase().includes("bot"),
      )
      .map((comment) => comment.body)
      .at(-1);

    const lastComment =
      comment ||
      "Sigue las directrices iniciales del prompt para generar el ejercicio";

    return lastComment;
  },
});
