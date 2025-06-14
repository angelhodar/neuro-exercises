import { z } from "zod"
import { baseExerciseConfigSchema, type ExercisePreset } from "@/schemas/base-schemas"

// Image categories with their respective images
export const imageCategories = {
  animales: [
    { id: "perro1", name: "Perro Golden", url: "/placeholder.svg?height=300&width=300" },
    { id: "gato1", name: "Gato Naranja", url: "/placeholder.svg?height=300&width=300" },
    { id: "pajaro1", name: "Águila", url: "/placeholder.svg?height=300&width=300" },
    { id: "pez1", name: "Pez Dorado", url: "/placeholder.svg?height=300&width=300" },
    { id: "caballo1", name: "Caballo Marrón", url: "/placeholder.svg?height=300&width=300" },
    { id: "conejo1", name: "Conejo Blanco", url: "/placeholder.svg?height=300&width=300" },
    { id: "leon1", name: "León", url: "/placeholder.svg?height=300&width=300" },
    { id: "elefante1", name: "Elefante", url: "/placeholder.svg?height=300&width=300" },
    { id: "mariposa1", name: "Mariposa", url: "/placeholder.svg?height=300&width=300" },
    { id: "rana1", name: "Rana Verde", url: "/placeholder.svg?height=300&width=300" },
  ],
  frutas: [
    { id: "manzana1", name: "Manzana Roja", url: "/placeholder.svg?height=300&width=300" },
    { id: "banana1", name: "Plátano", url: "/placeholder.svg?height=300&width=300" },
    { id: "naranja1", name: "Naranja", url: "/placeholder.svg?height=300&width=300" },
    { id: "uva1", name: "Uvas Moradas", url: "/placeholder.svg?height=300&width=300" },
    { id: "fresa1", name: "Fresa", url: "/placeholder.svg?height=300&width=300" },
    { id: "pina1", name: "Piña", url: "/placeholder.svg?height=300&width=300" },
    { id: "sandia1", name: "Sandía", url: "/placeholder.svg?height=300&width=300" },
    { id: "kiwi1", name: "Kiwi", url: "/placeholder.svg?height=300&width=300" },
    { id: "mango1", name: "Mango", url: "/placeholder.svg?height=300&width=300" },
    { id: "cereza1", name: "Cerezas", url: "/placeholder.svg?height=300&width=300" },
  ],
  vehiculos: [
    { id: "coche1", name: "Coche Rojo", url: "/placeholder.svg?height=300&width=300" },
    { id: "bicicleta1", name: "Bicicleta", url: "/placeholder.svg?height=300&width=300" },
    { id: "avion1", name: "Avión", url: "/placeholder.svg?height=300&width=300" },
    { id: "barco1", name: "Barco", url: "/placeholder.svg?height=300&width=300" },
    { id: "tren1", name: "Tren", url: "/placeholder.svg?height=300&width=300" },
    { id: "moto1", name: "Motocicleta", url: "/placeholder.svg?height=300&width=300" },
    { id: "camion1", name: "Camión", url: "/placeholder.svg?height=300&width=300" },
    { id: "autobus1", name: "Autobús", url: "/placeholder.svg?height=300&width=300" },
    { id: "helicoptero1", name: "Helicóptero", url: "/placeholder.svg?height=300&width=300" },
    { id: "submarino1", name: "Submarino", url: "/placeholder.svg?height=300&width=300" },
  ],
  objetos: [
    { id: "silla1", name: "Silla", url: "/placeholder.svg?height=300&width=300" },
    { id: "mesa1", name: "Mesa", url: "/placeholder.svg?height=300&width=300" },
    { id: "libro1", name: "Libro", url: "/placeholder.svg?height=300&width=300" },
    { id: "reloj1", name: "Reloj", url: "/placeholder.svg?height=300&width=300" },
    { id: "telefono1", name: "Teléfono", url: "/placeholder.svg?height=300&width=300" },
    { id: "lampara1", name: "Lámpara", url: "/placeholder.svg?height=300&width=300" },
    { id: "taza1", name: "Taza", url: "/placeholder.svg?height=300&width=300" },
    { id: "llave1", name: "Llave", url: "/placeholder.svg?height=300&width=300" },
    { id: "gafas1", name: "Gafas", url: "/placeholder.svg?height=300&width=300" },
    { id: "bolso1", name: "Bolso", url: "/placeholder.svg?height=300&width=300" },
  ],
} as const

export type ImageCategory = keyof typeof imageCategories
export type ImageData = {
  id: string
  name: string
  url: string
}

// Visual recognition specific configuration schema
export const visualRecognitionSpecificConfigSchema = z.object({
  imagesPerQuestion: z.coerce
    .number()
    .min(4, "Mínimo 4 imágenes por pregunta")
    .max(12, "Máximo 12 imágenes por pregunta")
    .int("El número de imágenes debe ser un número entero"),
  correctImagesCount: z.coerce
    .number()
    .min(1, "Mínimo 1 imagen correcta")
    .max(6, "Máximo 6 imágenes correctas")
    .int("El número de imágenes correctas debe ser un número entero"),
  timeLimit: z.coerce
    .number()
    .min(10, "Mínimo 10 segundos por pregunta")
    .max(180, "Máximo 180 segundos por pregunta")
    .int("El límite de tiempo debe ser un número entero"),
  categories: z
    .array(z.enum(["animales", "frutas", "vehiculos", "objetos"]))
    .min(2, "Selecciona al menos 2 categorías")
    .max(4, "Máximo 4 categorías"),
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

  // Validate that we have enough distractor images
  const distractorImagesNeeded = data.imagesPerQuestion - data.correctImagesCount
  const distractorCategoriesCount = data.categories.length - 1 // Exclude target category

  if (distractorCategoriesCount === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Se necesitan al menos 2 categorías para generar imágenes distractoras",
      path: ["categories"],
    })
  }

  // Check if we have enough images in each category
  data.categories.forEach((category) => {
    const categoryImages = imageCategories[category as ImageCategory]
    if (categoryImages.length < data.correctImagesCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `La categoría "${category}" no tiene suficientes imágenes (necesita ${data.correctImagesCount})`,
        path: ["categories"],
      })
    }
  })
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
  timeLimit: 30,
  categories: ["animales", "frutas"],
  showImageNames: true,
  totalQuestions: 10,
}

// Preset configurations
export const visualRecognitionPresets: Record<ExercisePreset, VisualRecognitionConfig> = {
  easy: {
    imagesPerQuestion: 4,
    correctImagesCount: 2,
    timeLimit: 45,
    categories: ["animales", "frutas"],
    showImageNames: true,
    totalQuestions: 5,
  },
  medium: {
    imagesPerQuestion: 6,
    correctImagesCount: 2,
    timeLimit: 30,
    categories: ["animales", "frutas", "vehiculos"],
    showImageNames: true,
    totalQuestions: 10,
  },
  hard: {
    imagesPerQuestion: 8,
    correctImagesCount: 3,
    timeLimit: 25,
    categories: ["animales", "frutas", "vehiculos", "objetos"],
    showImageNames: false,
    totalQuestions: 15,
  },
  expert: {
    imagesPerQuestion: 10,
    correctImagesCount: 4,
    timeLimit: 20,
    categories: ["animales", "frutas", "vehiculos", "objetos"],
    showImageNames: false,
    totalQuestions: 20,
  },
}
