import { google, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { generateText } from "ai";

export async function translatePromptToEnglish(text: string): Promise<string> {
  const { text: translated } = await generateText({
    model: google("gemini-2.5-flash"),
    messages: [
      {
        role: "user",
        content: `Traduce el siguiente texto del español al inglés, solo responde con la traducción y nada más:\n${text}`,
      },
    ],
    providerOptions: {  
      google: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      } satisfies GoogleGenerativeAIProviderOptions,
    },
  });
  
  return translated.trim();
}
