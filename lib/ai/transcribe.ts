import { gateway } from "@ai-sdk/gateway";
import { transcribe } from "ai";

const TRAILING_PUNCTUATION_REGEX = /[.,;:!¿?]+$/g;

export async function transcribeWithGateway(file: File): Promise<string> {
  const result = await transcribe({
    audio: new Uint8Array(await file.arrayBuffer()),
    model: gateway.transcriptionModel("google/gemini-3.5-transcribe"),
  });

  return result.text.replace(TRAILING_PUNCTUATION_REGEX, "").trim();
}
