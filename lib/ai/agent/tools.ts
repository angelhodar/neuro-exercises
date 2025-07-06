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
      console.log("Context:")
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
    parameters: z.object({}),
    execute: async () => {
      console.log(`Reading existing files for generation ${codeBlobKey}`);

      if (!codeBlobKey) return [];

      const buffer = await fetch(codeBlobKey).then((res) => res.arrayBuffer());
      const files = await extractFiles(Buffer.from(buffer));

      console.log("Files read:")
      console.log(files.map((f) => f.path));

      return files;
    },
  });

export const writeFiles = tool({
  description: "Writes files to the blob storage",
  parameters: z.object({
    files: z
      .array(generatedFileSchema)
      .describe(
        "Array of files to write to the blob storage",
      ),
  }),
  execute: async ({ files }) => {
    console.log(`Processing ${files.length} file changes...`);

    console.log("Files to write:")
    console.log(files.map((f) => f.path));

    const zipBuffer = await createZipBuffer(files);

    const blobKey = await uploadBlob(
      `generations/${crypto.randomUUID()}.zip`,
      zipBuffer,
    );

    console.log("Blob key:")
    console.log(blobKey);

    return blobKey.pathname;
  },
});
