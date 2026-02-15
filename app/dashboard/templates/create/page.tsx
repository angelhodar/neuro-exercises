import { getExercises } from "@/app/actions/exercises";
import { exerciseHasAssets } from "@/app/exercises/loader";
import CreateTemplateForm from "./create-template-form";

export default async function CreateTemplatePage() {
  const exercises = await getExercises();

  const exerciseAssetChecks = await Promise.all(
    exercises.map(async (exercise) => ({
      ...exercise,
      hasAssets: await exerciseHasAssets(exercise.slug),
    }))
  );

  const filteredExercises = exerciseAssetChecks.filter(
    (exercise) => exercise.hasAssets
  );

  return <CreateTemplateForm exercises={filteredExercises} />;
}
