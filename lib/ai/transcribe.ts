import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const TRAILING_PUNCTUATION_REGEX = /[.,;:!¿?]+$/g;

export async function transcribeWithGroq(file: File): Promise<string> {
  const transcription = await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3-turbo",
    language: "es",
  });
  // Elimina signos de puntuación finales
  return transcription.text.replace(TRAILING_PUNCTUATION_REGEX, "").trim();
}
