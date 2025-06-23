"use client";

import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import MediaSelector from "@/components/ui/templates/media-selector";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields";
import {
  oddOneOutConfigSchema,
  defaultOddOneOutConfig,
  type OddOneOutConfig,
} from "./odd-one-out-schema";
import { useEffect } from "react";

// This component now syncs its fields based on the 'totalQuestions' value
export function OddOneOutConfigFields() {
  const { control, watch } = useFormContext<OddOneOutConfig>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const totalQuestions = watch("totalQuestions");

  // Sync the field array with the totalQuestions value
  useEffect(() => {
    const currentLength = fields.length;
    const targetLength = totalQuestions || 0;

    if (currentLength < targetLength) {
      for (let i = currentLength; i < targetLength; i++) {
        append({ patternMedias: [], outlierMedia: { id: 0, name: "", blobKey: "", tags: [] } });
      }
    } else if (currentLength > targetLength) {
      for (let i = currentLength; i > targetLength; i--) {
        remove(i - 1);
      }
    }
  }, [totalQuestions, fields.length, append, remove]);


  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <Card key={field.id} className="p-4 bg-gray-50/50 dark:bg-gray-900/50">
          <CardHeader className="flex flex-row items-center justify-between p-2">
            <CardTitle className="text-lg">Pregunta {index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name={`questions.${index}.patternMedias`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imágenes del patrón</FormLabel>
                  <FormControl>
                    <MediaSelector
                      selectedMedias={field.value ?? []}
                      onMediasChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`questions.${index}.outlierMedia`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen diferente</FormLabel>
                  <FormControl>
                    <MediaSelector
                      selectedMedias={field.value ? [field.value] : []}
                      onMediasChange={(medias) =>
                        field.onChange(medias[0] || { id: 0, name: "", blobKey: "", tags: [] })
                      }
                      selectionMode="single"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Full form component no longer needs to sync totalQuestions from the array
interface OddOneOutConfigFormProps {
  defaultConfig?: Partial<OddOneOutConfig>;
  onSubmit?: (config: OddOneOutConfig) => void;
}

export function OddOneOutConfigForm({
  defaultConfig,
  onSubmit,
}: OddOneOutConfigFormProps) {
  const router = useRouter();

  const form = useForm<OddOneOutConfig>({
    resolver: zodResolver(oddOneOutConfigSchema),
    defaultValues: {
      ...defaultOddOneOutConfig,
      ...defaultConfig,
    },
  });

  function handleSubmit(data: OddOneOutConfig) {
    try {
      const validatedData = oddOneOutConfigSchema.parse(data);
      if (onSubmit) {
        onSubmit(validatedData);
        return;
      }
      const params = new URLSearchParams();
      params.set("config", JSON.stringify(validatedData));
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  function handleError(error: any) {
    console.error("Error submitting form:", error);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>¿Cual te has dejado?</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, handleError)}
            className="space-y-6"
          >
            <Separator />
            <ExerciseBaseFields />
            <Separator />
            <OddOneOutConfigFields />
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