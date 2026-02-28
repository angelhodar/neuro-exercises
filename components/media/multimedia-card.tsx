"use client";

import Image from "next/image";
import type React from "react";
import { createContext, useContext } from "react";
import { PlayIcon } from "lucide-react";
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
    <div data-slot="multimedia-card" className={cn("flex flex-col", className)}>
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
// Thumbnail – dialog trigger for image/video, inline player for audio
// ---------------------------------------------------------------------------

const WAVE_HEIGHTS = [35, 55, 30, 70, 45, 80, 60, 90, 50, 75, 40, 85, 55, 65, 45, 70, 35, 60, 50, 80];

interface MultimediaCardThumbnailProps {
  className?: string;
}

function MultimediaCardThumbnail({ className }: MultimediaCardThumbnailProps) {
  const { type, src, thumbnailSrc } = useMultimediaCard();

  if (type === "audio") {
    return (
      <div
        className={cn(
          "group/audio relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500",
          className
        )}
      >
        <div className="flex h-full items-center justify-center gap-[3px] px-6">
          {WAVE_HEIGHTS.map((h, i) => (
            <div
              key={`wave-${i}`}
              className="w-1 rounded-full bg-white/30"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-6 opacity-0 transition-opacity group-hover/audio:opacity-100">
          <audio className="w-full" controls src={src} />
        </div>
      </div>
    );
  }

  return (
    <DialogTrigger
      className={cn(
        "relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg bg-muted transition-opacity hover:opacity-90",
        className
      )}
    >
      {type === "image" && (
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          src={src}
        />
      )}

      {type === "video" && (
        <>
          {thumbnailSrc ? (
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              src={thumbnailSrc}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/60 p-2.5">
              <PlayIcon className="size-5 fill-white text-white" />
            </div>
          </div>
        </>
      )}
    </DialogTrigger>
  );
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
      className={cn("mt-1.5 truncate text-sm font-medium", className)}
      data-slot="multimedia-card-title"
      {...props}
    >
      {children}
    </p>
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
  MultimediaCardThumbnail,
  MultimediaCardTitle,
  type MediaType,
};
