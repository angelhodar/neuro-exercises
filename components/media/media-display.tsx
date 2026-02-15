import type { Media } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";
import { MediaAudio } from "./media-audio";
import { MediaImage } from "./media-image";
import { MediaVideo } from "./media-video";

interface MediaDisplayProps {
  media: Media;
}

export function MediaDisplay({ media }: MediaDisplayProps) {
  const blobUrl = createBlobUrl(media.blobKey);
  const thumbnailUrl = media.thumbnailKey
    ? createBlobUrl(media.thumbnailKey)
    : undefined;

  if (media.mimeType.startsWith("audio/")) {
    return (
      <MediaAudio preload="metadata" src={blobUrl}>
        {thumbnailUrl && <MediaImage alt={media.name} src={thumbnailUrl} />}
      </MediaAudio>
    );
  }

  if (media.mimeType.startsWith("video/")) {
    return (
      <MediaVideo poster={thumbnailUrl} preload="metadata" src={blobUrl} />
    );
  }

  return <MediaImage alt={media.name} src={blobUrl} />;
}
