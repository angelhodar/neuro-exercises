import type { Sandbox } from "@vercel/sandbox";
import { tool } from "ai";
import { z } from "zod";
import { updateExerciseGeneration } from "@/app/actions/generations";
import { SANDBOX_PROJECT_DIR } from "@/lib/sandbox";
import { uploadBlob } from "@/lib/storage";
import { createBlobUrl } from "@/lib/utils";
import { createZipBuffer, extractFiles } from "@/lib/zip";

export const generatedFileSchema = z.object({
  content: z.string(),
  path: z.string(),
});

export type GeneratedFile = z.infer<typeof generatedFileSchema>;

function projectPath(path: string) {
  return `${SANDBOX_PROJECT_DIR}/${path}`;
}

async function readSandboxFile(
  sandbox: Sandbox,
  path: string
): Promise<GeneratedFile> {
  try {
    const buffer = await sandbox.readFileToBuffer({ path: projectPath(path) });

    if (!buffer) {
      return { content: "[Error: file not found or empty]", path };
    }

    return { content: buffer.toString("utf-8"), path };
  } catch (error) {
    console.error(`Error reading ${path}:`, error);
    return {
      content: `[Error: could not read file — ${error instanceof Error ? error.message : "unknown error"}]`,
      path,
    };
  }
}

function toSandboxFiles(files: GeneratedFile[]) {
  return files.map((file) => ({
    content: Buffer.from(file.content),
    path: projectPath(file.path),
  }));
}

/**
 * Writes previous generation files from blob storage into the sandbox.
 * Call this before creating tools so the agent can read them directly.
 */
export async function writePreviousGenToSandbox(
  sandbox: Sandbox,
  codeBlobKey: string | null
) {
  if (!codeBlobKey) {
    return;
  }

  const buffer = await fetch(createBlobUrl(codeBlobKey)).then((res) =>
    res.arrayBuffer()
  );
  const files = extractFiles(Buffer.from(buffer));

  if (files.length > 0) {
    await sandbox.writeFiles(toSandboxFiles(files));
    console.log(
      `Wrote ${files.length} previous gen files to sandbox:`,
      files.map((f) => f.path)
    );
  }
}

export function createAgentTools(
  sandbox: Sandbox,
  generationId: number,
  previousCodeBlobKey: string | null
) {
  return {
    listFiles: tool({
      description:
        "Lists files in a directory on the sandbox filesystem. Supports optional glob pattern filtering (e.g. '*.tsx', '*.schema.ts').",
      execute: async ({ directory, pattern }) => {
        console.log(
          `Listing files in ${directory}${pattern ? ` (pattern: ${pattern})` : ""}...`
        );

        const args = [directory, "-type", "f"];

        if (pattern) {
          args.push("-name", pattern);
        }

        args.push("-not", "-path", "*/node_modules/*");
        args.push("-not", "-path", "*/.next/*");

        const result = await sandbox.runCommand({
          args,
          cmd: "find",
          cwd: SANDBOX_PROJECT_DIR,
        });

        const stdout = await result.stdout();
        const files = stdout
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean);

        console.log(`Found ${files.length} files in ${directory}`);
        return files;
      },
      inputSchema: z.object({
        directory: z
          .string()
          .describe("Directory path to list files in (e.g. 'app/exercises')"),
        pattern: z
          .string()
          .optional()
          .describe(
            "Optional glob pattern to filter files (e.g. '*.tsx', '*.schema.ts')"
          ),
      }),
    }),
    readFiles: tool({
      description:
        "Reads files from the sandbox filesystem. Use this to read reference exercises, hooks, and the current exercise files.",
      execute: async ({ paths }) => {
        console.log(`Reading ${paths.length} files from sandbox...`);

        const results = await Promise.all(
          paths.map((path) => readSandboxFile(sandbox, path))
        );

        console.log(
          "Files read:",
          results.map((f) => f.path)
        );
        return results;
      },
      inputSchema: z.object({
        paths: z
          .array(z.string())
          .describe("File paths to read from the sandbox filesystem"),
      }),
    }),

    verifyFiles: tool({
      description:
        "Writes files to the sandbox and runs TypeScript type-checking and linting. Call this BEFORE writeFiles to catch errors early. If errors are returned, fix the code and call verifyFiles again.",
      execute: async ({ files, exerciseDir }) => {
        console.log(`Verifying ${files.length} files in ${exerciseDir}...`);
        await sandbox.writeFiles(toSandboxFiles(files));

        const errors: string[] = [];

        const tscResult = await sandbox.runCommand({
          args: ["run", "ts-check"],
          cmd: "npm",
          cwd: SANDBOX_PROJECT_DIR,
        });
        const tscOutput = await tscResult.stderr();

        if (tscOutput) {
          const relevantErrors = tscOutput
            .split("\n")
            .filter((line) => line.includes(exerciseDir))
            .join("\n");

          if (relevantErrors.trim()) {
            errors.push(`TypeScript errors:\n${relevantErrors}`);
          }
        }

        const lintResult = await sandbox.runCommand({
          args: ["run", "check", "--", exerciseDir],
          cmd: "npm",
          cwd: SANDBOX_PROJECT_DIR,
        });

        const lintOutput = await lintResult.stderr();

        if (lintResult.exitCode !== 0 && lintOutput) {
          errors.push(`Lint errors:\n${lintOutput}`);
        }

        if (errors.length > 0) {
          console.log(`Verification failed with ${errors.length} error(s)`);
          return { errors, success: false as const };
        }

        console.log("Verification passed");
        return { success: true as const };
      },
      inputSchema: z.object({
        exerciseDir: z
          .string()
          .describe(
            "The exercise directory path (e.g. 'app/exercises/my-exercise')"
          ),
        files: z
          .array(generatedFileSchema)
          .describe("Array of files to verify"),
      }),
    }),

    writeFiles: tool({
      description:
        "Persists files to blob storage and finalizes the generation. Only call this AFTER verifyFiles passes successfully. This is the last tool you should call.",
      execute: async ({ files }) => {
        console.log(`Persisting ${files.length} files to blob storage...`);
        console.log(
          "Files:",
          files.map((f) => f.path)
        );

        let filesToSave = files;

        if (previousCodeBlobKey) {
          const buffer = await fetch(createBlobUrl(previousCodeBlobKey)).then(
            (res) => res.arrayBuffer()
          );
          const previousFiles = extractFiles(Buffer.from(buffer));

          const currentFilePaths = new Set(files.map((f) => f.path));
          const missingFiles = previousFiles.filter(
            (f) => !currentFilePaths.has(f.path)
          );

          filesToSave = [...files, ...missingFiles];
        }

        const zipBuffer = createZipBuffer(filesToSave);

        const blobKey = await uploadBlob(
          `generations/${crypto.randomUUID()}.zip`,
          zipBuffer
        );

        console.log(`Generated blob key: ${blobKey.pathname}`);

        await updateExerciseGeneration(generationId, {
          codeBlobKey: blobKey.pathname,
        });

        await sandbox.writeFiles(toSandboxFiles(filesToSave));

        return blobKey.pathname;
      },
      inputSchema: z.object({
        files: z
          .array(generatedFileSchema)
          .describe("Array of files to write to blob storage"),
      }),
    }),
  };
}
