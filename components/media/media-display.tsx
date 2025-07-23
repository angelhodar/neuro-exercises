import { MediaImage } from "./media-image";
import { MediaAudio } from "./media-audio";
import { MediaVideo } from "./media-video";
import { createBlobUrl } from "@/lib/utils";
import type { Media } from "@/lib/db/schema";

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
      <MediaAudio src={blobUrl} preload="metadata">
        {thumbnailUrl && <MediaImage src={thumbnailUrl} alt={media.name} />}
      </MediaAudio>
    );
  }

  if (media.mimeType.startsWith("video/"))
    return (
      <MediaVideo src={blobUrl} poster={thumbnailUrl} preload="metadata" />
    );

  return <MediaImage src={blobUrl} alt={media.name} />;
}
