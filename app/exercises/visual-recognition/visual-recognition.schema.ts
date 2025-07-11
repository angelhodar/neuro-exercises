import { z } from "zod"
import { baseExerciseConfigSchema, type ExercisePreset } from "@/lib/schemas/base-schemas"

export type ImageData = {
  id: string
  name: string
  url: string
  tags: string[]
}

// Visual recognition specific configuration schema
export const visualRecognitionSpecificConfigSchema = z.object({
  imagesPerQuestion: z.coerce
    .number()
    .min(2, "Mínimo 2 imágenes por pregunta")
    .max(10, "Máximo 10 imágenes por pregunta")
    .int("El número de imágenes debe ser un número entero"),
  correctImagesCount: z.coerce
    .number()
    .min(1, "Mínimo 1 imagen correcta")
    .max(6, "Máximo 6 imágenes correctas")
    .int("El número de imágenes correctas debe ser un número entero"),
  tags: z
    .array(z.string())
    .min(2, "Selecciona al menos 2 etiquetas"),
  showImageNames: z.boolean(),
})

// Reusable refinement function for visual recognition configurations
export function visualRecognitionConfigRefinements(
  data: z.infer<typeof visualRecognitionSpecificConfigSchema>,
  ctx: z.RefinementCtx,
) {
  // Validate that correctImagesCount doesn't exceed imagesPerQuestion
  if (data.correctImagesCount >= data.imagesPerQuestion) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El número de imágenes correctas debe ser menor que el total de imágenes por pregunta",
      path: ["correctImagesCount"],
    })
  }

  const distractorTagsCount = data.tags.length - 1 // Exclude target tag

  if (distractorTagsCount === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Se necesitan al menos 2 etiquetas para generar imágenes distractoras",
      path: ["tags"],
    })
  }
}

// Complete visual recognition configuration schema - exported as configSchema
export const configSchema = baseExerciseConfigSchema
  .merge(visualRecognitionSpecificConfigSchema)
  .superRefine(visualRecognitionConfigRefinements)

// Question result schema - exported as resultSchema
export const resultSchema = z.object({
  targetTag: z.string(),
  correctImages: z.array(z.string()), // Image IDs
  selectedImages: z.array(z.string()), // Image IDs
  timeSpent: z.number().min(0),
  timeExpired: z.boolean(),
})

// Exercise results schema
export const visualRecognitionExerciseResultsSchema = z.object({
  results: z.array(resultSchema),
  config: configSchema,
  completedAt: z.date(),
  totalCorrect: z.number().int().min(0),
  totalQuestions: z.number().int().min(0),
  accuracy: z.number().min(0).max(100),
  averageTimeSpent: z.number().min(0),
})

// Inferred types
export type VisualRecognitionSpecificConfig = z.infer<typeof visualRecognitionSpecificConfigSchema>
export type VisualRecognitionConfig = z.infer<typeof configSchema>
export type VisualRecognitionQuestionResult = z.infer<typeof resultSchema>
export type VisualRecognitionExerciseResults = z.infer<typeof visualRecognitionExerciseResultsSchema>

// Default configuration
export const defaultVisualRecognitionConfig: VisualRecognitionConfig = {
  imagesPerQuestion: 6,
  correctImagesCount: 2,
  tags: ["animal", "comida"],
  timeLimitPerQuestion: 20,
  showImageNames: true,
  totalQuestions: 10,
}

// Preset configurations - exported as presets
export const presets: Record<ExercisePreset, VisualRecognitionConfig> = {
  easy: {
    imagesPerQuestion: 4,
    correctImagesCount: 2,
    timeLimitPerQuestion: 20,
    tags: ["animal", "comida"],
    showImageNames: true,
    totalQuestions: 5,
  },
  medium: {
    imagesPerQuestion: 6,
    correctImagesCount: 2,
    timeLimitPerQuestion: 10,
    tags: ["animal", "comida", "ropa"],
    showImageNames: true,
    totalQuestions: 10,
  },
  hard: {
    imagesPerQuestion: 8,
    correctImagesCount: 3,
    timeLimitPerQuestion: 5,
    tags: ["animal", "comida", "ropa"],
    showImageNames: false,
    totalQuestions: 15,
  },
  expert: {
    imagesPerQuestion: 10,
    correctImagesCount: 4,
    timeLimitPerQuestion: 2,
    tags: ["animal", "comida", "ropa", "mueble"],
    showImageNames: false,
    totalQuestions: 20,
  },
} 