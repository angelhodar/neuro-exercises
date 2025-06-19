import type { ComponentType } from "react"
import { z, type ZodTypeAny } from "zod"

import { VisualRecognitionExercise } from "@/components/exercises/visual-recognition/visual-recognition-exercise"
import {
  VisualRecognitionConfigForm,
  VisualRecognitionConfigFields,
} from "@/components/exercises/visual-recognition/visual-recognition-config-form"
import {
  visualRecognitionConfigSchema,
  visualRecognitionPresets,
} from "@/components/exercises/visual-recognition/visual-recognition-schema"
import { VisualRecognitionResults } from "@/components/exercises/visual-recognition/visual-recognition-results"

import { SyllablesExercise } from "@/components/exercises/syllables/syllables-exercise"
import {
  SyllablesConfigForm,
  SyllablesConfigFields,
} from "@/components/exercises/syllables/syllables-config-form"
import { syllablesConfigSchema, syllablesPresets } from "@/components/exercises/syllables/syllables-schema"
import { SyllablesResults } from "@/components/exercises/syllables/syllables-results"

import { ReactionTimeGrid } from "@/components/exercises/reaction-time-grid/reaction-time-grid"
import {
  ReactionTimeConfigForm,
  ReactionTimeConfigFields,
} from "@/components/exercises/reaction-time-grid/reaction-time-config-form"
import {
  reactionTimeGridConfigSchema,
  reactionTimePresets,
} from "@/components/exercises/reaction-time-grid/reaction-time-grid-schema"
import { ExerciseResults as ReactionTimeGridResults } from "@/components/exercises/reaction-time-grid/exercise-results"

export type AnyExerciseEntry = {
  schema: ZodTypeAny
  defaultConfig?: any
  ConfigFormComponent: ComponentType<{ onSubmit?: (data: any) => void; initialValues?: any }>
  ConfigFieldsComponent: ComponentType<{ basePath?: string }>
  ExerciseComponent: ComponentType<{ config: any }>
  ResultsComponent: ComponentType<any>
}

type TypedExerciseEntry<T extends ZodTypeAny> = {
  schema: T
  defaultConfig: z.infer<T>
  ConfigFormComponent: ComponentType<{
    onSubmit?: (data: z.infer<T>) => void
    initialValues?: z.infer<T>
  }>
  ConfigFieldsComponent: ComponentType<{ basePath?: string }>
  ExerciseComponent: ComponentType<{ config: z.infer<T> }>
}

function createExerciseEntry<T extends ZodTypeAny>(entry: TypedExerciseEntry<T> & { ResultsComponent: ComponentType<any> }) {
  return entry
}

export const exerciseRegistry = {
  "visual-recognition": createExerciseEntry({
    schema: visualRecognitionConfigSchema,
    defaultConfig: visualRecognitionPresets.easy,
    ConfigFormComponent: VisualRecognitionConfigForm,
    ConfigFieldsComponent: VisualRecognitionConfigFields,
    ExerciseComponent: VisualRecognitionExercise,
    ResultsComponent: VisualRecognitionResults,
  }),
  syllables: createExerciseEntry({
    schema: syllablesConfigSchema,
    defaultConfig: syllablesPresets.easy,
    ConfigFormComponent: SyllablesConfigForm,
    ConfigFieldsComponent: SyllablesConfigFields,
    ExerciseComponent: SyllablesExercise,
    ResultsComponent: SyllablesResults,
  }),
  "reaction-grid": createExerciseEntry({
    schema: reactionTimeGridConfigSchema,
    defaultConfig: reactionTimePresets.easy,
    ConfigFormComponent: ReactionTimeConfigForm,
    ConfigFieldsComponent: ReactionTimeConfigFields,
    ExerciseComponent: ReactionTimeGrid,
    ResultsComponent: ReactionTimeGridResults,
  }),
}

export function getExerciseFromRegistry(slug: string): AnyExerciseEntry | undefined {
  return exerciseRegistry[slug as keyof typeof exerciseRegistry]
}