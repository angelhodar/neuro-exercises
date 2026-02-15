"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { generateMediaFromPrompt } from "@/app/actions/media";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  prompt: z.string().min(1, "El prompt es obligatorio"),
});

type FormSchema = z.infer<typeof schema>;

export default function CreateMediaWithAI({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
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
    } catch (_e) {
      toast.error("Error generando la imagen");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar imagen con IA</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrucciones</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Describe la imagen que quieres generar..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Generando..." : "Generar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
