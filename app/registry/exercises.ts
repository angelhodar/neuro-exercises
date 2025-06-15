import type { ComponentType } from "react"
import { z, type ZodTypeAny } from "zod"

import { VisualRecognitionExercise } from "@/components/visual-recognition/visual-recognition-exercise"
import { VisualRecognitionConfigForm } from "@/components/visual-recognition/visual-recognition-config-form"
import { visualRecognitionConfigSchema, visualRecognitionPresets } from "@/components/visual-recognition/visual-recognition-schema"

import { SyllablesExercise } from "@/components/syllables/syllables-exercise"
import { SyllablesConfigForm } from "@/components/syllables/syllables-config-form"
import { syllablesConfigSchema, syllablesPresets } from "@/components/syllables/syllables-schema"

import { ReactionTimeGrid } from "@/components/reaction-time-grid/reaction-time-grid"
import { ReactionTimeConfigForm } from "@/components/reaction-time-grid/reaction-time-config-form"
import { reactionTimeGridConfigSchema, reactionTimePresets } from "@/components/reaction-time-grid/reaction-time-grid-schema"

export type AnyExerciseEntry = {
  schema: ZodTypeAny
  defaultConfig?: any
  ConfigFormComponent: ComponentType<{ onSubmit: (data: any) => void; initialValues?: any }>
  ExerciseComponent: ComponentType<{ config: any }>
}

type TypedExerciseEntry<T extends ZodTypeAny> = {
  schema: T
  defaultConfig: z.infer<T>
  ConfigFormComponent: ComponentType<{
    onSubmit: (data: z.infer<T>) => void
    initialValues?: z.infer<T>
  }>
  ExerciseComponent: ComponentType<{ config: z.infer<T> }>
}

function createExerciseEntry<T extends ZodTypeAny>(
  entry: TypedExerciseEntry<T>
): TypedExerciseEntry<T> {
  return entry
}

export const exerciseRegistry = {
  "visual-recognition": createExerciseEntry({
    schema: visualRecognitionConfigSchema,
    defaultConfig: visualRecognitionPresets.easy,
    ConfigFormComponent: VisualRecognitionConfigForm,
    ExerciseComponent: VisualRecognitionExercise,
  }),
  syllables: createExerciseEntry({
    schema: syllablesConfigSchema,
    defaultConfig: syllablesPresets.easy,
    ConfigFormComponent: SyllablesConfigForm,
    ExerciseComponent: SyllablesExercise,
  }),
  "reaction-grid": createExerciseEntry({
    schema: reactionTimeGridConfigSchema,
    defaultConfig: reactionTimePresets.easy,
    ConfigFormComponent: ReactionTimeConfigForm,
    ExerciseComponent: ReactionTimeGrid,
  })
}

export function getExerciseFromRegistry(slug: string): AnyExerciseEntry | undefined {
  return exerciseRegistry[slug as keyof typeof exerciseRegistry]
}