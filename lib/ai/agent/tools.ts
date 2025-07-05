import { z } from "zod";
import { tool } from "ai";
import { extractFiles, createZipBuffer } from "@/lib/zip";
import { generatedFileSchema, getFilesContext } from "./context";
import { uploadBlob } from "@/lib/storage";

export const getCurrentGeneratedFiles = tool({
  description:
    "Gets context from other existing exercises, hooks and components to use as reference",
  parameters: z.object({}),
  execute: async () => {
    console.log("Getting context from other exercises and components");
    try {
      const context = await getFilesContext();

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
    parameters: z.object({}),
    execute: async () => {
      console.log(`Reading existing files for generation ${codeBlobKey}`);

      if (!codeBlobKey) return [];

      const buffer = await fetch(codeBlobKey).then((res) => res.arrayBuffer());
      const files = await extractFiles(Buffer.from(buffer));

      return files;
    },
  });

export const writeFiles = tool({
  description: "Writes files to the blob storage",
  parameters: z.object({
    files: z
      .array(generatedFileSchema)
      .describe(
        "Array of files to process. Don't include files you don't need to update or files that needs to be removed",
      ),
  }),
  execute: async ({ files }) => {
    console.log(`Processing ${files.length} file changes...`);

    const zipBuffer = await createZipBuffer(files);

    const blobKey = await uploadBlob(
      `generations/${crypto.randomUUID()}.zip`,
      zipBuffer,
    );

    return blobKey;
  },
});
