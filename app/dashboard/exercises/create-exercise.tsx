"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { createExerciseSchema, CreateExerciseSchema } from "@/lib/schemas/exercises";
import { createExercise } from "@/app/actions/exercises";

export default function CreateExerciseButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateExerciseSchema>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CreateExerciseSchema) => {
    setError(null);
    try {
      const created = await createExercise(values);
      if (!created) throw new Error();
      setOpen(false);
      form.reset();
    } catch (e) {
      setError("Error guardando el ejercicio");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Crear nuevo ejercicio</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo ejercicio</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Describe el ejercicio que quieres crear y la IA generará automáticamente 
            todos los detalles necesarios, incluyendo la imagen y las instrucciones de audio.
          </p>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-2"
          >
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del ejercicio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el ejercicio neurocognitivo que quieres crear. Por ejemplo: 'Un ejercicio de memoria visual donde el usuario debe recordar la secuencia de colores mostrada...'"
                      className="min-h-32"
                      {...field} 
                      required 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando ejercicio..." : "Crear ejercicio"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 