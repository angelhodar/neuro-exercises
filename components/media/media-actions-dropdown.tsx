"use client";

import type React from "react";
import { useTransition } from "react";
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

interface MediaActionsDropdownProps
  extends React.HTMLAttributes<HTMLDivElement> {
  media: Media;
  onCreateVariant?: () => void;
}

export function MediaActionsDropdown({
  media,
  onCreateVariant,
  className,
}: MediaActionsDropdownProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { confirm } = useConfirm();

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
      description: "Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este archivo multimedia?"
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

  const handleAction = (
    action: (() => void) | undefined,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    (action ?? (() => {}))();
  };

  const showImageActions = mediaType === "image";

  return (
    <div className={className}>
      <Dialog>
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
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <ZoomIn className="w-4 h-4 mr-3" />
                    Ver imagen completa
                  </DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuItem
                  onClick={(e) => handleAction(onCreateVariant, e)}
                >
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
    </div>
  );
}
