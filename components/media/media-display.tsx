import { MediaImage } from "./media-image";
import { MediaAudio } from "./media-audio";
import { MediaVideo } from "./media-video";
import { createBlobUrl } from "@/lib/utils";
import type { SelectableMediaSchema } from "@/lib/schemas/medias";

interface MediaDisplayProps {
  media: SelectableMediaSchema;
}

export function MediaDisplay({ media }: MediaDisplayProps) {
  const blobUrl = createBlobUrl(media.blobKey);
  const thumbnailUrl = media.thumbnailKey ? createBlobUrl(media.thumbnailKey) : undefined;

  if (media.mimeType.startsWith("audio/")) {
    return (
      <MediaAudio src={blobUrl} preload="metadata">
        {thumbnailUrl && (
          <MediaImage src={thumbnailUrl} alt={media.name} />
        )}
      </MediaAudio>
    );
  } else if (media.mimeType.startsWith("video/")) {
    return (
      <MediaVideo src={blobUrl} poster={thumbnailUrl} preload="metadata">
        {thumbnailUrl && (
          <MediaImage src={thumbnailUrl} alt={media.name} />
        )}
      </MediaVideo>
    );
  } else {
    return <MediaImage src={blobUrl} alt={media.name} />;
  }
} 