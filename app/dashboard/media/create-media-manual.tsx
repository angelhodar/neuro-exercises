"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { uploadBlobFromFile } from "@/lib/storage";
import { uploadManualMedia } from "@/app/actions/media";
import { MediaTagsInput } from "@/components/media/media-tags";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  tags: z.array(z.string()).min(1, "Escribe al menos una etiqueta"),
  description: z.string().min(1, "La descripción es obligatoria"),
  file: z.instanceof(File, { message: "El archivo es obligatorio" }),
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
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      tags: [],
      description: ""
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: FormSchema) => {
    setIsSubmitting(true);
    
    try {
      const [blob, thumbBlob] = await Promise.all([
        uploadBlobFromFile(values.file),
        values.thumbnail ? uploadBlobFromFile(values.thumbnail) : Promise.resolve(undefined)
      ]);
      const thumbnailKey = thumbBlob ? thumbBlob.pathname : undefined;
      await uploadManualMedia({
        name: values.name,
        tags: values.tags,
        description: values.description,
        fileKey: blob.pathname,
        thumbnailKey,
        mimeType: blob.contentType,
      });
      toast.success("Contenido subido correctamente");
      setOpen(false);
      form.reset();
    } catch (e) {
      toast.error("Error subiendo el contenido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir contenido manualmente</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-4"
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
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Añadir etiqueta..."
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
                      type="file"
                      accept="image/*,audio/*,video/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                      required
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
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Subiendo..." : "Subir"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
