import { z } from "zod";

export const selectableMediaSchema = z.object({
  id: z.number(),
  name: z.string(),
  blobKey: z.string(),
  mimeType: z.string(),
  thumbnailKey: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  tags: z.array(z.string()).nullable()
});

export type SelectableMediaSchema = z.infer<typeof selectableMediaSchema>;

export const createMediaSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional(),
    prompt: z.string().optional(),
    tags: z.array(z.string()).min(1, "Debes seleccionar al menos una etiqueta"),
    file: z.instanceof(File).optional(),
    mediaType: z.enum(["image", "audio", "video"]).optional(),
  })
  .refine((data) => data.prompt || data.file, {
    message: "Debes añadir un prompt o subir un archivo",
    path: ["prompt"],
  });

export type CreateMediaSchema = z.infer<typeof createMediaSchema>;
