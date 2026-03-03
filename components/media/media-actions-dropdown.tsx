"use client";

import { Copy, MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { deleteMedia } from "@/app/actions/media";
import CreateMediaWithAI from "@/app/dashboard/media/create-media-with-ai";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import type { Media } from "@/lib/db/schema";

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
    return "image";
  };

  const mediaType = getMediaType(media.mimeType);

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

  const showImageActions = mediaType === "image";

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              aria-label="Media actions"
              className="rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/90"
              onClick={(e) => e.stopPropagation()}
              type="button"
            />
          }
        >
          <MoreVertical className="h-4 w-4 text-gray-700" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-62">
          {showImageActions && (
            <>
              <DropdownMenuItem onClick={() => setOpenVariantDialog(true)}>
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
      {/* Manual backdrop since this Dialog is nested inside MultimediaCard's Dialog (base-ui suppresses backdrops for nested dialogs) */}
      {openVariantDialog &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-xs" />,
          document.body
        )}
      <CreateMediaWithAI
        open={openVariantDialog}
        setOpen={setOpenVariantDialog}
        sourceMedia={media}
      />
    </div>
  );
}
