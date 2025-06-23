import type { ComponentType } from "react";
import { type ZodTypeAny } from "zod";

import { VisualRecognitionExercise } from "@/components/exercises/visual-recognition/visual-recognition-exercise";
import { VisualRecognitionResults } from "@/components/exercises/visual-recognition/visual-recognition-results";
import {
  visualRecognitionConfigSchema,
} from "@/components/exercises/visual-recognition/visual-recognition-schema";

import { SyllablesExercise } from "@/components/exercises/syllables/syllables-exercise";
import { SyllablesResults } from "@/components/exercises/syllables/syllables-results";
import { syllablesConfigSchema } from "@/components/exercises/syllables/syllables-schema";

import { ReactionTimeGrid } from "@/components/exercises/reaction-time-grid/reaction-time-grid";
import { ExerciseResults as ReactionTimeGridResults } from "@/components/exercises/reaction-time-grid/exercise-results";
import { reactionTimeGridConfigSchema } from "@/components/exercises/reaction-time-grid/reaction-time-grid-schema";

import { ColorSequenceExercise } from "@/components/exercises/color-sequence/color-sequence-exercise";
import { ColorSequenceResults } from "@/components/exercises/color-sequence/color-sequence-results";
import { colorSequenceConfigSchema } from "@/components/exercises/color-sequence/color-sequence-schema";

import { StimulusCountExercise } from "@/components/exercises/stimulus-count/stimulus-count-exercise";
import { StimulusCountResults } from "@/components/exercises/stimulus-count/stimulus-count-results";
import { stimulusCountConfigSchema } from "@/components/exercises/stimulus-count/stimulus-count-schema";

import { OddOneOutExercise } from "@/components/exercises/odd-one-out/odd-one-out-exercise";
import { OddOneOutResults } from "@/components/exercises/odd-one-out/odd-one-out-results";
import { oddOneOutConfigSchema } from "@/components/exercises/odd-one-out/odd-one-out-schema";

export type ServerExerciseEntry = {
  schema: ZodTypeAny;
  ExerciseComponent: ComponentType<{ config: any }>;
  ResultsComponent: ComponentType<any>;
};

function createEntry(entry: ServerExerciseEntry) {
  return entry;
}

export const exerciseRegistryServer = {
  "visual-recognition": createEntry({
    schema: visualRecognitionConfigSchema,
    ExerciseComponent: VisualRecognitionExercise,
    ResultsComponent: VisualRecognitionResults,
  }),
  syllables: createEntry({
    schema: syllablesConfigSchema,
    ExerciseComponent: SyllablesExercise,
    ResultsComponent: SyllablesResults,
  }),
  "reaction-grid": createEntry({
    schema: reactionTimeGridConfigSchema,
    ExerciseComponent: ReactionTimeGrid,
    ResultsComponent: ReactionTimeGridResults,
  }),
  "color-sequence": createEntry({
    schema: colorSequenceConfigSchema,
    ExerciseComponent: ColorSequenceExercise,
    ResultsComponent: ColorSequenceResults,
  }),
  "stimulus-count": createEntry({
    schema: stimulusCountConfigSchema,
    ExerciseComponent: StimulusCountExercise,
    ResultsComponent: StimulusCountResults,
  }),
  "odd-one-out": createEntry({
    schema: oddOneOutConfigSchema,
    ExerciseComponent: OddOneOutExercise,
    ResultsComponent: OddOneOutResults,
  }),
};

export function getExerciseFromServerRegistry(slug: string): ServerExerciseEntry | undefined {
  return exerciseRegistryServer[slug as keyof typeof exerciseRegistryServer];
} 