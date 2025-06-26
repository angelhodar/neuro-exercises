import type { ComponentType } from "react";
import { type ZodTypeAny } from "zod";

import {
  visualRecognitionConfigSchema,
  visualRecognitionPresets,
} from "@/components/exercises/visual-recognition/visual-recognition-schema";
import { VisualRecognitionConfigFields } from "@/components/exercises/visual-recognition/visual-recognition-config-form";

import {
  syllablesConfigSchema,
  syllablesPresets,
} from "@/components/exercises/syllables/syllables-schema";
import { SyllablesConfigFields } from "@/components/exercises/syllables/syllables-config-form";

import {
  reactionTimeGridConfigSchema,
  reactionTimePresets,
} from "@/components/exercises/reaction-time-grid/reaction-time-grid-schema";
import { ReactionTimeConfigFields } from "@/components/exercises/reaction-time-grid/reaction-time-config-form";

import {
  colorSequenceConfigSchema,
  colorSequencePresets,
} from "@/components/exercises/color-sequence/color-sequence-schema";
import { ColorSequenceConfigFields } from "@/components/exercises/color-sequence/color-sequence-config-form";

import {
  stimulusCountConfigSchema,
  stimulusCountPresets,
} from "@/components/exercises/stimulus-count/stimulus-count-schema";
import { StimulusCountConfigFields } from "@/components/exercises/stimulus-count/stimulus-count-config-form";

import { oddOneOutConfigSchema, oddOneOutPresets } from "@/components/exercises/odd-one-out/odd-one-out-schema";
import { OddOneOutConfigFields } from "@/components/exercises/odd-one-out/odd-one-out-config-form";

import { stroopTestConfigSchema, stroopTestPresets } from "@/components/exercises/prueba-pr/prueba-pr-schema";
import { PruebaPrConfigForm } from "@/components/exercises/prueba-pr/prueba-pr-config-form";

export type ClientExerciseEntry = {
  schema: ZodTypeAny;
  presets?: Record<string, any>;
  ConfigFieldsComponent: ComponentType<{ basePath?: string }>;
};

function createEntry(entry: ClientExerciseEntry) {
  return entry;
}

export const exerciseRegistryClient = {
  "visual-recognition": createEntry({
    schema: visualRecognitionConfigSchema,
    presets: visualRecognitionPresets,
    ConfigFieldsComponent: VisualRecognitionConfigFields,
  }),
  syllables: createEntry({
    schema: syllablesConfigSchema,
    presets: syllablesPresets,
    ConfigFieldsComponent: SyllablesConfigFields,
  }),
  "reaction-grid": createEntry({
    schema: reactionTimeGridConfigSchema,
    presets: reactionTimePresets,
    ConfigFieldsComponent: ReactionTimeConfigFields,
  }),
  "color-sequence": createEntry({
    schema: colorSequenceConfigSchema,
    presets: colorSequencePresets,
    ConfigFieldsComponent: ColorSequenceConfigFields,
  }),
  "stimulus-count": createEntry({
    schema: stimulusCountConfigSchema,
    presets: stimulusCountPresets,
    ConfigFieldsComponent: StimulusCountConfigFields,
  }),
  "odd-one-out": createEntry({
    schema: oddOneOutConfigSchema,
    presets: oddOneOutPresets,
    ConfigFieldsComponent: OddOneOutConfigFields,
  }),
  "prueba-pr": createEntry({
    schema: stroopTestConfigSchema,
    presets: stroopTestPresets,
    ConfigFieldsComponent: PruebaPrConfigForm,
  }),
};

export function getExerciseFromClientRegistry(slug: string): ClientExerciseEntry | undefined {
  return exerciseRegistryClient[slug as keyof typeof exerciseRegistryClient];
} 