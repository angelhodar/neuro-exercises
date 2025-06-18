import { z } from "zod"
import { baseExerciseConfigSchema, type ExercisePreset } from "@/lib/schemas/base-schemas"

export const categoryDisplayNames: Record<string, string> = {
  animals: "Animales",
  clothing: "Ropa",
  flowers: "Flores",
  food: "Comida",
  furniture: "Muebles",
  household_objects: "Objetos del hogar",
  musical_instruments: "Instrumentos musicales",
  sports_equipment: "Material deportivo",
  tools: "Herramientas",
  vehicles: "Vehículos",
};

export type ImageCategory = keyof typeof categoryDisplayNames;

export type ImageData = {
  id: string
  name: string
  url: string
  category: ImageCategory
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
  categories: z
    .array(z.enum(Object.keys(categoryDisplayNames) as [string, ...string[]]))
    .min(2, "Selecciona al menos 2 categorías"),
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

  const distractorCategoriesCount = data.categories.length - 1 // Exclude target category

  if (distractorCategoriesCount === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Se necesitan al menos 2 categorías para generar imágenes distractoras",
      path: ["categories"],
    })
  }
}

// Complete visual recognition configuration schema
export const visualRecognitionConfigSchema = baseExerciseConfigSchema
  .merge(visualRecognitionSpecificConfigSchema)
  .superRefine(visualRecognitionConfigRefinements)

// Question result schema
export const visualRecognitionQuestionResultSchema = z.object({
  targetCategory: z.string(),
  correctImages: z.array(z.string()), // Image IDs
  selectedImages: z.array(z.string()), // Image IDs
  timeSpent: z.number().min(0),
  timeExpired: z.boolean(),
})

// Exercise results schema
export const visualRecognitionExerciseResultsSchema = z.object({
  results: z.array(visualRecognitionQuestionResultSchema),
  config: visualRecognitionConfigSchema,
  completedAt: z.date(),
  totalCorrect: z.number().int().min(0),
  totalQuestions: z.number().int().min(0),
  accuracy: z.number().min(0).max(100),
  averageTimeSpent: z.number().min(0),
})

// Inferred types
export type VisualRecognitionSpecificConfig = z.infer<typeof visualRecognitionSpecificConfigSchema>
export type VisualRecognitionConfig = z.infer<typeof visualRecognitionConfigSchema>
export type VisualRecognitionQuestionResult = z.infer<typeof visualRecognitionQuestionResultSchema>
export type VisualRecognitionExerciseResults = z.infer<typeof visualRecognitionExerciseResultsSchema>

// Default configuration
export const defaultVisualRecognitionConfig: VisualRecognitionConfig = {
  imagesPerQuestion: 6,
  correctImagesCount: 2,
  categories: ["animals", "food"],
  timeLimitPerQuestion: 20,
  showImageNames: true,
  totalQuestions: 10,
}

// Preset configurations
export const visualRecognitionPresets: Record<ExercisePreset, VisualRecognitionConfig> = {
  easy: {
    imagesPerQuestion: 4,
    correctImagesCount: 2,
    timeLimitPerQuestion: 20,
    categories: ["animals", "food"],
    showImageNames: true,
    totalQuestions: 5,
  },
  medium: {
    imagesPerQuestion: 6,
    correctImagesCount: 2,
    timeLimitPerQuestion: 10,
    categories: ["animals", "food", "vehicles"],
    showImageNames: true,
    totalQuestions: 10,
  },
  hard: {
    imagesPerQuestion: 8,
    correctImagesCount: 3,
    timeLimitPerQuestion: 5,
    categories: ["animals", "food", "vehicles", "furniture"],
    showImageNames: false,
    totalQuestions: 15,
  },
  expert: {
    imagesPerQuestion: 10,
    correctImagesCount: 4,
    timeLimitPerQuestion: 2,
    categories: ["animals", "food", "vehicles", "furniture"],
    showImageNames: false,
    totalQuestions: 20,
  },
}
