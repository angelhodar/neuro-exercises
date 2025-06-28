import type { ComponentType } from "react";
import type { ZodTypeAny } from "zod";
import dynamic from "next/dynamic";

// Schemas - importaciones estáticas
import {
  visualRecognitionConfigSchema,
  visualRecognitionPresets,
} from "@/components/exercises/visual-recognition/visual-recognition-schema";
import {
  syllablesConfigSchema,
  syllablesPresets,
} from "@/components/exercises/syllables/syllables-schema";
import {
  reactionTimeGridConfigSchema,
  reactionTimePresets,
} from "@/components/exercises/reaction-time-grid/reaction-time-grid-schema";
import {
  colorSequenceConfigSchema,
  colorSequencePresets,
} from "@/components/exercises/color-sequence/color-sequence-schema";
import {
  stimulusCountConfigSchema,
  stimulusCountPresets,
} from "@/components/exercises/stimulus-count/stimulus-count-schema";
import {
  oddOneOutConfigSchema,
  oddOneOutPresets,
} from "@/components/exercises/odd-one-out/odd-one-out-schema";

// Componentes dinámicos del servidor (async server components)
const VisualRecognitionExercise = dynamic(() =>
  import(
    "@/components/exercises/visual-recognition/visual-recognition-exercise"
  ).then((mod) => mod.VisualRecognitionExercise),
);

const VisualRecognitionResults = dynamic(() =>
  import(
    "@/components/exercises/visual-recognition/visual-recognition-results"
  ).then((mod) => mod.VisualRecognitionResults),
);

const SyllablesExercise = dynamic(() =>
  import("@/components/exercises/syllables/syllables-exercise").then(
    (mod) => mod.SyllablesExercise,
  ),
);

const SyllablesResults = dynamic(() =>
  import("@/components/exercises/syllables/syllables-results").then(
    (mod) => mod.SyllablesResults,
  ),
);

const ReactionTimeGrid = dynamic(() =>
  import("@/components/exercises/reaction-time-grid/reaction-time-grid").then(
    (mod) => mod.ReactionTimeGrid,
  ),
);

const ReactionTimeGridResults = dynamic(() =>
  import("@/components/exercises/reaction-time-grid/exercise-results").then(
    (mod) => mod.ExerciseResults,
  ),
);

const ColorSequenceExercise = dynamic(() =>
  import("@/components/exercises/color-sequence/color-sequence-exercise").then(
    (mod) => mod.ColorSequenceExercise,
  ),
);

const ColorSequenceResults = dynamic(() =>
  import("@/components/exercises/color-sequence/color-sequence-results").then(
    (mod) => mod.ColorSequenceResults,
  ),
);

const StimulusCountExercise = dynamic(() =>
  import("@/components/exercises/stimulus-count/stimulus-count-exercise").then(
    (mod) => mod.StimulusCountExercise,
  ),
);

const StimulusCountResults = dynamic(() =>
  import("@/components/exercises/stimulus-count/stimulus-count-results").then(
    (mod) => mod.StimulusCountResults,
  ),
);

const OddOneOutExercise = dynamic(() =>
  import("@/components/exercises/odd-one-out/odd-one-out-exercise").then(
    (mod) => mod.OddOneOutExercise,
  ),
);

const OddOneOutResults = dynamic(() =>
  import("@/components/exercises/odd-one-out/odd-one-out-results").then(
    (mod) => mod.OddOneOutResults,
  ),
);

// Componentes dinámicos del cliente (client components)
const VisualRecognitionConfigFields = dynamic(() =>
  import(
    "@/components/exercises/visual-recognition/visual-recognition-config-form"
  ).then((mod) => mod.VisualRecognitionConfigFields),
);

const SyllablesConfigFields = dynamic(() =>
  import("@/components/exercises/syllables/syllables-config-form").then(
    (mod) => mod.SyllablesConfigFields,
  ),
);

const ReactionTimeConfigFields = dynamic(() =>
  import(
    "@/components/exercises/reaction-time-grid/reaction-time-config-form"
  ).then((mod) => mod.ReactionTimeConfigFields),
);

const ColorSequenceConfigFields = dynamic(() =>
  import(
    "@/components/exercises/color-sequence/color-sequence-config-form"
  ).then((mod) => mod.ColorSequenceConfigFields),
);

const StimulusCountConfigFields = dynamic(() =>
  import(
    "@/components/exercises/stimulus-count/stimulus-count-config-form"
  ).then((mod) => mod.StimulusCountConfigFields),
);

const OddOneOutConfigFields = dynamic(() =>
  import("@/components/exercises/odd-one-out/odd-one-out-config-form").then(
    (mod) => mod.OddOneOutConfigFields,
  ),
);

export type ExerciseEntry = {
  schema: ZodTypeAny;
  presets?: Record<string, any>;
  ExerciseComponent: ComponentType<{ config: any }>;
  ResultsComponent: ComponentType<any>;
  ConfigFieldsComponent: ComponentType<{ basePath?: string }>;
};

export const exerciseRegistry: Record<string, ExerciseEntry> = {
  "visual-recognition": {
    schema: visualRecognitionConfigSchema,
    presets: visualRecognitionPresets,
    ExerciseComponent: VisualRecognitionExercise,
    ResultsComponent: VisualRecognitionResults,
    ConfigFieldsComponent: VisualRecognitionConfigFields,
  },
  syllables: {
    schema: syllablesConfigSchema,
    presets: syllablesPresets,
    ExerciseComponent: SyllablesExercise,
    ResultsComponent: SyllablesResults,
    ConfigFieldsComponent: SyllablesConfigFields,
  },
  "reaction-grid": {
    schema: reactionTimeGridConfigSchema,
    presets: reactionTimePresets,
    ExerciseComponent: ReactionTimeGrid,
    ResultsComponent: ReactionTimeGridResults,
    ConfigFieldsComponent: ReactionTimeConfigFields,
  },
  "color-sequence": {
    schema: colorSequenceConfigSchema,
    presets: colorSequencePresets,
    ExerciseComponent: ColorSequenceExercise,
    ResultsComponent: ColorSequenceResults,
    ConfigFieldsComponent: ColorSequenceConfigFields,
  },
  "stimulus-count": {
    schema: stimulusCountConfigSchema,
    presets: stimulusCountPresets,
    ExerciseComponent: StimulusCountExercise,
    ResultsComponent: StimulusCountResults,
    ConfigFieldsComponent: StimulusCountConfigFields,
  },
  "odd-one-out": {
    schema: oddOneOutConfigSchema,
    presets: oddOneOutPresets,
    ExerciseComponent: OddOneOutExercise,
    ResultsComponent: OddOneOutResults,
    ConfigFieldsComponent: OddOneOutConfigFields,
  },
};

export function getExerciseFromRegistry(
  slug: string,
): ExerciseEntry | undefined {
  return exerciseRegistry[slug as keyof typeof exerciseRegistry];
}
