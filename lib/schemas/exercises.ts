import { z } from "zod";

export const createExerciseSchema = z.object({
  slug: z.string().min(1, "El identificador es obligatorio"),
  displayName: z.string().min(1, "El nombre es obligatorio"),
  category: z.string().min(1, "La categoría es obligatoria"),
  description: z.string().optional(),
  prompt: z.string().optional(),
  thumbnail: z.instanceof(File).optional(),
});

export type CreateExerciseSchema = z.infer<typeof createExerciseSchema>; 