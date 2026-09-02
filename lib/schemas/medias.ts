import { z } from "zod";

export const selectableMediaSchema = z.object({
  blobKey: z.string(),
  id: z.number(),
  metadata: z.unknown().nullable(),
  mimeType: z.string(),
  name: z.string(),
  tags: z.array(z.string()).nullable(),
  thumbnailKey: z.string().nullable(),
});

export type SelectableMediaSchema = z.infer<typeof selectableMediaSchema>;

export const createManualMediaSchema = z.object({
  description: z.string().min(1, "La descripción es obligatoria"),
  fileKey: z.string().min(1, "El archivo es obligatorio"),
  mimeType: z.string().min(1, "El tipo de archivo es obligatorio"),
  name: z.string().min(1, "El nombre es obligatorio"),
  tags: z.array(z.string()).min(1, "Escribe al menos una etiqueta"),
  thumbnailKey: z.string().optional(),
});

export const mediaMetadataSchema = z.object({
  description: z
    .string()
    .describe(
      "Una descripción corta de una sola frase sobre la entidad o entidades que se ven en la imagen. Evita empezar utilizando palabras como 'Un' o 'Una'."
    ),
  name: z
    .string()
    .describe(
      "Un nombre corto y descriptivo de la entidad o entidades que se ven en la imagen."
    ),
  tags: z
    .array(z.string())
    .max(5)
    .describe(
      "Una lista de máximo 5 etiquetas que clasifican la imagen (p. ej., 'animal', 'ropa', 'comida', 'felino', 'frutas'). Las etiquetas deberán ir de una mayor generalidad a una más específica. No añadas etiquetas que se encuentren en el nombre o en la descripción de la imagen."
    ),
});

export type CreateManualMediaSchema = z.infer<typeof createManualMediaSchema>;
export type MediaMetadataSchema = z.infer<typeof mediaMetadataSchema>;
