import "dotenv/config";

import { Octokit } from "@octokit/rest";
import { z } from "zod";

const { GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env;

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY) {
  throw new Error("Missing environment variables");
}

export const [owner, repo] = GITHUB_REPOSITORY.split("/");
export const octokit = new Octokit({ auth: GITHUB_TOKEN });

export const generatedFileSchema = z.object({
  path: z.string(),
  content: z.string(),
});
 
export type GeneratedFile = z.infer<typeof generatedFileSchema>;

export interface FoundFileContent {
  path: string;
  content: string;
  sha: string;
}

export const contextPaths = [
  "app/exercises/odd-one-out",
  "app/exercises/color-sequence",
  "app/exercises/[slug]/page.tsx",
  "app/exercises/registry.tsx",
  "hooks/use-exercise-execution.ts"
];

export const getFilesContext = async (): Promise<GeneratedFile[]> => {
  try {
    const { data: treeData } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: "feat/exercise-chat-editor",
      recursive: "true",
    });

    const matchedFiles = treeData.tree.filter(item => {
      if (item.type !== 'blob' || !item.path) return false;
      return contextPaths.some(prefix => item.path!.startsWith(prefix));
    });

    const fileContents = await Promise.all(
      matchedFiles.map(async (item) => {
        if (!item.sha || !item.path) return null;
        
        try {
          const { data: blobData } = await octokit.git.getBlob({
            owner,
            repo,
            file_sha: item.sha,
          });

          return {
            path: item.path,
            content: Buffer.from(blobData.content, blobData.encoding as BufferEncoding).toString('utf8'),
          };
        } catch (error) {
          console.error(`Error fetching blob for ${item.path}:`, error);
          return null;
        }
      })
    );

    return fileContents.filter((file): file is GeneratedFile => file !== null);
  } catch (error) {
    console.error('Error fetching files context:', error);
    return [];
  }
};