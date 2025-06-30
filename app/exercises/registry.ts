import type { ZodSchema } from "zod";

// Color Sequence
import { ColorSequenceConfigFields } from "@/components/exercises/color-sequence/color-sequence-config-form";
import { ColorSequenceExercise } from "@/components/exercises/color-sequence/color-sequence-exercise";
import { ColorSequenceResults } from "@/components/exercises/color-sequence/color-sequence-results";
import {
  colorSequenceConfigSchema,
  defaultColorSequenceConfig,
  colorSequencePresets,
} from "@/components/exercises/color-sequence/color-sequence-schema";

// Odd One Out
import { OddOneOutConfigFields } from "@/components/exercises/odd-one-out/odd-one-out-config-form";
import { OddOneOutExercise } from "@/components/exercises/odd-one-out/odd-one-out-exercise";
import { OddOneOutResults } from "@/components/exercises/odd-one-out/odd-one-out-results";
import {
  oddOneOutConfigSchema,
  defaultOddOneOutConfig,
  oddOneOutPresets,
} from "@/components/exercises/odd-one-out/odd-one-out-schema";

// Stroop Color Interference
import { StroopColorInterferenceConfigFields } from "@/components/exercises/stroop-color-interference/stroop-color-interference-config-form";
import { StroopColorInterferenceExercise } from "@/components/exercises/stroop-color-interference/stroop-color-interference-exercise";
import { StroopColorInterferenceResults } from "@/components/exercises/stroop-color-interference/stroop-color-interference-results";
import {
  stroopColorInterferenceConfigSchema,
  defaultStroopColorInterferenceConfig,
  stroopColorInterferencePresets,
} from "@/components/exercises/stroop-color-interference/stroop-color-interference-schema";

type ExerciseRegistryEntry = {
  schema: ZodSchema<any>;
  defaultConfig: any;
  presets: any;
  ExerciseComponent: React.ComponentType<any>;
  ConfigFormComponent: React.ComponentType<any>;
  ResultsComponent: React.ComponentType<any>;
};

export const exerciseRegistry: Record<string, ExerciseRegistryEntry> = {
  "color-sequence": {
    schema: colorSequenceConfigSchema,
    defaultConfig: defaultColorSequenceConfig,
    presets: colorSequencePresets,
    ExerciseComponent: ColorSequenceExercise,
    ConfigFormComponent: ColorSequenceConfigFields,
    ResultsComponent: ColorSequenceResults,
  },
  "odd-one-out": {
    schema: oddOneOutConfigSchema,
    defaultConfig: defaultOddOneOutConfig,
    presets: oddOneOutPresets,
    ExerciseComponent: OddOneOutExercise,
    ConfigFormComponent: OddOneOutConfigFields,
    ResultsComponent: OddOneOutResults,
  },
  "stroop-color-interference": {
    schema: stroopColorInterferenceConfigSchema,
    defaultConfig: defaultStroopColorInterferenceConfig,
    presets: stroopColorInterferencePresets,
    ExerciseComponent: StroopColorInterferenceExercise,
    ConfigFormComponent: StroopColorInterferenceConfigFields,
    ResultsComponent: StroopColorInterferenceResults,
  },
};

export function getExerciseFromRegistry(slug: string) {
  const entry = exerciseRegistry[slug];
  if (!entry) {
    console.warn(`No exercise found in registry for slug: ${slug}`);
  }
  return entry;
}
