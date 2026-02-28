"use client";

import Image from "next/image";
import type React from "react";
import { createContext, useContext } from "react";
import { ImageIcon, MusicIcon, PlayIcon, VideoIcon } from "lucide-react";
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
  thumbnailSrc?: string;
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

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

interface MultimediaCardProps {
  type: MediaType;
  src: string;
  thumbnailSrc?: string;
  children: React.ReactNode;
  className?: string;
}

function MultimediaCard({
  type,
  src,
  thumbnailSrc,
  children,
  className,
}: MultimediaCardProps) {
  const content = (
    <div data-slot="multimedia-card" className={cn("flex flex-col overflow-hidden rounded-lg border bg-white", className)}>
      {children}
    </div>
  );

  if (type === "audio") {
    return (
      <MultimediaCardContext value={{ type, src, thumbnailSrc }}>
        {content}
      </MultimediaCardContext>
    );
  }

  return (
    <MultimediaCardContext value={{ type, src, thumbnailSrc }}>
      <Dialog>
        {content}
        <DialogContent className="w-fit overflow-hidden gap-0 p-0 sm:max-w-3xl">
          <DialogTitle className="sr-only">Media preview</DialogTitle>
          <MediaPreview src={src} type={type} />
        </DialogContent>
      </Dialog>
    </MultimediaCardContext>
  );
}

// ---------------------------------------------------------------------------
// Shared thumbnail helpers
// ---------------------------------------------------------------------------

const THUMBNAIL_BASE = "relative aspect-video w-full overflow-hidden";

const MEDIA_ICONS = {
  audio: MusicIcon,
  video: VideoIcon,
  image: ImageIcon,
};

interface MultimediaCardThumbnailProps {
  className?: string;
}

/** Blue placeholder with a centered media-type icon. Used when no visual thumbnail is available. */
function MediaPlaceholder({ type }: { type: MediaType }) {
  const Icon = MEDIA_ICONS[type];
  return (
    <div className="flex h-full items-center justify-center bg-blue-500">
      <Icon className="size-10 text-white/70" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image Thumbnail
// ---------------------------------------------------------------------------

function MultimediaCardImageThumbnail({
  className,
}: MultimediaCardThumbnailProps) {
  const { src } = useMultimediaCard();

  return (
    <DialogTrigger
      className={cn(THUMBNAIL_BASE, "cursor-pointer hover:opacity-90", className)}
    >
      <Image
        alt=""
        className="object-cover"
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        src={src}
      />
    </DialogTrigger>
  );
}

// ---------------------------------------------------------------------------
// Video Thumbnail
// ---------------------------------------------------------------------------

function MultimediaCardVideoThumbnail({
  className,
}: MultimediaCardThumbnailProps) {
  const { thumbnailSrc } = useMultimediaCard();

  return (
    <DialogTrigger
      className={cn(THUMBNAIL_BASE, "cursor-pointer hover:opacity-90", className)}
    >
      {thumbnailSrc ? (
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          src={thumbnailSrc}
        />
      ) : (
        <MediaPlaceholder type="video" />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-black/60 p-2.5">
          <PlayIcon className="size-5 fill-white text-white" />
        </div>
      </div>
    </DialogTrigger>
  );
}

// ---------------------------------------------------------------------------
// Audio Thumbnail
// ---------------------------------------------------------------------------

function MultimediaCardAudioThumbnail({
  className,
}: MultimediaCardThumbnailProps) {
  const { src, thumbnailSrc } = useMultimediaCard();

  return (
    <div className={cn(THUMBNAIL_BASE, "group/audio", className)}>
      {thumbnailSrc ? (
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          src={thumbnailSrc}
        />
      ) : (
        <MediaPlaceholder type="audio" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-6 opacity-0 transition-opacity group-hover/audio:opacity-100">
        <audio className="w-full" controls src={src} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Auto-selecting Thumbnail (convenience)
// ---------------------------------------------------------------------------

function MultimediaCardThumbnail({ className }: MultimediaCardThumbnailProps) {
  const { type } = useMultimediaCard();

  if (type === "audio") return <MultimediaCardAudioThumbnail className={className} />;
  if (type === "video") return <MultimediaCardVideoThumbnail className={className} />;
  return <MultimediaCardImageThumbnail className={className} />;
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

interface MultimediaCardTitleProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

function MultimediaCardTitle({
  children,
  className,
  ...props
}: MultimediaCardTitleProps) {
  return (
    <p
      className={cn("truncate px-3 pt-2 pb-2 text-sm font-medium", className)}
      data-slot="multimedia-card-title"
      {...props}
    >
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Actions – slot for buttons at the bottom of the card
// ---------------------------------------------------------------------------

interface MultimediaCardActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {}

function MultimediaCardActions({
  children,
  className,
  ...props
}: MultimediaCardActionsProps) {
  return (
    <div
      className={cn("flex items-center gap-2 px-3 pb-3", className)}
      data-slot="multimedia-card-actions"
      {...props}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal – media preview rendered inside the dialog
// ---------------------------------------------------------------------------

function MediaPreview({ type, src }: { type: "image" | "video"; src: string }) {
  if (type === "video") {
    return (
      <video
        autoPlay
        className="max-h-[80vh] max-w-full"
        controls
        src={src}
      >
        <track kind="captions" />
      </video>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- natural sizing needed for unknown aspect ratios
    <img
      alt=""
      className="max-h-[80vh] max-w-full object-contain"
      src={src}
    />
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

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
