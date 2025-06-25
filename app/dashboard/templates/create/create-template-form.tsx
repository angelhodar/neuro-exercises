"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getExerciseFromClientRegistry } from "@/app/registry/registry.client";
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields";
import { Stepper } from "@/components/ui/stepper";
import { Exercise } from "@/lib/db/schema";
import Tags from "@/components/tags";
import { cn } from "@/lib/utils";
import { createExerciseTemplate } from "@/app/actions/templates";

const templateCreationSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.number(),
        slug: z.string(),
        config: z.record(z.any()),
      })
    )
    .min(1, "Debe incluir al menos un ejercicio"),
});

type TemplateCreationForm = z.infer<typeof templateCreationSchema>;

type CreateTemplateFormProps = {
  exercises: Array<Exercise>;
};

export default function CreateTemplateForm({
  exercises,
}: CreateTemplateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TemplateCreationForm>({
    resolver: zodResolver(templateCreationSchema),
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

  const addExercise = (exercise: Exercise) => {
    if (fields.some((field) => field.exerciseId === exercise.id)) {
      toast.error("Este ejercicio ya está agregado");
      return;
    }

    const exerciseMeta = getExerciseFromClientRegistry(exercise.slug);
    const defaultConfig = exerciseMeta?.presets?.easy ?? {};
    
    append({
      exerciseId: exercise.id,
      slug: exercise.slug,
      config: {
        timerDuration: 60,
        totalQuestions: 10,
        ...defaultConfig,
      },
    });
  };

  const removeExercise = (index: number) => {
    remove(index);
  };

  const getExerciseById = (id: number) => {
    return exercises.find((ex) => ex.id === id);
  };

  const onSubmit = async (data: TemplateCreationForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createExerciseTemplate({
        title: data.title,
        description: data.description || null,
        items: data.exercises.map((exercise, index) => ({
          exerciseId: exercise.exerciseId,
          config: exercise.config,
          position: index,
        })),
      });
      toast.success("Plantilla creada exitosamente!");
      router.push("/dashboard/templates");
    } catch (error: any) {
      setError(error.message || "Error al crear la plantilla");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitError = (err: any) => {
    setError("Revisa los campos obligatorios");
    console.log(err);
  };

  const handleNextStep = async () => {
    const valid = await form.trigger(["title", "description"]);
    if (valid) setStep(2);
  };

  const handlePrevStep = () => setStep(1);

  const steps = [
    { step: 1, title: "Información general" },
    { step: 2, title: "Ejercicios" },
  ];

  return (
    <div className="flex flex-col space-y-6 max-w-5xl justify-center items-center mt-6">
      <Stepper steps={steps} currentStep={step} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onSubmitError)}
          className="flex gap-6 w-full justify-center items-center"
        >
          {/* Paso 1: Información general */}
          {step === 1 && (
            <div className="flex flex-col space-y-4 w-full">
              <h2 className="text-xl font-semibold mb-2">
                Información de la plantilla
              </h2>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Plantilla de rehabilitación - Semana 1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Un título descriptivo para la plantilla
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
                    <FormLabel>Descripción (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Descripción adicional sobre la plantilla..."
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Información adicional sobre el propósito de esta plantilla
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/templates")}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleNextStep}>
                  Siguiente
                </Button>
              </div>
            </div>
          )}
          {/* Paso 2: Ejercicios */}
          {step === 2 && (
            <div className="flex flex-col gap-6 w-full">
              <div className="grid gap-3 md:grid-cols-2">
                {exercises.map((exercise) => {
                  const isAdded = fields.some(
                    (field) => field.exerciseId === exercise.id
                  );
                  return (
                    <div
                      key={exercise.id}
                      className={cn(
                        "flex rounded-lg border p-4 transition-colors relative",
                        isAdded
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex flex-col items-start gap-2">
                        <h4 className="font-medium">{exercise.displayName}</h4>
                        <Tags tags={exercise.tags} maxVisible={1} />
                      </div>
                      {!isAdded && (
                        <Button
                          type="button"
                          variant={isAdded ? "secondary" : "outline"}
                          size="icon"
                          onClick={() => addExercise(exercise)}
                          className="absolute top-2 right-2"
                          disabled={isAdded}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* List of selected exercises */}
              {fields.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>
                      Ejercicios seleccionados ({fields.length})
                    </CardTitle>
                    <CardDescription>
                      Configura cada ejercicio individualmente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Accordion type="single" collapsible className="w-full">
                      {fields.map((field, index) => {
                        const exercise = getExerciseById(field.exerciseId);
                        if (!exercise) return null;

                        const exerciseMeta = getExerciseFromClientRegistry(
                          field.slug
                        );

                        const ConfigFields =
                          exerciseMeta?.ConfigFieldsComponent;

                        if (!ConfigFields) return null;

                        return (
                          <AccordionItem
                            key={field.id}
                            value={field.id}
                            className="relative"
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-3 right-6 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeExercise(index);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-4 flex-1">
                                <span className="text-lg font-medium">
                                  {exercise.displayName}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="p-1 pt-4 space-y-6 border-t">
                                <ExerciseBaseFields
                                  basePath={`exercises.${index}.config.`}
                                />
                                <Separator />
                                <ConfigFields
                                  basePath={`exercises.${index}.config.`}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </CardContent>
                </Card>
              )}
              <div className="flex justify-between gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                >
                  Anterior
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || fields.length === 0}
                  className="disabled:bg-opacity/50"
                >
                  {isSubmitting ? "Creando..." : "Crear plantilla"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
