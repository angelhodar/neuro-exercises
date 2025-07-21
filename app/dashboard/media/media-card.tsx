"use client";

import { createBlobUrl } from "@/lib/utils";
import { MediaCard, MediaCardContainer, MediaCardTitle, MediaCardBadges } from "@/components/media/media-card";
import { MediaDisplay } from "@/components/media/media-display";
import { MediaActionsDropdown } from "@/components/media/media-actions-dropdown";
import type { SelectableMediaSchema } from "@/lib/schemas/medias";

interface DashboardMediaCardProps {
  media: SelectableMediaSchema;
}

export default function DashboardMediaCard({ media }: DashboardMediaCardProps) {
  const imageUrl = media.thumbnailKey ? createBlobUrl(media.thumbnailKey) : media.mimeType.startsWith("image/") ? createBlobUrl(media.blobKey) : undefined;
  const imageAlt = media.name;

  return (
    <MediaCard>
      <MediaCardContainer>
        <MediaDisplay media={media} />
        <MediaActionsDropdown
          mediaType={media.mimeType.startsWith("audio/") ? "audio" : media.mimeType.startsWith("video/") ? "video" : "image"}
          imageUrl={imageUrl}
          imageAlt={imageAlt}
          mediaId={media.id}
          blobKey={media.blobKey}
          className="absolute top-2 right-2"
        />
      </MediaCardContainer>
      <div className="p-4 flex-1 flex flex-col gap-3">
        <MediaCardTitle className="text-sm text-center line-clamp-2">{media.name}</MediaCardTitle>
        {media.tags && media.tags.length > 0 && (
          <MediaCardBadges badges={media.tags} />
        )}
      </div>
    </MediaCard>
  );
}
