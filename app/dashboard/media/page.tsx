import { getMedias } from "@/app/actions/media";
import {
  DashboardHeader,
  DashboardHeaderActions,
  DashboardHeaderDescription,
  DashboardHeaderTitle,
} from "@/app/dashboard/dashboard-header";
import { MediaActionsDropdown } from "@/components/media/media-actions-dropdown";
import {
  MediaCard,
  MediaCardBadges,
  MediaCardContainer,
  MediaCardTitle,
} from "@/components/media/media-card";
import { MediaDisplay } from "@/components/media/media-display";
import CreateMediaDropdownButton from "./create-media-dropdown-button";
import MediaFilters from "./media-filters";
import SearchImagesButton from "./search-images-button";

interface Props {
  searchParams: Promise<{ q?: string; tags?: string | string[] }>;
}

export default async function MediasPage({ searchParams }: Props) {
  const { q, tags } = await searchParams;
  let tagsArray: string[];
  if (Array.isArray(tags)) {
    tagsArray = tags;
  } else if (tags) {
    tagsArray = [tags];
  } else {
    tagsArray = [];
  }
  const medias = await getMedias(q, tagsArray);

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
          <MediaFilters key={tagsArray.join(",")} />
          <SearchImagesButton />
          <CreateMediaDropdownButton />
        </DashboardHeaderActions>
      </DashboardHeader>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {medias.map((media) => (
          <MediaCard key={media.id}>
            <MediaCardContainer>
              <MediaDisplay media={media} />
              <MediaActionsDropdown
                className="absolute top-2 right-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover/card:opacity-100"
                media={media}
              />
            </MediaCardContainer>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <MediaCardTitle className="line-clamp-2">
                {media.name}
              </MediaCardTitle>
              {media.tags && media.tags.length > 0 && (
                <MediaCardBadges badges={media.tags} />
              )}
            </div>
          </MediaCard>
        ))}
      </div>
    </div>
  );
}
