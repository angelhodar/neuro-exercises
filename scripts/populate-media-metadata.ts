// This script will populate the name and description for media files
// that are missing this information, using Google's Gemini model.

import "dotenv/config";

import { z } from "zod";
import { db } from "@/lib/db";
import { medias } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { createBlobUrl } from "@/lib/utils";

// 1. Define the Zod schema for a single media item's metadata
const mediaMetadataSchema = z.object({
  name: z
    .string()
    .describe(
      "Un nombre corto y descriptivo de la entidad o entidades que se ven en la imagen."
    ),
  description: z
    .string()
    .describe(
      "Una descripción corta de una sola frase sobre la entidad o entidades que se ven en la imagen. Evita empezar utilizando palabras como 'Un' o 'Una'."
    ),
  tags: z
    .array(z.string())
    .max(5)
    .describe(
      "Una lista de máximo 5 etiquetas que clasifican la imagen (p. ej., 'animal', 'ropa', 'comida', 'felino', 'frutas'). Las etiquetas deberán ir de una mayor generalidad a una más específica. No añadas etiquetas que se encuentren en el nombre o en la descripción de la imagen."
    ),
});

// 2. Define the schema for the array of metadata
const mediaMetadataArraySchema = z.array(mediaMetadataSchema);

async function main() {
  console.log("🚀 Starting media metadata population script...");

  // 3. Find media without name or description
  const mediaToUpdate = await db.query.medias.findMany({
    orderBy: medias.id, // Ensure a consistent order
  });

  if (mediaToUpdate.length === 0) {
    console.log(
      "✅ No media to update. All items have names and descriptions."
    );
    return;
  }

  console.log(`🔍 Found ${mediaToUpdate.length} media items to update.`);

  // 4. Setup AI model
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      "Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable."
    );
  }

  const model = google("gemini-2.5-flash");

  // 5. Build the structured prompt with all images
  const imageContents = mediaToUpdate.map((media) => ({
    type: "image" as const,
    image: new URL(createBlobUrl(media.blobKey)),
  }));

  const promptMessages = [
    {
      role: "user" as const,
      content: [
        {
          type: "text" as const,
          text: `Analiza esta lista de imágenes para una app de ejercicios cognitivos. Utiliza palabras en castellano. Para cada imagen, genera metadatos. Responde con un array de objetos JSON, donde cada objeto corresponde a una imagen en el mismo orden en que fueron presentadas y contiene un 'name' corto y descriptivo, una 'description' de una frase y una lista de 'tags' (máximo 5) que la clasifiquen.`,
        },
        ...imageContents,
      ],
    },
  ];

  try {
    console.log(
      `\n🤖 Sending ${mediaToUpdate.length} images to the AI model...`
    );

    // 6. Generate object with the array schema
    const { object: generatedMetadata } = await generateObject({
      model,
      schema: mediaMetadataArraySchema,
      messages: promptMessages,
    });

    if (generatedMetadata.length !== mediaToUpdate.length) {
      throw new Error(
        `AI returned ${generatedMetadata.length} items, but ${mediaToUpdate.length} were expected.`
      );
    }

    console.log(
      `🤖 AI Generated metadata for ${generatedMetadata.length} items.`
    );

    // 7. Update the database in a batch
    const updatePromises = mediaToUpdate.map((media, index) => {
      const metadata = generatedMetadata[index];
      return db
        .update(medias)
        .set({
          name:
            metadata.name.charAt(0).toUpperCase() +
            metadata.name.slice(1).toLowerCase(),
          description: metadata.description,
          tags: metadata.tags.map((tag) => tag.toLowerCase()),
        })
        .where(eq(medias.id, media.id));
    });

    await Promise.all(updatePromises);

    console.log(
      `\n✅ Successfully updated ${generatedMetadata.length} media items in the database.`
    );
  } catch (error) {
    console.error(`❌ Failed to process the batch of media items.`, error);
  }

  console.log("\n✨ Script finished!");
}

main().catch((error) => {
  console.error("An unexpected error occurred:", error);
  process.exit(1);
});
