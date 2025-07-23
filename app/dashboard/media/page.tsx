import { getMedias } from "@/app/actions/media";
import {
  MediaCard,
  MediaCardContainer,
  MediaCardTitle,
  MediaCardBadges,
} from "@/components/media/media-card";
import { MediaDisplay } from "@/components/media/media-display";
import { MediaActionsDropdown } from "@/components/media/media-actions-dropdown";
import CreateMediaDropdownButton from "./create-media-dropdown-button";
import SearchImagesButton from "./search-images-button";
import MediaFilters from "./media-filters";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
  DashboardHeaderActions,
} from "@/app/dashboard/dashboard-header";

interface Props {
  searchParams: Promise<{ q?: string; tags?: string | string[] }>;
}

export default async function MediasPage({ searchParams }: Props) {
  const { q, tags } = await searchParams;
  const tagsArray = Array.isArray(tags) ? tags : tags ? [tags] : [];
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
        {medias.map((media) => (
          <MediaCard key={media.id}>
            <MediaCardContainer>
              <MediaDisplay media={media} />
              <MediaActionsDropdown
                media={media}
                className="absolute top-2 right-2"
              />
            </MediaCardContainer>
            <div className="p-4 flex-1 flex flex-col gap-3">
              <MediaCardTitle className="text-sm text-center line-clamp-2">
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
