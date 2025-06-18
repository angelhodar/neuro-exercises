import { getMedias } from "@/app/actions/media";
import { VisualRecognitionExerciseClient } from "./visual-recognition-exercise.client";
import { type VisualRecognitionConfig, type ImageData, type ImageCategory } from "./visual-recognition-schema";

interface VisualRecognitionExerciseProps {
  config: VisualRecognitionConfig;
}

async function getImagesFromDatabase(): Promise<ImageData[]> {
  const medias = await getMedias();
  
  return medias.map(media => ({
    id: media.id.toString(),
    name: media.name,
    url: media.blobKey,
    category: media.category as ImageCategory
  }));
}

export async function VisualRecognitionExercise({ config }: VisualRecognitionExerciseProps) {
  const images =  await getImagesFromDatabase();

  return <VisualRecognitionExerciseClient config={config} images={images} />;
}
