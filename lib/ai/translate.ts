import { generateText } from "ai";

export async function translatePromptToEnglish(text: string): Promise<string> {
  const { text: translated } = await generateText({
    messages: [
      {
        content: `Traduce el siguiente texto del español al inglés, solo responde con la traducción y nada más:\n${text}`,
        role: "user",
      },
    ],
    model: "google/gemini-3.8-flash",
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    },
  });

  return translated.trim();
}
