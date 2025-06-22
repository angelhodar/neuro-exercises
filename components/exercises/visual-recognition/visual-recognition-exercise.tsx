import { getMediasByTags } from "@/app/actions/media";
import { VisualRecognitionExerciseClient } from "./visual-recognition-exercise.client";
import { type VisualRecognitionConfig, type ImageData } from "./visual-recognition-schema";

interface VisualRecognitionExerciseProps {
  config: VisualRecognitionConfig;
}

async function getImagesForExercise(tags: string[]): Promise<ImageData[]> {
  const medias = await getMediasByTags(tags);
  
  return medias.map((media) => ({
    id: media.id.toString(),
    name: media.name,
    url: media.blobKey, 
    tags: media.tags ?? [],
  }));
}

export async function VisualRecognitionExercise({ config }: VisualRecognitionExerciseProps) {
  const images = await getImagesForExercise(config.tags);

  if (images.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="font-bold text-red-600">No se encontraron imágenes</p>
        <p className="text-muted-foreground">
          No se encontraron imágenes con las etiquetas: {config.tags.join(", ")}.
        </p>
        <p className="text-muted-foreground mt-2">
          Por favor, sube imágenes con estas etiquetas para poder realizar el ejercicio.
        </p>
      </div>
    );
  }

  return <VisualRecognitionExerciseClient config={config} images={images} />;
}
