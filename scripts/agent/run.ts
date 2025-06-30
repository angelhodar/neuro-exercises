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

  if (!pr.body || !pr.user) throw new Error("Error en los datos de la PR");

  const { slug, prompt: initialPrompt } = getPrMetadata(pr.body!);

  console.log(`Procesando ejercicio: ${slug}`);

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
      console.log(data.stepType)
      console.log(data.text)
    },
  });

  console.log("Resultado:", result);
  console.log("Proceso completado");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
