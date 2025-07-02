import { getMedias } from "@/app/actions/media";
import DashboardMediaCard from "./media-card";
import CreateMediaButton from "./create-media-button";
import MediaFilters from "./media-filters";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
  DashboardHeaderActions,
} from "@/components/dashboard-header";

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
        <MediaFilters />
          <CreateMediaButton />
        </DashboardHeaderActions>
      </DashboardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mt-8">
        {medias.map((media) => (
          <DashboardMediaCard key={media.id} media={media} />
        ))}
      </div>
    </div>
  );
} 