"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteMedia } from "@/app/actions/media";
import { Trash2 } from "lucide-react";
import MediaCard from "@/components/ui/templates/media-card";
import { SelectableMediaSchema } from "@/lib/schemas/medias";

interface MediaCardProps {
  media: SelectableMediaSchema
}

export default function DashboardMediaCard({ media }: MediaCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteMedia(media.id, media.blobKey);
        router.refresh();
      } catch (e) {
        console.error(e)
        toast.error("Error al eliminar la imagen");
      }
    });
  }

  return (
    <div className="relative">
      <MediaCard 
        media={media} 
        variant="default"
        className="relative h-full"
      />

      <button
        className="absolute -top-2 -right-2 bg-white rounded-full z-10 hover:bg-red-50"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Eliminar"
        type="button"
      >
        <Trash2 className="w-6 h-6 text-red-600" />
      </button>
    </div>
  );
} 