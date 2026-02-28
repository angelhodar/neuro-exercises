"use client";

import { ImageIcon, MusicIcon, PlayIcon, VideoIcon } from "lucide-react";
import type React from "react";
import { createContext, useContext } from "react";
import { MediaImage } from "@/components/media/media-image";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type MediaType = "image" | "video" | "audio";

interface MultimediaCardContextValue {
  type: MediaType;
  src: string;
  alt: string;
  thumbnailSrc?: string;
  previewEnabled: boolean;
}

const MultimediaCardContext = createContext<MultimediaCardContextValue | null>(
  null
);

function useMultimediaCard() {
  const ctx = useContext(MultimediaCardContext);
  if (!ctx) {
    throw new Error(
      "MultimediaCard.* components must be used within MultimediaCard"
    );
  }
  return ctx;
}

type MultimediaCardProps = Omit<MultimediaCardContextValue, "previewEnabled"> &
  React.ComponentProps<typeof Card> & {
    preview?: boolean;
  };

function MultimediaCard({
  type,
  src,
  alt,
  thumbnailSrc,
  preview = true,
  children,
  className,
  ...props
}: MultimediaCardProps) {
  const previewEnabled = preview && type !== "audio";

  const content = (
    <Card
      className={cn("gap-0 rounded-lg py-0", className)}
      data-slot="multimedia-card"
      {...props}
    >
      {children}
    </Card>
  );

  if (!previewEnabled) {
    return (
      <MultimediaCardContext
        value={{ type, src, alt, thumbnailSrc, previewEnabled: false }}
      >
        {content}
      </MultimediaCardContext>
    );
  }

  return (
    <MultimediaCardContext
      value={{ type, src, alt, thumbnailSrc, previewEnabled: true }}
    >
      <Dialog>
        {content}
        <DialogContent className="w-fit gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogTitle className="sr-only">Media preview</DialogTitle>
          <MediaPreview alt={alt} src={src} type={type} />
        </DialogContent>
      </Dialog>
    </MultimediaCardContext>
  );
}

const THUMBNAIL_BASE = "relative aspect-[4/3] w-full overflow-hidden";

const MEDIA_ICONS = {
  audio: MusicIcon,
  video: VideoIcon,
  image: ImageIcon,
};

interface MultimediaCardThumbnailProps {
  className?: string;
}

function MediaPlaceholder({ type }: { type: MediaType }) {
  const Icon = MEDIA_ICONS[type];
  return (
    <div className="flex h-full items-center justify-center bg-blue-500">
      <Icon className="size-10 text-white/70" />
    </div>
  );
}

function MultimediaCardImageThumbnail(props: MultimediaCardThumbnailProps) {
  const { src, alt, previewEnabled } = useMultimediaCard();

  const className = cn(
    THUMBNAIL_BASE,
    previewEnabled && "cursor-pointer hover:opacity-90",
    props.className
  );

  if (!previewEnabled) {
    return (
      <div className={className} data-slot="multimedia-card-thumbnail">
        <MediaImage alt={alt} src={src} />
      </div>
    );
  }

  return (
    <DialogTrigger className={className} data-slot="multimedia-card-thumbnail">
      <MediaImage alt={alt} src={src} />
    </DialogTrigger>
  );
}

function MultimediaCardVideoThumbnail(props: MultimediaCardThumbnailProps) {
  const { alt, thumbnailSrc, previewEnabled } = useMultimediaCard();

  const className = cn(
    THUMBNAIL_BASE,
    previewEnabled && "cursor-pointer hover:opacity-90",
    props.className
  );

  const inner = (
    <>
      {thumbnailSrc ? (
        <MediaImage alt={alt} src={thumbnailSrc} />
      ) : (
        <MediaPlaceholder type="video" />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-black/60 p-2.5">
          <PlayIcon className="size-5 fill-white text-white" />
        </div>
      </div>
    </>
  );

  if (!previewEnabled) {
    return (
      <div className={className} data-slot="multimedia-card-thumbnail">
        {inner}
      </div>
    );
  }

  return (
    <DialogTrigger className={className} data-slot="multimedia-card-thumbnail">
      {inner}
    </DialogTrigger>
  );
}

function MultimediaCardAudioThumbnail(props: MultimediaCardThumbnailProps) {
  const { src, alt, thumbnailSrc } = useMultimediaCard();

  return (
    <div
      className={cn(THUMBNAIL_BASE, "group/audio", props.className)}
      data-slot="multimedia-card-thumbnail"
    >
      {thumbnailSrc ? (
        <MediaImage alt={alt} src={thumbnailSrc} />
      ) : (
        <MediaPlaceholder type="audio" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-6 opacity-0 transition-opacity group-hover/audio:opacity-100">
        <audio className="w-full" controls preload="none" src={src}>
          <track kind="captions" />
        </audio>
      </div>
    </div>
  );
}

function MultimediaCardThumbnail(props: MultimediaCardThumbnailProps) {
  const { type } = useMultimediaCard();

  if (type === "audio") {
    return <MultimediaCardAudioThumbnail {...props} />;
  }
  if (type === "video") {
    return <MultimediaCardVideoThumbnail {...props} />;
  }
  return <MultimediaCardImageThumbnail {...props} />;
}

function MultimediaCardTitle({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("truncate px-3 pt-2 pb-2 font-medium text-sm", className)}
      data-slot="multimedia-card-title"
      {...props}
    />
  );
}

function MultimediaCardActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-2 px-3 pb-3", className)}
      data-slot="multimedia-card-actions"
      {...props}
    />
  );
}

function MediaPreview({
  type,
  src,
  alt,
}: {
  type: "image" | "video";
  src: string;
  alt: string;
}) {
  if (type === "video") {
    return (
      <video autoPlay className="max-h-[80vh] max-w-full" controls src={src}>
        <track kind="captions" />
      </video>
    );
  }

  return (
    // biome-ignore lint/performance/noImgElement: natural sizing needed for unknown aspect ratios
    // biome-ignore lint/correctness/useImageSize: fill not applicable for native img
    <img
      alt={alt}
      className="max-h-[80vh] max-w-full object-contain"
      src={src}
    />
  );
}

export {
  MultimediaCard,
  MultimediaCardActions,
  MultimediaCardAudioThumbnail,
  MultimediaCardImageThumbnail,
  MultimediaCardThumbnail,
  MultimediaCardTitle,
  MultimediaCardVideoThumbnail,
  type MediaType,
};
