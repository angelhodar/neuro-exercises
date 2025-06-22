import { db } from "@/lib/db";
import { OddOneOutConfig, OddOneOutQuestion } from "./odd-one-out-schema";
import { OddOneOutExerciseClient } from "./odd-one-out-exercise.client";
import { inArray } from "drizzle-orm";
import { medias, Media } from "@/lib/db/schema";

interface OddOneOutExerciseProps {
  config: OddOneOutConfig;
}

// Helper to shuffle an array
function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function OddOneOutExercise({ config }: OddOneOutExerciseProps) {
  // 1. Get all unique media IDs from the entire configuration
  const allMediaIds = new Set<number>();
  config.questions.forEach(q => {
    q.patternMedias.forEach(m => allMediaIds.add(m.id));
    if (q.outlierMedia) {
      allMediaIds.add(q.outlierMedia.id);
    }
  });

  // 2. Fetch all unique media details from the database in one go
  const allMediasFromDb = await db.query.medias.findMany({
    where: inArray(medias.id, Array.from(allMediaIds)),
  });
  
  // Create a map for quick lookups
  const mediaMap = new Map<number, Media>(allMediasFromDb.map(media => [media.id, media]));

  // 3. Prepare the questions for the client, ensuring all data is complete
  const clientQuestions = config.questions.map(q_config => {
    const outlierMedia = q_config.outlierMedia ? mediaMap.get(q_config.outlierMedia.id) : null;
    if (!outlierMedia) {
      // This should not happen if config is valid and media exists
      throw new Error(`Outlier media for a question not found in database.`);
    }

    const patternMedias = q_config.patternMedias
      .map(pm_config => mediaMap.get(pm_config.id))
      .filter((m): m is Media => !!m); // Filter out any undefineds and assert type

    if (patternMedias.length !== q_config.patternMedias.length) {
        throw new Error(`One or more pattern medias not found in database.`);
    }

    // Combine and shuffle for display
    const optionsForQuestion = shuffle([...patternMedias, outlierMedia]);
    
    return {
      options: optionsForQuestion,
      correctAnswerId: outlierMedia.id,
    };
  });

  return <OddOneOutExerciseClient questions={clientQuestions} config={config} />;
} 