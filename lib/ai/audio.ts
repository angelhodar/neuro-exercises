export async function generateAudio(prompt: string): Promise<Buffer> {
  const response = await fetch("https://api.cartesia.ai/tts/bytes", {
    body: JSON.stringify({
      language: "es",
      model_id: "sonic-2",
      output_format: {
        container: "wav",
        encoding: "pcm_f32le",
        sample_rate: 44_100,
      },
      transcript: prompt,
      voice: {
        id: "846fa30b-6e1a-49b9-b7df-6be47092a09a",
        mode: "id",
      },
    }),
    headers: {
      "Cartesia-Version": "2024-06-10",
      "Content-Type": "application/json",
      "X-API-Key": process.env.CARTESIA_API_KEY || "",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Error en la API de Cartesia: ${response.status} ${response.statusText}`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}
