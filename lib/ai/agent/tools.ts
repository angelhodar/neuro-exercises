import { tool } from "ai";
import { z } from "zod";
import { updateExerciseGeneration } from "@/app/actions/generations";
import { uploadBlob } from "@/lib/storage";
import { createBlobUrl } from "@/lib/utils";
import { createZipBuffer, extractFiles } from "@/lib/zip";
import { generatedFileSchema, getFilesContext } from "./context";

export const getCodeContext = tool({
  description:
    "Gets context from other existing exercises, hooks and components to use as reference",
  inputSchema: z.object({}),
  execute: async () => {
    console.log("Getting context from other exercises and components");
    try {
      const context = await getFilesContext();
      console.log("Context:");
      console.log(context.map((c) => c.path));
      return context;
    } catch (error) {
      console.error("Error getting context:", error);
      return "Could not get context from other exercises.";
    }
  },
});

export const readFiles = (codeBlobKey: string | null) =>
  tool({
    description:
      "Reads existing files for a specific exercise from the repository. If files haven't been created yet, returns an empty array.",
    inputSchema: z.object({}),
    execute: async () => {
      console.log(`Reading existing files for generation ${codeBlobKey}`);

      if (!codeBlobKey) {
        return [];
      }

      const buffer = await fetch(createBlobUrl(codeBlobKey)).then((res) =>
        res.arrayBuffer()
      );
      const files = await extractFiles(Buffer.from(buffer));

      console.log("Files read:");
      console.log(files.map((f) => f.path));

      return files;
    },
  });

export const writeFiles = (
  generationId: number,
  previousCodeBlobKey: string | null = null
) =>
  tool({
    description: "Writes files to the blob storage",
    inputSchema: z.object({
      files: z
        .array(generatedFileSchema)
        .describe("Array of files to write to the blob storage"),
    }),
    execute: async ({ files }) => {
      console.log(`Processing ${files.length} file changes...`);

      console.log("Files to write:");
      console.log(files.map((f) => f.path));

      let filesToSave = files;

      if (previousCodeBlobKey) {
        const buffer = await fetch(createBlobUrl(previousCodeBlobKey)).then(
          (res) => res.arrayBuffer()
        );
        const previousFiles = await extractFiles(Buffer.from(buffer));

        const currentFilePaths = new Set(files.map((f) => f.path));
        const missingFiles = previousFiles.filter(
          (f) => !currentFilePaths.has(f.path)
        );

        filesToSave = [...files, ...missingFiles];
      }

      const zipBuffer = await createZipBuffer(filesToSave);

      const blobKey = await uploadBlob(
        `generations/${crypto.randomUUID()}.zip`,
        zipBuffer
      );

      console.log(`Generated blob key: ${blobKey.pathname}`);

      await updateExerciseGeneration(generationId, {
        codeBlobKey: blobKey.pathname,
      });

      return blobKey.pathname;
    },
  });
