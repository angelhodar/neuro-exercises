import { z } from "zod";

export const selectableMediaSchema = z.object({
  id: z.number(),
  name: z.string(),
  blobKey: z.string(),
  tags: z.array(z.string()).nullable(),
});

export type SelectableMediaSchema = z.infer<typeof selectableMediaSchema>;

export const createMediaSchema = z
  .object({
    prompt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional(),
    file: z.instanceof(File).optional(),
  })
  .refine((data) => data.prompt || data.file, {
    message: "Debes añadir un prompt o subir una imagen",
    path: ["prompt"],
  });

export const mediaMetadataSchema = z.object({
  name: z
    .string()
    .describe(
      "Un nombre corto y descriptivo de la entidad o entidades que se ven en la imagen.",
    ),
  description: z
    .string()
    .describe(
      "Una descripción corta de una sola frase sobre la entidad o entidades que se ven en la imagen. Evita empezar utilizando palabras como 'Un' o 'Una'.",
    ),
  tags: z
    .array(z.string())
    .max(5)
    .describe(
      "Una lista de máximo 5 etiquetas que clasifican la imagen (p. ej., 'animal', 'ropa', 'comida', 'felino', 'frutas'). Las etiquetas deberán ir de una mayor generalidad a una más específica. No añadas etiquetas que se encuentren en el nombre o en la descripción de la imagen.",
    ),
});

export type CreateMediaSchema = z.infer<typeof createMediaSchema>;
export type MediaMetadataSchema = z.infer<typeof mediaMetadataSchema>;
