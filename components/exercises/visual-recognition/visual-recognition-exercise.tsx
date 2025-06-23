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
  return <VisualRecognitionExerciseClient config={config} images={images} />;
}
