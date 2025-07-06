import { OddOneOutConfig } from "./odd-one-out-schema";
import { OddOneOutExerciseClient } from "./odd-one-out-exercise.client";
import { db } from "@/lib/db";
import { medias } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { SelectableMediaSchema } from "@/lib/schemas/medias";

interface OddOneOutExerciseProps {
  config: OddOneOutConfig;
}

export async function OddOneOutExercise({ config }: OddOneOutExerciseProps) {
  const allMediaIds = Array.from(
    new Set(
      config.questions.flatMap((q) => [
        ...q.patternMedias.map((m) => m.id),
        ...q.outlierMedia.map((m) => m.id),
      ])
    )
  )

  const allMediasFromDb = await db.query.medias.findMany({
    columns: {
      id: true,
      name: true,
      blobKey: true,
      tags: true,
    },
    where: inArray(medias.id, allMediaIds),
  }) as SelectableMediaSchema[];

  return <OddOneOutExerciseClient config={config} medias={allMediasFromDb} />;
} 