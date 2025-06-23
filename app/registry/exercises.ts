import type { ComponentType } from "react";
import { z, type ZodTypeAny } from "zod";

import { VisualRecognitionExercise } from "@/components/exercises/visual-recognition/visual-recognition-exercise";
import { VisualRecognitionConfigFields } from "@/components/exercises/visual-recognition/visual-recognition-config-form";
import { VisualRecognitionResults } from "@/components/exercises/visual-recognition/visual-recognition-results";
import {
  visualRecognitionConfigSchema,
  visualRecognitionPresets,
} from "@/components/exercises/visual-recognition/visual-recognition-schema";

import { SyllablesExercise } from "@/components/exercises/syllables/syllables-exercise";
import { SyllablesConfigFields } from "@/components/exercises/syllables/syllables-config-form";
import {
  syllablesConfigSchema,
  syllablesPresets,
} from "@/components/exercises/syllables/syllables-schema";
import { SyllablesResults } from "@/components/exercises/syllables/syllables-results";

import { ReactionTimeGrid } from "@/components/exercises/reaction-time-grid/reaction-time-grid";
import { ReactionTimeConfigFields } from "@/components/exercises/reaction-time-grid/reaction-time-config-form";
import {
  reactionTimeGridConfigSchema,
  reactionTimePresets,
} from "@/components/exercises/reaction-time-grid/reaction-time-grid-schema";
import { ExerciseResults as ReactionTimeGridResults } from "@/components/exercises/reaction-time-grid/exercise-results";

import { ColorSequenceExercise } from "@/components/exercises/color-sequence/color-sequence-exercise";
import { ColorSequenceConfigFields } from "@/components/exercises/color-sequence/color-sequence-config-form";
import {
  colorSequenceConfigSchema,
  colorSequencePresets,
} from "@/components/exercises/color-sequence/color-sequence-schema";
import { ColorSequenceResults } from "@/components/exercises/color-sequence/color-sequence-results";

import { StimulusCountConfigFields } from "@/components/exercises/stimulus-count/stimulus-count-config-form";
import {
  stimulusCountConfigSchema,
  stimulusCountPresets,
} from "@/components/exercises/stimulus-count/stimulus-count-schema";
import { StimulusCountExercise } from "@/components/exercises/stimulus-count/stimulus-count-exercise";
import { StimulusCountResults } from "@/components/exercises/stimulus-count/stimulus-count-results";

import { OddOneOutExercise } from "@/components/exercises/odd-one-out/odd-one-out-exercise";
import { OddOneOutConfigFields } from "@/components/exercises/odd-one-out/odd-one-out-config-form";
import { OddOneOutResults } from "@/components/exercises/odd-one-out/odd-one-out-results";
import {
  oddOneOutConfigSchema,
  defaultOddOneOutConfig,
} from "@/components/exercises/odd-one-out/odd-one-out-schema";


export type AnyExerciseEntry = {
  schema: ZodTypeAny;
  defaultConfig?: any;
  ConfigFieldsComponent: ComponentType<{ basePath?: string }>;
  ExerciseComponent: ComponentType<{ config: any }>;
  ResultsComponent: ComponentType<any>;
};

type TypedExerciseEntry<T extends ZodTypeAny> = {
  schema: T;
  defaultConfig: z.infer<T>;
  ConfigFieldsComponent: ComponentType<{ basePath?: string }>;
  ExerciseComponent: ComponentType<{ config: z.infer<T> }>;
  ResultsComponent: ComponentType<any>;
};

function createExerciseEntry<T extends ZodTypeAny>(
  entry: TypedExerciseEntry<T>
) {
  return entry;
}

export const exerciseRegistry = {
  "visual-recognition": createExerciseEntry({
    schema: visualRecognitionConfigSchema,
    defaultConfig: visualRecognitionPresets.easy,
    ConfigFieldsComponent: VisualRecognitionConfigFields,
    ExerciseComponent: VisualRecognitionExercise,
    ResultsComponent: VisualRecognitionResults,
  }),
  syllables: createExerciseEntry({
    schema: syllablesConfigSchema,
    defaultConfig: syllablesPresets.easy,
    ConfigFieldsComponent: SyllablesConfigFields,
    ExerciseComponent: SyllablesExercise,
    ResultsComponent: SyllablesResults,
  }),
  "reaction-grid": createExerciseEntry({
    schema: reactionTimeGridConfigSchema,
    defaultConfig: reactionTimePresets.easy,
    ConfigFieldsComponent: ReactionTimeConfigFields,
    ExerciseComponent: ReactionTimeGrid,
    ResultsComponent: ReactionTimeGridResults,
  }),
  "color-sequence": createExerciseEntry({
    schema: colorSequenceConfigSchema,
    defaultConfig: colorSequencePresets.easy,
    ConfigFieldsComponent: ColorSequenceConfigFields,
    ExerciseComponent: ColorSequenceExercise,
    ResultsComponent: ColorSequenceResults,
  }),
  "stimulus-count": createExerciseEntry({
    schema: stimulusCountConfigSchema,
    defaultConfig: stimulusCountPresets.easy,
    ConfigFieldsComponent: StimulusCountConfigFields,
    ExerciseComponent: StimulusCountExercise,
    ResultsComponent: StimulusCountResults,
  }),
  "odd-one-out": createExerciseEntry({
    schema: oddOneOutConfigSchema,
    defaultConfig: defaultOddOneOutConfig,
    ConfigFieldsComponent: OddOneOutConfigFields,
    ExerciseComponent: OddOneOutExercise,
    ResultsComponent: OddOneOutResults,
  }),
};

export function getExerciseFromRegistry(
  slug: string
): AnyExerciseEntry | undefined {
  return exerciseRegistry[slug as keyof typeof exerciseRegistry];
}
