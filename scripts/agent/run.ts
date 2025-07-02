import { generateText } from "ai";
import { vercel } from "@ai-sdk/vercel";
import { google } from "@ai-sdk/google";
import { octokit, owner, repo, prNumber, getPrMetadata } from "./context";
import { createMainPrompt, createSystemPrompt } from "./prompts";
import {
  getCodeContext,
  readFiles,
  writeFiles,
  getLastRequirements,
} from "./tools";

async function main(): Promise<void> {
  const { data: pr } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  if (!pr.body || !pr.user) throw new Error("Error in PR data");

  const { slug, prompt: initialPrompt } = getPrMetadata(pr.body!);

  console.log(`Processing exercise: ${slug}`);

  const prompt = createMainPrompt(initialPrompt, slug);
  const systemPrompt = createSystemPrompt(pr.user.login, slug, pr.head.ref);

  const { text: result } = await generateText({
    model: google("gemini-2.5-pro"),
    tools: {
      getCodeContext,
      readFiles,
      writeFiles,
      getLastRequirements,
    },
    prompt,
    system: systemPrompt,
    maxSteps: 10,
    onStepFinish: (data) => {
      console.log(data.text)
    },
  });

  console.log("Result:", result);
  console.log("Process completed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
