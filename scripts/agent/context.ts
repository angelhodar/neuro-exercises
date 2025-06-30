import "dotenv/config";

import { Octokit } from "@octokit/rest";
import { z } from "zod";

const { GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER } = process.env;

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !PR_NUMBER) {
  console.error("Faltan variables de entorno");
  process.exit(1);
}

export const [owner, repo] = GITHUB_REPOSITORY.split("/");
export const prNumber = Number(PR_NUMBER);
export const octokit = new Octokit({ auth: GITHUB_TOKEN });

export const generatedFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  action: z.enum(["create", "update", "delete"]).optional().default("create"),
  sha: z.string().optional(),
});

export type GeneratedFile = z.infer<typeof generatedFileSchema>;

export const includePaths = [
  "components/exercises/odd-one-out/**/*",
  "components/exercises/color-sequence/**/*",
  "app/exercises/[slug]/page.tsx",
  "hooks/use-exercise-*",
];

export interface FoundFileContent {
  path: string;
  content: string;
  sha: string;
}

export const getFileData = async (
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

function parseMetadata(content: string) {
  const metadataRegex = /<metadata>\s*([\s\S]*?)\s*<\/metadata>/;
  const match = content.match(metadataRegex);

  if (!match) {
    throw new Error(
      "No se encontraron tags <metadata> válidos en el cuerpo de la PR",
    );
  }

  const [, metadataContent] = match;

  try {
    const metadata = JSON.parse(metadataContent);
    const bodyContent = content.replace(metadataRegex, "").trim();

    return { metadata, body: bodyContent };
  } catch (error) {
    throw new Error(`Error parseando JSON de metadata: ${error}`);
  }
}

function parsePrompt(content: string) {
  const promptRegex = /<prompt>\s*([\s\S]*?)\s*<\/prompt>/;
  const match = content.match(promptRegex);

  if (!match) {
    throw new Error("No se encontraron tags <prompt> válidos en el cuerpo de la PR");
  }

  const [, promptContent] = match;
  return promptContent.trim();
}

export function getPrMetadata(initialMessageBody: string) {
  const { metadata } = parseMetadata(initialMessageBody);

  const slug = metadata.slug;
  
  if (!slug) throw new Error("No se encontró el slug en los metadata");

  const prompt = parsePrompt(initialMessageBody);

  return {
    slug: slug.toString(),
    prompt,
    displayName: metadata.displayName,
    tags: metadata.tags || [],
    description: metadata.description,
  };
}