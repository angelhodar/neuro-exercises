"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { uploadManualMedia } from "@/app/actions/media";
import { MediaTagsInput } from "@/components/media/media-tags";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { uploadBlobFromFile } from "@/lib/storage";

const schema = z.object({
  description: z.string().min(1, "La descripción es obligatoria"),
  file: z.instanceof(File, { message: "El archivo es obligatorio" }),
  name: z.string().min(1, "El nombre es obligatorio"),
  tags: z.array(z.string()).min(1, "Escribe al menos una etiqueta"),
  thumbnail: z.instanceof(File).optional(),
});

type FormSchema = z.infer<typeof schema>;

export default function CreateMediaManual({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const form = useForm<FormSchema>({
    defaultValues: {
      description: "",
      name: "",
      tags: [],
    },
    resolver: zodResolver(schema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: FormSchema) => {
    setIsSubmitting(true);

    try {
      const [blob, thumbBlob] = await Promise.all([
        uploadBlobFromFile(values.file),
        values.thumbnail
          ? uploadBlobFromFile(values.thumbnail)
          : Promise.resolve(undefined),
      ]);
      const thumbnailKey = thumbBlob ? thumbBlob.pathname : undefined;
      await uploadManualMedia({
        description: values.description,
        fileKey: blob.pathname,
        mimeType: blob.contentType,
        name: values.name,
        tags: values.tags,
        thumbnailKey,
      });
      toast.success("Contenido subido correctamente");
      setOpen(false);
      form.reset();
    } catch {
      toast.error("Error subiendo el contenido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir contenido manualmente</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del contenido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiquetas</FormLabel>
                  <FormControl>
                    <MediaTagsInput
                      onChange={field.onChange}
                      placeholder="Añadir etiqueta..."
                      value={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Selecciona las etiquetas para este contenido
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
                    <Input placeholder="Descripción (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Archivo</FormLabel>
                  <FormControl>
                    <Input
                      accept="image/*,audio/*,video/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                      required
                      type="file"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Miniatura (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                      type="file"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Subiendo..." : "Subir"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
