"use client";

import { Play, PlusIcon, Volume2, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SelectableMediaSchema } from "@/lib/schemas/medias";
import { cn, createBlobUrl } from "@/lib/utils";

const MediaFile = ({
  media,
  removeFile,
}: {
  media: SelectableMediaSchema;
  removeFile: (id: number) => void;
}) => {
  const renderMediaContent = () => {
    const blobUrl = createBlobUrl(media.blobKey);
    const _thumbnailUrl = media.thumbnailKey
      ? createBlobUrl(media.thumbnailKey)
      : undefined;

    if (media.mimeType.startsWith("audio/")) {
      return (
        <div className="flex size-full items-center justify-center rounded-[inherit] bg-gradient-to-br from-blue-500 to-purple-600">
          <Volume2 className="h-8 w-8 text-white" />
        </div>
      );
    }
    if (media.mimeType.startsWith("video/")) {
      return (
        <div className="flex size-full items-center justify-center rounded-[inherit] bg-black">
          <Play className="ml-1 h-8 w-8 text-white" />
        </div>
      );
    }
    // Default to image
    return (
      // biome-ignore lint/performance/noImgElement: dynamic blob URL from storage
      <img
        alt={media.name}
        className="size-full rounded-[inherit] object-cover"
        height={200}
        src={blobUrl}
        width={200}
      />
    );
  };

  return (
    <div className="relative aspect-square rounded-md bg-accent" key={media.id}>
      {renderMediaContent()}
      <Button
        aria-label="Remove media"
        className="absolute -top-2 -right-2 size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background"
        onClick={() => removeFile(media.id)}
        size="icon"
        type="button"
      >
        <XIcon className="size-3.5" />
      </Button>
    </div>
  );
};

const AddMediaButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="relative flex aspect-square items-center justify-center rounded-md border-2 border-muted-foreground/25 border-dashed bg-transparent">
      <Button onClick={onClick} type="button" variant="outline">
        <PlusIcon />
      </Button>
    </div>
  );
};

interface FileMediaSelectorProps {
  medias: SelectableMediaSchema[];
  removeFile: (id: number) => void;
  onAddMediaClick: () => void;
  compact?: boolean;
  className?: string;
}

export default function FileMediaSelector({
  medias,
  removeFile,
  onAddMediaClick,
  compact,
  className,
}: FileMediaSelectorProps) {
  return (
    <div className="flex w-full flex-col">
      <div
        className={cn(
          "relative flex flex-col items-center not-data-[files]:justify-center overflow-hidden rounded-xl border border-dashed transition-colors has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50",
          compact ? "p-2" : "min-h-52 p-4",
          className ?? "border-input has-[input:focus]:border-ring"
        )}
      >
        <div className="flex w-full flex-col gap-3">
          <div
            className={cn(
              "grid",
              compact
                ? "grid-cols-4 gap-2 md:grid-cols-5"
                : "grid-cols-2 gap-4 md:grid-cols-3"
            )}
          >
            {(medias || []).map((file) => (
              <MediaFile key={file.id} media={file} removeFile={removeFile} />
            ))}
            <AddMediaButton onClick={onAddMediaClick} />
          </div>
        </div>
      </div>
    </div>
  );
}
