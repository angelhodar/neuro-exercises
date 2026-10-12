"use client";

import { Loader2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { formatExerciseBrief } from "@/lib/ai/refinement/format-brief";
import type { ExerciseBrief } from "@/lib/schemas/exercise-refinement";
import {
  useExerciseCreationActions,
  useExerciseCreationState,
} from "./exercise-creation-context";

export function RequirementsDocument({
  brief,
  children,
}: {
  brief: ExerciseBrief;
  children?: ReactNode;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-card">
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="prose prose-sm prose-li:my-1 prose-h1:mt-0 prose-headings:mt-6 prose-headings:mb-2 max-w-none">
          <Markdown remarkPlugins={[remarkGfm]}>
            {formatExerciseBrief(brief)}
          </Markdown>
        </div>
      </div>
      {children}
    </section>
  );
}

export function ExerciseCreationControls() {
  const { canUseBrief, creationError, creating, requirementsStatus } =
    useExerciseCreationState();
  const { handleCreate } = useExerciseCreationActions();

  return (
    <footer className="flex items-center justify-between gap-4 border-t p-4">
      {creationError ? (
        <p className="text-destructive text-sm" role="alert">
          {creationError}
        </p>
      ) : (
        <p className="text-muted-foreground text-sm" role="status">
          {requirementsStatus}
        </p>
      )}
      <Button disabled={!canUseBrief || creating} onClick={handleCreate}>
        {creating ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {creating ? "Preparando ejercicio..." : "Crear ejercicio"}
      </Button>
    </footer>
  );
}
