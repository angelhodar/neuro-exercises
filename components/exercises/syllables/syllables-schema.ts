import { z } from "zod"
import { baseExerciseConfigSchema, type ExercisePreset } from "@/lib/schemas/base-schemas"

// Extended Spanish words dataset with 20+ words per syllable count
export const spanishWordsDataset = {
  3: [
    { word: "cámara", syllables: ["cá", "ma", "ra"] },
    { word: "música", syllables: ["mú", "si", "ca"] },
    { word: "médico", syllables: ["mé", "di", "co"] },
    { word: "rápido", syllables: ["rá", "pi", "do"] },
    { word: "último", syllables: ["úl", "ti", "mo"] },
    { word: "número", syllables: ["nú", "me", "ro"] },
    { word: "público", syllables: ["pú", "bli", "co"] },
    { word: "básico", syllables: ["bá", "si", "co"] },
    { word: "clásico", syllables: ["clá", "si", "co"] },
    { word: "práctico", syllables: ["prác", "ti", "co"] },
    { word: "mágico", syllables: ["má", "gi", "co"] },
    { word: "típico", syllables: ["tí", "pi", "co"] },
    { word: "físico", syllables: ["fí", "si", "co"] },
    { word: "lógico", syllables: ["ló", "gi", "co"] },
    { word: "cómico", syllables: ["có", "mi", "co"] },
    { word: "único", syllables: ["ú", "ni", "co"] },
    { word: "técnico", syllables: ["téc", "ni", "co"] },
    { word: "crítico", syllables: ["crí", "ti", "co"] },
    { word: "artístico", syllables: ["ar", "tís", "ti", "co"] },
    { word: "plástico", syllables: ["plás", "ti", "co"] },
    { word: "fantástico", syllables: ["fan", "tás", "ti", "co"] },
    { word: "elástico", syllables: ["e", "lás", "ti", "co"] },
    { word: "doméstico", syllables: ["do", "més", "ti", "co"] },
    { word: "atlético", syllables: ["at", "lé", "ti", "co"] },
    { word: "estético", syllables: ["es", "té", "ti", "co"] },
  ],
  4: [
    { word: "teléfono", syllables: ["te", "lé", "fo", "no"] },
    { word: "biblioteca", syllables: ["bi", "blio", "te", "ca"] },
    { word: "matemática", syllables: ["ma", "te", "má", "ti", "ca"] },
    { word: "animales", syllables: ["a", "ni", "ma", "les"] },
    { word: "difíciles", syllables: ["di", "fí", "ci", "les"] },
    { word: "televisión", syllables: ["te", "le", "vi", "sión"] },
    { word: "computadora", syllables: ["com", "pu", "ta", "do", "ra"] },
    { word: "automóvil", syllables: ["au", "to", "mó", "vil"] },
    { word: "refrigerador", syllables: ["re", "fri", "ge", "ra", "dor"] },
    { word: "universidad", syllables: ["u", "ni", "ver", "si", "dad"] },
    { word: "democracia", syllables: ["de", "mo", "cra", "cia"] },
    { word: "tecnología", syllables: ["tec", "no", "lo", "gía"] },
    { word: "psicología", syllables: ["psi", "co", "lo", "gía"] },
    { word: "biología", syllables: ["bio", "lo", "gía"] },
    { word: "geografía", syllables: ["geo", "gra", "fía"] },
    { word: "filosofía", syllables: ["fi", "lo", "so", "fía"] },
    { word: "economía", syllables: ["e", "co", "no", "mía"] },
    { word: "astronomía", syllables: ["as", "tro", "no", "mía"] },
    { word: "gastronomía", syllables: ["gas", "tro", "no", "mía"] },
    { word: "fotografía", syllables: ["fo", "to", "gra", "fía"] },
    { word: "ortografía", syllables: ["or", "to", "gra", "fía"] },
    { word: "caligrafía", syllables: ["ca", "li", "gra", "fía"] },
    { word: "telegrafía", syllables: ["te", "le", "gra", "fía"] },
    { word: "topografía", syllables: ["to", "po", "gra", "fía"] },
    { word: "radiografía", syllables: ["ra", "dio", "gra", "fía"] },
  ],
  5: [
    { word: "responsabilidad", syllables: ["res", "pon", "sa", "bi", "li", "dad"] },
    { word: "oportunidad", syllables: ["o", "por", "tu", "ni", "dad"] },
    { word: "personalidad", syllables: ["per", "so", "na", "li", "dad"] },
    { word: "comunicación", syllables: ["co", "mu", "ni", "ca", "ción"] },
    { word: "organización", syllables: ["or", "ga", "ni", "za", "ción"] },
    { word: "administración", syllables: ["ad", "mi", "nis", "tra", "ción"] },
    { word: "participación", syllables: ["par", "ti", "ci", "pa", "ción"] },
    { word: "colaboración", syllables: ["co", "la", "bo", "ra", "ción"] },
    { word: "investigación", syllables: ["in", "ves", "ti", "ga", "ción"] },
    { word: "presentación", syllables: ["pre", "sen", "ta", "ción"] },
    { word: "representación", syllables: ["re", "pre", "sen", "ta", "ción"] },
    { word: "interpretación", syllables: ["in", "ter", "pre", "ta", "ción"] },
    { word: "concentración", syllables: ["con", "cen", "tra", "ción"] },
    { word: "demostración", syllables: ["de", "mos", "tra", "ción"] },
    { word: "manifestación", syllables: ["ma", "ni", "fes", "ta", "ción"] },
    { word: "transformación", syllables: ["trans", "for", "ma", "ción"] },
    { word: "información", syllables: ["in", "for", "ma", "ción"] },
    { word: "formación", syllables: ["for", "ma", "ción"] },
    { word: "educación", syllables: ["e", "du", "ca", "ción"] },
    { word: "civilización", syllables: ["ci", "vi", "li", "za", "ción"] },
    { word: "globalización", syllables: ["glo", "ba", "li", "za", "ción"] },
    { word: "especialización", syllables: ["es", "pe", "cia", "li", "za", "ción"] },
    { word: "modernización", syllables: ["mo", "der", "ni", "za", "ción"] },
    { word: "industrialización", syllables: ["in", "dus", "tria", "li", "za", "ción"] },
    { word: "comercialización", syllables: ["co", "mer", "cia", "li", "za", "ción"] },
  ],
  6: [
    { word: "extraordinario", syllables: ["ex", "tra", "or", "di", "na", "rio"] },
    { word: "característica", syllables: ["ca", "rac", "te", "rís", "ti", "ca"] },
    { word: "aproximadamente", syllables: ["a", "pro", "xi", "ma", "da", "men", "te"] },
    { word: "automáticamente", syllables: ["au", "to", "má", "ti", "ca", "men", "te"] },
    { word: "internacionalmente", syllables: ["in", "ter", "na", "cio", "nal", "men", "te"] },
    { word: "tradicionalmente", syllables: ["tra", "di", "cio", "nal", "men", "te"] },
    { word: "profesionalmente", syllables: ["pro", "fe", "sio", "nal", "men", "te"] },
    { word: "personalmente", syllables: ["per", "so", "nal", "men", "te"] },
    { word: "nacionalmente", syllables: ["na", "cio", "nal", "men", "te"] },
    { word: "regionalmente", syllables: ["re", "gio", "nal", "men", "te"] },
    { word: "emocionalmente", syllables: ["e", "mo", "cio", "nal", "men", "te"] },
    { word: "racionalmente", syllables: ["ra", "cio", "nal", "men", "te"] },
    { word: "funcionalmente", syllables: ["fun", "cio", "nal", "men", "te"] },
    { word: "ocasionalmente", syllables: ["o", "ca", "sio", "nal", "men", "te"] },
    { word: "excepcionalmente", syllables: ["ex", "cep", "cio", "nal", "men", "te"] },
    { word: "intencionalmente", syllables: ["in", "ten", "cio", "nal", "men", "te"] },
    { word: "condicionalmente", syllables: ["con", "di", "cio", "nal", "men", "te"] },
    { word: "proporcionalmente", syllables: ["pro", "por", "cio", "nal", "men", "te"] },
    { word: "constitucionalmente", syllables: ["cons", "ti", "tu", "cio", "nal", "men", "te"] },
    { word: "incondicionalmente", syllables: ["in", "con", "di", "cio", "nal", "men", "te"] },
    { word: "multidimensional", syllables: ["mul", "ti", "di", "men", "sio", "nal"] },
    { word: "interdisciplinario", syllables: ["in", "ter", "dis", "ci", "pli", "na", "rio"] },
    { word: "multifuncional", syllables: ["mul", "ti", "fun", "cio", "nal"] },
    { word: "internacional", syllables: ["in", "ter", "na", "cio", "nal"] },
    { word: "bidimensional", syllables: ["bi", "di", "men", "sio", "nal"] },
  ],
} as const

// Syllables specific configuration schema (in Spanish)
export const syllablesSpecificConfigSchema = z.object({
  syllablesCount: z.coerce
    .number()
    .min(3, "Mínimo 3 sílabas")
    .max(6, "Máximo 6 sílabas")
    .int("El número de sílabas debe ser un número entero")
})

// Reusable refinement function for syllables configurations
export function syllablesConfigRefinements(data: z.infer<typeof syllablesSpecificConfigSchema>, ctx: z.RefinementCtx) {
  // Validate that we have words available for the selected syllable count
  const availableWords = spanishWordsDataset[data.syllablesCount as keyof typeof spanishWordsDataset]
  if (!availableWords) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No hay palabras disponibles para ${data.syllablesCount} sílabas`,
      path: ["syllablesCount"],
    })
  }

  // Validate that we have enough words for the total questions
  if (availableWords && availableWords.length < 5) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No hay suficientes palabras disponibles para ${data.syllablesCount} sílabas (mínimo 5 necesarias)`,
      path: ["syllablesCount"],
    })
  }
}

// Complete syllables configuration schema
export const syllablesConfigSchema = baseExerciseConfigSchema
  .merge(syllablesSpecificConfigSchema)
  .superRefine(syllablesConfigRefinements)

// Updated question result schema - removed isCorrect and renamed reactionTime to timeSpent
export const syllablesQuestionResultSchema = z.object({
  targetWord: z.string(),
  targetSyllables: z.array(z.string()),
  selectedSyllables: z.array(z.string()),
  timeSpent: z.number().min(0),
  timeExpired: z.boolean(),
})

// Exercise results schema
export const syllablesExerciseResultsSchema = z.object({
  results: z.array(syllablesQuestionResultSchema),
  config: syllablesConfigSchema,
  completedAt: z.date(),
  totalCorrect: z.number().int().min(0),
  totalQuestions: z.number().int().min(0),
  accuracy: z.number().min(0).max(100),
  averageTimeSpent: z.number().min(0),
})

// Inferred types
export type SyllablesSpecificConfig = z.infer<typeof syllablesSpecificConfigSchema>
export type SyllablesConfig = z.infer<typeof syllablesConfigSchema>
export type SyllablesQuestionResult = z.infer<typeof syllablesQuestionResultSchema>
export type SyllablesExerciseResults = z.infer<typeof syllablesExerciseResultsSchema>
export type SpanishWord = {
  word: string
  syllables: string[]
}

// Default configuration
export const defaultSyllablesConfig: SyllablesConfig = {
  syllablesCount: 4,
  totalQuestions: 10,
}

// Preset configurations (in Spanish)
export const syllablesPresets: Record<ExercisePreset, SyllablesConfig> = {
  easy: {
    syllablesCount: 3,
    totalQuestions: 5,
  },
  medium: {
    syllablesCount: 4,
    totalQuestions: 10,
  },
  hard: {
    syllablesCount: 5,
    totalQuestions: 15,
  },
  expert: {
    syllablesCount: 6,
    totalQuestions: 20,
  },
}
