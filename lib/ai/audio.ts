export async function generateAudio(prompt: string): Promise<Buffer> {
  const response = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      "Cartesia-Version": "2024-06-10",
      "X-API-Key": process.env.CARTESIA_API_KEY || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: "sonic-2",
      transcript: prompt,
      voice: {
        mode: "id",
        id: "846fa30b-6e1a-49b9-b7df-6be47092a09a",
      },
      output_format: {
        container: "wav",
        encoding: "pcm_f32le",
        sample_rate: 44_100,
      },
      language: "es",
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Error en la API de Cartesia: ${response.status} ${response.statusText}`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}
