import { getMedias } from "@/app/actions/media";
import CategoryFilter from "./category-filter";
import MediaCard from "./media-card";
import CreateMediaButton from "./create-media-button";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function MediasPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const medias = await getMedias(category);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4">Gestión de archivos multimedia</h1>
        <div className="flex gap-4 mb-6 items-end">
          <CategoryFilter selectedCategory={category || ""} />
          <CreateMediaButton />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mt-8">
        {medias.map((media) => (
          <MediaCard key={media.id} media={media} />
        ))}
      </div>
    </div>
  );
} 