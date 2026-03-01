"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { getMedias } from "@/app/actions/media";
import { MediaActionsDropdown } from "@/components/media/media-actions-dropdown";
import {
  type MediaType,
  MultimediaCard,
  MultimediaCardThumbnail,
  MultimediaCardTitle,
} from "@/components/media/multimedia-card";
import { Spinner } from "@/components/ui/spinner";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { createBlobUrl } from "@/lib/utils";

const PAGE_SIZE = 20;

function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith("audio/")) {
    return "audio";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  return "image";
}

export function MediaGrid() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || undefined;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["media", "list", query],
      queryFn: ({ pageParam }) => getMedias(query, PAGE_SIZE, pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage, _allPages, lastPageParam) =>
        lastPage.length < PAGE_SIZE ? undefined : lastPageParam + PAGE_SIZE,
    });

  const sentinelRef = useIntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    { rootMargin: "200px" }
  );

  const allMedia = data?.pages.flat() ?? [];

  if (status === "pending") {
    return (
      <div className="mt-16 flex justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="mt-16 text-center text-muted-foreground">
        Error al cargar los medios
      </p>
    );
  }

  if (allMedia.length === 0) {
    return (
      <p className="mt-16 text-center text-muted-foreground">
        {query
          ? "No se encontraron resultados"
          : "No hay archivos multimedia aún"}
      </p>
    );
  }

  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {allMedia.map((media) => (
          <MultimediaCard
            alt={media.name}
            key={media.id}
            src={createBlobUrl(media.blobKey)}
            thumbnailSrc={
              media.thumbnailKey ? createBlobUrl(media.thumbnailKey) : undefined
            }
            type={getMediaType(media.mimeType)}
          >
            <div className="relative">
              <MultimediaCardThumbnail />
              <MediaActionsDropdown
                className="absolute top-2 right-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover/card:opacity-100"
                media={media}
              />
            </div>
            <MultimediaCardTitle className="line-clamp-2">
              {media.name}
            </MultimediaCardTitle>
          </MultimediaCard>
        ))}
      </div>

      <div className="mt-4 flex justify-center py-4" ref={sentinelRef}>
        {isFetchingNextPage && (
          <Spinner className="size-6 text-muted-foreground" />
        )}
      </div>
    </>
  );
}
