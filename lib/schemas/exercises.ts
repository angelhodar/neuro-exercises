import { z } from "zod";

export const createExerciseSchema = z.object({
  prompt: z.string().min(1, "El prompt es obligatorio"),
});

// Schema para editar ejercicios existentes
export const updateExerciseSchema = z.object({
  id: z.number(),
  displayName: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  tags: z.array(z.string()).min(1, "Debe tener al menos un tag"),
  thumbnailPrompt: z.string().optional(),
  file: z.instanceof(File).optional(),
  audioPrompt: z.string().optional(),
});

// Schema para la respuesta generada por AI
export const generatedExerciseSchema = z.object({
  slug: z.string().describe("Identificador único en formato kebab-case, descriptivo y claro (ej: 'visual-memory-sequence', 'attention-numbers'). Solo letras minúsculas, números y guiones."),
  displayName: z.string().describe("Nombre atractivo y profesional del ejercicio que será visible para los usuarios. Debe ser claro, conciso y motivador (ej: 'Memoria Visual - Secuencias', 'Atención Selectiva con Números')."),
  description: z.string().describe("Descripción profesional y detallada del ejercicio que explique claramente qué hace el usuario, qué habilidades cognitivas entrena y cómo funciona. Entre 50-150 palabras."),
  tags: z.array(z.string()).describe("Array de 3-5 etiquetas relevantes en inglés que categoricen el ejercicio. Usar términos como: 'memory', 'attention', 'cognitive', 'visual', 'spatial', 'sequence', 'numbers', 'colors', 'reaction-time', 'focus', 'working-memory', etc."),
  thumbnailPrompt: z.string().describe("Descripción visual concisa en inglés para generar la imagen thumbnail del ejercicio. Debe describir elementos visuales específicos que representen el ejercicio (ej: 'Colorful memory cards arranged in sequence', 'Numbers floating in space for attention exercise'). Máximo 20 palabras."),
  audioPrompt: z.string().describe("Descripción concisa en español para generar las instrucciones de audio del ejercicio. Debe explicar claramente qué debe hacer el usuario, cómo funciona el ejercicio y cualquier instrucción importante. Entre 50-100 palabras, en tono profesional pero amigable."),
});

export type CreateExerciseSchema = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseSchema = z.infer<typeof updateExerciseSchema>;
export type GeneratedExerciseSchema = z.infer<typeof generatedExerciseSchema>; 