"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { generateMediaFromPrompt } from "@/app/actions/media";

const schema = z.object({
  prompt: z.string().min(1, "El prompt es obligatorio"),
});

type FormSchema = z.infer<typeof schema>;

export default function CreateMediaWithAI({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: { prompt: "" },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: FormSchema) => {
    setIsSubmitting(true);
    try {
      await generateMediaFromPrompt(values.prompt);
      toast.success("Imagen generada correctamente");
      setOpen(false);
      form.reset();
    } catch (e) {
      toast.error("Error generando la imagen");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar imagen con IA</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrucciones</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe la imagen que quieres generar..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Generando..." : "Generar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 