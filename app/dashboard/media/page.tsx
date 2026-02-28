import { getMedias } from "@/app/actions/media";
import {
  DashboardHeader,
  DashboardHeaderActions,
  DashboardHeaderDescription,
  DashboardHeaderTitle,
} from "@/app/dashboard/dashboard-header";
import { MediaActionsDropdown } from "@/components/media/media-actions-dropdown";
import { MediaCardBadges } from "@/components/media/media-card";
import {
  type MediaType,
  MultimediaCard,
  MultimediaCardThumbnail,
  MultimediaCardTitle,
} from "@/components/media/multimedia-card";
import { createBlobUrl } from "@/lib/utils";
import CreateMediaDropdownButton from "./create-media-dropdown-button";
import MediaSearch from "./media-filters";

function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith("audio/")) {
    return "audio";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  return "image";
}

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function MediasPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const medias = await getMedias(q);

  return (
    <div className="p-6">
      <DashboardHeader>
        <div>
          <DashboardHeaderTitle>Biblioteca multimedia</DashboardHeaderTitle>
          <DashboardHeaderDescription>
            Gestiona archivos multimedia para los ejercicios
          </DashboardHeaderDescription>
        </div>
        <DashboardHeaderActions>
          <MediaSearch />
          <CreateMediaDropdownButton />
        </DashboardHeaderActions>
      </DashboardHeader>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {medias.map((media) => (
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
            {media.tags && media.tags.length > 0 && (
              <div className="px-3 pb-3">
                <MediaCardBadges badges={media.tags} />
              </div>
            )}
          </MultimediaCard>
        ))}
      </div>
    </div>
  );
}
