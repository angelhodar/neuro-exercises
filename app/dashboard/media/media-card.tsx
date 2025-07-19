"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteMedia } from "@/app/actions/media";
import { Trash2 } from "lucide-react";
import {
  MediaCard,
  MediaCardContent,
  MediaCardTitle,
  ExpandableMediaCardImage,
  ClickableMediaTags,
} from "@/components/media-card";
import { SelectableMediaSchema } from "@/lib/schemas/medias";
import { createBlobUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardMediaCardProps {
  media: SelectableMediaSchema;
}

export default function DashboardMediaCard({ media }: DashboardMediaCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteMedia(media.id, media.blobKey);
        router.refresh();
      } catch (e) {
        console.error(e);
        toast.error("Error al eliminar la imagen");
      }
    });
  }

  return (
    <div className="relative h-full">
      <MediaCard className="h-full flex flex-col">
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <ExpandableMediaCardImage
            src={createBlobUrl(media.blobKey)}
            alt={media.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
        <MediaCardContent padding="sm" className="flex-1 flex flex-col justify-between">
          <MediaCardTitle className="text-sm text-center line-clamp-2">
            {media.name}
          </MediaCardTitle>
          {media.tags && media.tags.length > 0 && (
            <ClickableMediaTags
              tags={media.tags}
              variant="secondary"
              size="sm"
              className="justify-center mt-2"
            />
          )}
        </MediaCardContent>
      </MediaCard>

      <Button
        variant="ghost"
        size="sm"
        className="absolute top-1 right-1 h-7 w-7 rounded-lg p-0 z-10 hover:text-red-500 hover:bg-transparent"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Eliminar"
        type="button"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
