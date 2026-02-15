import { getMediasByTags } from "@/app/actions/media";
import type {
  ImageData,
  VisualRecognitionConfig,
} from "./visual-recognition.schema";
import { VisualRecognitionExerciseClient } from "./visual-recognition-exercise.client";

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

export async function Exercise({ config }: VisualRecognitionExerciseProps) {
  const images = await getImagesForExercise(config.tags);
  return <VisualRecognitionExerciseClient config={config} images={images} />;
}
