"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields";
import { ExerciseConfigPresetSelector } from "@/components/exercises/exercise-config-preset-selector";
import {
  visualRecognitionConfigSchema,
  defaultVisualRecognitionConfig,
  visualRecognitionPresets,
  type VisualRecognitionConfig,
} from "./visual-recognition-schema";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputList,
} from "@/components/ui/tags-input";

interface VisualRecognitionConfigFormProps {
  defaultConfig?: Partial<VisualRecognitionConfig>;
  onSubmit?: (config: VisualRecognitionConfig) => void;
}

interface VisualRecognitionConfigFieldsProps {
  basePath?: string;
}

export function VisualRecognitionConfigFields(
  props: VisualRecognitionConfigFieldsProps
) {
  const { basePath = "" } = props;
  const { control, watch } = useForm();

  const imagesPerQuestionPath = `${basePath}imagesPerQuestion` as const;
  const correctImagesCountPath = `${basePath}correctImagesCount` as const;
  const showImageNamesPath = `${basePath}showImageNames` as const;
  const categoriesPath = `${basePath}categories` as const;

  const showImageNames = watch(showImageNamesPath);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={imagesPerQuestionPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imágenes por pregunta</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="6"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 0)
                  }
                />
              </FormControl>
              <FormDescription>
                Número total de imágenes mostradas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={correctImagesCountPath}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imágenes correctas</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 0)
                  }
                />
              </FormControl>
              <FormDescription>
                Número de imágenes correctas de la categoría objetivo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={categoriesPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Etiquetas de las imágenes</FormLabel>
            <FormControl>
              <TagsInput
                value={field.value ?? []}
                onValueChange={(tags) => {
                  field.onChange(tags);
                }}
              >
                <TagsInputList>
                  {field.value?.map((tag: string) => (
                    <TagsInputItem key={tag} value={tag}>
                      {tag}
                    </TagsInputItem>
                  ))}
                  <TagsInputInput placeholder="Añade etiquetas y presiona Enter..." />
                </TagsInputList>
              </TagsInput>
            </FormControl>
            <FormDescription>
              Añade al menos dos etiquetas para las imágenes que se usarán en el ejercicio.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={showImageNamesPath}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>Mostrar nombres de imágenes</FormLabel>
              <FormDescription>
                {showImageNames
                  ? "Los nombres aparecerán debajo de cada imagen (más fácil)"
                  : "Solo se mostrarán las imágenes sin nombres (más difícil)"}
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

export function VisualRecognitionConfigForm({
  defaultConfig,
  onSubmit,
}: VisualRecognitionConfigFormProps) {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(visualRecognitionConfigSchema),
    defaultValues: {
      ...defaultVisualRecognitionConfig,
      ...defaultConfig,
    },
  });

  function handleSubmit(data: VisualRecognitionConfig) {
    try {
      const validatedData = visualRecognitionConfigSchema.parse(data);
      if (onSubmit) {
        onSubmit(validatedData);
        return;
      }
      const params = new URLSearchParams();
      params.set("config", JSON.stringify(validatedData));
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          Reconocimiento Visual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <ExerciseConfigPresetSelector presets={visualRecognitionPresets} />
            <Separator />
            <ExerciseBaseFields />
            <Separator />
            <VisualRecognitionConfigFields />
            <Separator />
            <div className="flex justify-end">
              <Button type="submit">Comenzar Ejercicio</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
