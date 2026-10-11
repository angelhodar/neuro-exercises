import { validateUIMessages } from "ai";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getExerciseById } from "@/app/actions/exercises";
import {
  type ExerciseRefinementMessage,
  exerciseRefinementAgent,
} from "@/lib/ai/refinement/agent";
import {
  findRequirementDraft,
  listRequirementDrafts,
} from "@/lib/ai/refinement/draft-repository";
import { requireAuth } from "@/lib/auth/require-auth";
import CreateExercise from "./create-exercise";

export default async function CreateExercisePage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  const user = await requireAuth();
  const { draft: id } = await searchParams;
  const drafts = await listRequirementDrafts(user.id);
  if (!id) {
    return <CreateExercise drafts={drafts} key="new" />;
  }
  if (!z.uuid().safeParse(id).success) {
    notFound();
  }
  const draft = await findRequirementDraft(id, user.id);
  if (!draft) {
    notFound();
  }
  if (draft.createdExerciseId) {
    const exercise = await getExerciseById(draft.createdExerciseId);
    if (exercise) {
      redirect(`/dashboard/exercises/${exercise.slug}`);
    }
  }
  const messages = await validateUIMessages<ExerciseRefinementMessage>({
    messages: draft.messages,
    tools: exerciseRefinementAgent.tools,
  });
  return (
    <CreateExercise
      drafts={drafts}
      initialDraft={{ id: draft.id, messages, revision: draft.revision }}
      key={draft.id}
    />
  );
}
