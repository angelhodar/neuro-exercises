import CreateTemplateForm from "./create-template-form";
import { getExercises } from "@/app/actions/exercises";

export default async function CreateTemplatePage() {
  const exercises = await getExercises();
  
  return <CreateTemplateForm exercises={exercises} />
} 