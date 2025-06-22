import { getMedias } from "@/app/actions/media";
import DashboardMediaCard from "./media-card";
import CreateMediaButton from "./create-media-button";
import MediaSearchInput from "./media-search-input";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
  DashboardHeaderActions,
} from "@/components/dashboard-header";

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
          <MediaSearchInput />
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