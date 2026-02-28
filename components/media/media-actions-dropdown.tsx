"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, MoreVertical, Trash2, ZoomIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { deleteMedia, generateDerivedMedia } from "@/app/actions/media";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import type { Media } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";
import { MediaImage } from "./media-image";

interface MediaActionsDropdownProps
  extends React.HTMLAttributes<HTMLDivElement> {
  media: Media;
}

export function MediaActionsDropdown({
  media,
  className,
}: MediaActionsDropdownProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [openVariantDialog, setOpenVariantDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);

  // Infer mediaType from mimeType
  const getMediaType = (mimeType: string): "image" | "audio" | "video" => {
    if (mimeType.startsWith("image/")) {
      return "image";
    }
    if (mimeType.startsWith("audio/")) {
      return "audio";
    }
    if (mimeType.startsWith("video/")) {
      return "video";
    }
    return "image"; // fallback
  };

  const mediaType = getMediaType(media.mimeType);

  const imageUrl = media.thumbnailKey
    ? createBlobUrl(media.thumbnailKey)
    : createBlobUrl(media.blobKey);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: "¿Eliminar archivo?",
      description:
        "Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este archivo multimedia?",
    });
    if (!confirmed) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteMedia(media);
        router.refresh();
        toast.success("Archivo multimedia eliminado correctamente");
      } catch (error) {
        console.error(error);
        toast.error("Error al eliminar el archivo multimedia");
      }
    });
  };

  // Formulario para crear variante
  const schema = z.object({
    prompt: z.string().min(1, "El prompt es obligatorio"),
  });
  type FormSchema = z.infer<typeof schema>;
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: { prompt: "" },
  });

  const handleCreateVariant = () => setOpenVariantDialog(true);
  const handleOpenImage = () => setOpenImageDialog(true);

  const onSubmit = async (values: FormSchema) => {
    setIsSubmitting(true);
    try {
      await generateDerivedMedia(media, values.prompt);
      toast.success("Variante generada correctamente");
      setOpenVariantDialog(false);
      form.reset();
      router.refresh();
    } catch (_e) {
      toast.error("Error generando la variante");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showImageActions = mediaType === "image";

  return (
    <div className={className}>
      {/* Dialog para ver imagen ampliada */}
      <Dialog onOpenChange={setOpenImageDialog} open={openImageDialog}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                aria-label="Media actions"
                className="rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/90"
                onClick={(e) => e.stopPropagation()} // Prevent triggering parent selection
                type="button"
              />
            }
          >
            <MoreVertical className="h-4 w-4 text-gray-700" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-62">
            {showImageActions && (
              <>
                <DropdownMenuItem onClick={handleOpenImage}>
                  <ZoomIn className="mr-3 h-4 w-4" />
                  Ver imagen completa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateVariant}>
                  <Copy className="mr-3 h-4 w-4" />
                  Crear variante
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
              disabled={isPending}
              onClick={handleDelete}
            >
              <Trash2 className="mr-3 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {showImageActions && imageUrl && (
          <DialogContent className="max-w-4xl p-4 sm:max-w-4xl">
            <DialogTitle>{media.name}</DialogTitle>
            <div className="relative h-[60vh] w-full">
              <MediaImage
                alt={media.name}
                className="object-contain"
                fill
                src={imageUrl}
              />
            </div>
          </DialogContent>
        )}
      </Dialog>
      {/* Dialog para crear variante, independiente */}
      <Dialog onOpenChange={setOpenVariantDialog} open={openVariantDialog}>
        <DialogContent>
          <DialogTitle>Crear variante de imagen</DialogTitle>
          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrucciones para la variante</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Describe la variante que quieres generar..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Generando..." : "Generar variante"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
