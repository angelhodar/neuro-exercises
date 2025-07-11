"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { AddExerciseButton } from "./add-exercise-button";
import { ExerciseCard } from "./exercise-card";
import { Exercise } from "@/lib/db/schema";
import { loadClientAssets } from "@/app/exercises/loader";
import ConfigureExerciseButton from "./configure-exercise-button";
import { createExerciseTemplate } from "@/app/actions/templates";
import { Trash2 } from "lucide-react";

const templateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  exercises: z
    .array(
      z.object({
        exerciseId: z.coerce.number(),
        slug: z.string(),
        config: z.any(),
      })
    )
    .min(1, "At least one exercise is required"),
});

type TemplateFormData = z.infer<typeof templateSchema>;

type CreateTemplateFormProps = {
  exercises: Array<Exercise>;
};

export default function CreateTemplateForm(props: CreateTemplateFormProps) {
  const { exercises } = props;

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: "",
      description: "",
      exercises: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const addExercise = async (selectedExercise: Exercise) => {
    // Check if exercise is already added
    const existingExercise = fields.find(
      (field) => field.exerciseId === selectedExercise.id
    );

    if (existingExercise) {
      toast.error("Este ejercicio ya está añadido");
      return;
    }

    try {
      const assets = await loadClientAssets(selectedExercise.slug);
      const defaultConfig = assets?.presets?.easy ?? {};

      append({
        exerciseId: selectedExercise.id,
        slug: selectedExercise.slug,
        config: defaultConfig,
      });
      toast.success("Ejercicio añadido");
    } catch (error) {
      console.error("Error loading exercise presets:", error);
      // Fallback to empty config if loading fails
      append({
        exerciseId: selectedExercise.id,
        slug: selectedExercise.slug,
        config: {},
      });
      toast.success("Ejercicio añadido (sin configuración por defecto)");
    }
  };

  const removeExercise = (index: number) => {
    remove(index);
    toast.success("Ejercicio eliminado");
  };

  const onSubmit = async (data: TemplateFormData) => {
    try {
      setIsSubmitting(true);
      await createExerciseTemplate({
        title: data.title,
        description: data.description || null,
        items: data.exercises.map((exercise, index) => ({
          exerciseId: exercise.exerciseId,
          config: exercise.config,
          position: index,
        })),
      });
      toast.success("Plantilla guardada!");
      router.push("/dashboard/templates");
    } catch (error) {
      toast.error("Error al guardar la plantilla");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitError = (errors: any) => {
    console.log("Form errors:", errors);
    toast.error("Por favor, verifica los campos requeridos");
  };

  const selectableExercises = exercises.filter(
    (exercise) => !fields.some((field) => field.exerciseId === exercise.id)
  );

  return (
    <div className="max-w-6xl p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear plantilla de ejercicio</CardTitle>
          <CardDescription>
            Crea una plantilla con múltiples ejercicios cognitivos y sus
            configuraciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onSubmitError)}
              className="space-y-6"
            >
              {/* Template Basic Info */}
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la plantilla</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Título de la plantilla"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Un título descriptivo para tu plantilla
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción de la plantilla"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Información adicional sobre la plantilla
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Exercises Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-lg font-semibold">
                    Ejercicios
                  </FormLabel>
                  <AddExerciseButton
                    exercises={selectableExercises}
                    onAddExercise={addExercise}
                  />
                </div>

                {fields.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="text-center text-muted-foreground">
                        <p>No has incluido ningún ejercicio aún</p>
                        <p className="text-sm">
                          Haz click en "Añadir ejercicio" para empezar
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fields.map((field, index) => {
                      const exercise = exercises.find(
                        (e) => e.id === field.exerciseId
                      );

                      if (!exercise) return null;

                      return (
                        <ExerciseCard
                          key={field.exerciseId}
                          exercise={exercise}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExercise(index)}
                            className="absolute -top-2 right-1 z-10 text-destructive hover:text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <ConfigureExerciseButton
                            slug={field.slug}
                            index={index}
                          />
                        </ExerciseCard>
                      );
                    })}
                  </div>
                )}

                {form.formState.errors.exercises && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.exercises.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Creando plantilla..." : "Crear plantilla"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
