"use client";

import Image from "next/image";
import type React from "react";
import { createContext, useContext } from "react";
import { FileAudioIcon, PlayIcon } from "lucide-react";
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
  return (
    <MultimediaCardContext value={{ type, src, thumbnailSrc }}>
      <Dialog>
        <div data-slot="multimedia-card" className={cn("flex flex-col", className)}>
          {children}
        </div>
        <DialogContent
          className={cn(
            "p-0 overflow-hidden gap-0",
            type === "audio" ? "sm:max-w-md p-6" : "sm:max-w-3xl"
          )}
        >
          <DialogTitle className="sr-only">Media preview</DialogTitle>
          <MediaPreview src={src} type={type} />
        </DialogContent>
      </Dialog>
    </MultimediaCardContext>
  );
}

// ---------------------------------------------------------------------------
// Thumbnail – acts as the dialog trigger
// ---------------------------------------------------------------------------

interface MultimediaCardThumbnailProps {
  className?: string;
}

function MultimediaCardThumbnail({ className }: MultimediaCardThumbnailProps) {
  const { type, src, thumbnailSrc } = useMultimediaCard();

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

      {type === "audio" && (
        <div className="flex h-full items-center justify-center">
          <FileAudioIcon className="size-8 text-muted-foreground" />
        </div>
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

function MediaPreview({ type, src }: { type: MediaType; src: string }) {
  if (type === "video") {
    return (
      <video className="w-full" controls src={src}>
        <track kind="captions" />
      </video>
    );
  }

  if (type === "audio") {
    return <audio className="w-full" controls src={src} />;
  }

  return (
    <Image
      alt=""
      className="w-full object-contain"
      height={900}
      src={src}
      width={1200}
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
