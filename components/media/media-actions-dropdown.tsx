"use client";

import { useState, useTransition } from "react";
import { MoreVertical, ZoomIn, Copy, Trash2 } from "lucide-react";
import { createBlobUrl } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MediaImage } from "./media-image";
import { deleteMedia } from "@/app/actions/media";
import { Media } from "@/lib/db/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";
import { generateDerivedMedia } from "@/app/actions/media";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "video";
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
    if (!confirmed) return;
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
    } catch (e) {
      toast.error("Error generando la variante");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showImageActions = mediaType === "image";

  return (
    <div className={className}>
      {/* Dialog para ver imagen ampliada */}
      <Dialog open={openImageDialog} onOpenChange={setOpenImageDialog}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded-full bg-white/80 hover:bg-white/90 backdrop-blur-sm transition-colors shadow-sm"
              aria-label="Media actions"
              onClick={(e) => e.stopPropagation()} // Prevent triggering parent selection
            >
              <MoreVertical className="w-4 h-4 text-gray-700" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-62">
            {showImageActions && (
              <>
                <DropdownMenuItem onClick={handleOpenImage}>
                  <ZoomIn className="w-4 h-4 mr-3" />
                  Ver imagen completa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateVariant}>
                  <Copy className="w-4 h-4 mr-3" />
                  Crear variante
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              disabled={isPending}
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {showImageActions && imageUrl && (
          <DialogContent side="top" className="max-w-4xl p-4">
            <DialogTitle>{media.name}</DialogTitle>
            <div className="relative w-full h-[60vh]">
              <MediaImage
                src={imageUrl}
                alt={media.name}
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        )}
      </Dialog>
      {/* Dialog para crear variante, independiente */}
      <Dialog open={openVariantDialog} onOpenChange={setOpenVariantDialog}>
        <DialogContent>
          <DialogTitle>Crear variante de imagen</DialogTitle>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4 mt-4"
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Generando..." : "Generar variante"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
