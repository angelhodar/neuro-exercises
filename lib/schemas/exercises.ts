import { z } from "zod";

export const createExerciseSchema = z.object({
  slug: z.string().min(1, "El identificador es obligatorio"),
  displayName: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  prompt: z.string().optional(),
  thumbnail: z.instanceof(File).optional(),
  tags: z.array(z.string()).min(1, "Debe tener al menos una etiqueta"),
});

export type CreateExerciseSchema = z.infer<typeof createExerciseSchema>; 