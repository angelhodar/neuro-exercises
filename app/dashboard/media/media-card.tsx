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
import { MediaCardAudio } from "@/components/media-card-audio";
import { MediaCardVideo } from "@/components/media-card-video";
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

  const renderMediaContent = () => {
    const blobUrl = createBlobUrl(media.blobKey);
    const thumbnailUrl = media.thumbnailKey ? createBlobUrl(media.thumbnailKey) : undefined;

    if (media.mimeType.startsWith('audio/')) {
      return (
        <MediaCardAudio
          src={blobUrl}
          alt={media.name}
          width={200}
          height={200}
        />
      );
    } else if (media.mimeType.startsWith('video/')) {
      return (
        <MediaCardVideo
          src={blobUrl}
          alt={media.name}
          width={200}
          height={200}
          thumbnailSrc={thumbnailUrl}
        />
      );
    } else {
      // Default to image for any other type
      return (
        <ExpandableMediaCardImage
          src={blobUrl}
          alt={media.name}
          width={200}
          height={200}
        />
      );
    }
  };

  return (
    <div className="relative">
      <MediaCard className="h-full">
        {renderMediaContent()}
        <MediaCardContent padding="sm">
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
