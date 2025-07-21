"use client"

import type React from "react"
import { useTransition } from "react"
import { MoreVertical, ZoomIn, Copy, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MediaImage } from "./media-image"
import { deleteMedia } from "@/app/actions/media"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type MediaType = "image" | "audio" | "video"

interface MediaActionsDropdownProps {
  mediaType: MediaType
  imageUrl?: string
  imageAlt?: string
  mediaId: number
  blobKey: string
  onCreateVariant?: () => void
  className?: string
}

export function MediaActionsDropdown({
  mediaType,
  imageUrl,
  imageAlt,
  mediaId,
  blobKey,
  onCreateVariant,
  className,
}: MediaActionsDropdownProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    startTransition(async () => {
      try {
        await deleteMedia(mediaId, blobKey)
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error("Error al eliminar el archivo multimedia")
      }
    })
  }

  const handleAction = (action: (() => void) | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    (action ?? (() => {}))();
  };

  const showImageActions = mediaType === "image"

  return (
    <div className={cn("", className)}>
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
                <DropdownMenuItem onClick={(e) => handleAction(onCreateVariant, e)}>
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
            <DialogTitle>{imageAlt}</DialogTitle>
            <div className="relative w-full h-[60vh]">
              <MediaImage src={imageUrl} alt={imageAlt || "Imagen"} fill className="object-contain" />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
