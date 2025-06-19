import { z } from "zod";

export const createMediaSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional(),
    prompt: z.string().optional(),
    category: z.string().min(1, "La categoría es obligatoria"),
    file: z.instanceof(File).optional(),
  })
  .refine((data) => data.prompt || data.file, {
    message: "Debes añadir un prompt o subir una imagen",
    path: ["prompt"],
  });

export type CreateMediaSchema = z.infer<typeof createMediaSchema>;
