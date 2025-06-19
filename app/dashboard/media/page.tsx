import { getMedias } from "@/app/actions/media";
import CategoryFilter from "./category-filter";
import MediaCard from "./media-card";
import CreateMediaButton from "./create-media-button";
import {
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardHeaderDescription,
  DashboardHeaderActions,
} from "@/components/dashboard-header";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function MediasPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const medias = await getMedias(category);

  return (
    <div className="p-6">
      <DashboardHeader>
        <div>
          <DashboardHeaderTitle>Gestión de archivos multimedia</DashboardHeaderTitle>
          <DashboardHeaderDescription>
            Gestiona y comparte archivos multimedia con tus usuarios.
          </DashboardHeaderDescription>
        </div>
        <DashboardHeaderActions>
          <CategoryFilter selectedCategory={category || ""} />
          <CreateMediaButton />
        </DashboardHeaderActions>
      </DashboardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mt-8">
        {medias.map((media) => (
          <MediaCard key={media.id} media={media} />
        ))}
      </div>
    </div>
  );
} 