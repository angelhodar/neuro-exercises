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

// Tool to get context from other exercises and components
export const getCodeContext = tool({
  description:
    "Gets context from other existing exercises, hooks and components to use as reference",
  parameters: z.object({}),
  execute: async () => {
    console.log("Getting context from other exercises and components");
    try {
      const context = execSync(
        `npx -y repomix --include "${includePaths.join(",")}" --stdout`,
        { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
      ).trim();

      return context;
    } catch (error) {
      console.error("Error getting context:", error);
      return "Could not get context from other exercises.";
    }
  },
});

// Tool to read existing files
export const readFiles = tool({
  description:
    "Reads existing files for a specific exercise from the repository. If files haven't been created yet, returns an empty array.",
  parameters: z.object({
    slug: z.string().describe("The exercise slug"),
    ref: z.string().describe("The branch reference (e.g. pr.head.ref)"),
  }),
  execute: async ({ slug, ref }) => {
    console.log("Reading existing files for exercise", slug, ref);
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
          // Directory might not exist, this is normal on first run
          continue;
        }
      }
      return existingFiles;
    } catch (error) {
      console.warn(`Could not get existing files: ${error}`);
      return [];
    }
  },
});

// Tool to write files to PR
export const writeFiles = tool({
  description: "Writes, updates or deletes files in the PR branch",
  parameters: z.object({
    files: z
      .array(generatedFileSchema)
      .describe("Array of files to process. Don't include files you don't need to update"),
    slug: z.string().describe("The exercise slug"),
    branch: z.string().describe("The branch where to write the files"),
  }),
  execute: async ({ files, slug, branch }) => {
    console.log(`Processing ${files.length} file changes...`);
    const results = [];

    for (const file of files.filter((file) => file.content)) {
      const filePath = file.path.replace(/^\/+/, "");

      try {
        if (file.action === "delete") {
          if (!file.sha) {
            console.warn(`Could not delete ${filePath}, missing SHA`);
            results.push({
              path: filePath,
              status: "error",
              message: "Missing SHA for deletion",
            });
            continue;
          }

          await octokit.repos.deleteFile({
            owner,
            repo,
            path: filePath,
            message: `feat(${slug}): delete ${filePath}`,
            branch,
            sha: file.sha,
          });

          console.log(`File deleted: ${filePath}`);
          results.push({ path: filePath, status: "deleted" });
        } else {
          const content = await format(file.content, { filepath: file.path });
          const action = file.sha ? "update" : "add";

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
            `File ${action === "update" ? "updated" : "created"}: ${filePath}`,
          );
          results.push({
            path: filePath,
            status: action === "update" ? "updated" : "created",
          });
        }
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
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

// Tool to get the latest user requirements
export const getLastRequirements = tool({
  description:
    "Gets the latest comment with requirements from the PR author",
  parameters: z.object({
    authorLogin: z.string().describe("The PR author's login"),
  }),
  execute: async ({ authorLogin }) => {
    console.log("Getting latest user requirements", authorLogin);
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
      "Follow the initial prompt guidelines to generate the exercise";

    return lastComment;
  },
});
