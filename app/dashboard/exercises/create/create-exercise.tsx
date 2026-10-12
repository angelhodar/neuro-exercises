"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Brain, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  type ExerciseIdeaSchema,
  exerciseIdeaSchema,
} from "@/lib/schemas/exercises";
import { RefinementConversation } from "./refinement-conversation";
import { RequirementsDocument } from "./requirements-document";
import {
  type RequirementDraft,
  useExerciseCreation,
} from "./use-exercise-creation";

export default function CreateExercise({
  initialDraft,
  drafts,
}: {
  initialDraft?: RequirementDraft;
  drafts: { id: string; title: string; updatedAt: Date }[];
}) {
  const workflow = useExerciseCreation(initialDraft);
  const { started, displayBrief, creating, creationError, canUseBrief } =
    workflow;
  const isMobile = useIsMobile();
  const form = useForm<ExerciseIdeaSchema>({
    defaultValues: { prompt: "" },
    resolver: zodResolver(exerciseIdeaSchema),
  });
  const conversation = (
    <RefinementConversation
      addToolOutput={workflow.addRefinementToolOutput}
      busy={workflow.busy}
      canRevise={canUseBrief}
      creating={creating}
      error={workflow.error}
      hasBrief={Boolean(displayBrief)}
      messages={workflow.messages}
      onRetry={workflow.retryRefinement}
      onRevise={workflow.reviseBrief}
      status={workflow.status}
      stop={workflow.stop}
    />
  );
  return (
    <div
      className={
        started
          ? "-m-4 h-[calc(100vh-3rem)] w-[calc(100%+2rem)] bg-card"
          : "-m-4 min-h-[calc(100vh-3rem)] w-[calc(100%+2rem)] bg-linear-to-b from-blue-50/70 via-white to-white px-4 py-8 pb-12 sm:px-6 md:py-10 md:pb-16 lg:px-8"
      }
    >
      <main className={started ? "h-full w-full" : "mx-auto w-full max-w-4xl"}>
        {started ? (
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b px-5 py-2 text-muted-foreground text-xs">
              <span>El borrador se guarda al enviar cada respuesta.</span>
              <Link
                className="text-primary hover:underline"
                href="/dashboard/exercises/create"
                onClick={workflow.showDrafts}
              >
                Mis borradores
              </Link>
            </div>
            {workflow.needsContinuation ? (
              <div className="flex shrink-0 items-center justify-between gap-4 border-b px-5 py-2 text-sm">
                <span>
                  La revisión quedó pendiente. Puedes continuar el borrador.
                </span>
                <Button
                  onClick={workflow.retryRefinement}
                  size="sm"
                  variant="outline"
                >
                  Continuar borrador
                </Button>
              </div>
            ) : null}
            <div className="min-h-0 flex-1">
              {displayBrief ? (
                <ResizablePanelGroup
                  className="overflow-hidden"
                  orientation={isMobile ? "vertical" : "horizontal"}
                >
                  <ResizablePanel defaultSize={45} minSize={30}>
                    {conversation}
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={55} minSize={30}>
                    <RequirementsDocument
                      brief={displayBrief.input.brief}
                      canCreate={canUseBrief}
                      creating={creating}
                      creationError={creationError}
                      onCreate={workflow.handleCreate}
                      statusMessage={workflow.requirementsStatus}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              ) : (
                <div className="mx-auto h-full w-full max-w-3xl">
                  {conversation}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-12 md:mt-20">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-blue-700/20 shadow-lg">
                <Brain className="size-6" />
              </div>
              <h1 className="font-bold text-3xl text-blue-950 tracking-tight md:text-5xl">
                ¿Qué ejercicio quieres crear?
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base text-blue-900/65 md:text-lg">
                Describe la idea inicial. Antes de construirla, afinaremos solo
                los detalles que puedan cambiar el resultado.
              </p>
            </div>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(workflow.startRefinement)}
              >
                {workflow.draftError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {workflow.draftError}
                  </p>
                ) : null}
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative rounded-2xl border border-blue-200 bg-white shadow-blue-900/5 shadow-xl transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                          <Textarea
                            {...field}
                            className="min-h-52 resize-none border-0 bg-transparent p-5 pb-16 text-base shadow-none focus-visible:ring-0 md:text-lg"
                            placeholder="Por ejemplo: un ejercicio de atención sostenida en el que aparezcan animales y el paciente responda solo cuando vea un gato..."
                            rows={8}
                          />
                          <div className="absolute right-3 bottom-3 flex items-center gap-2">
                            <Button
                              disabled={form.formState.isSubmitting}
                              type="submit"
                            >
                              {form.formState.isSubmitting ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <Sparkles />
                              )}
                              Afinar idea
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            {drafts.length > 0 ? (
              <section className="mt-10 space-y-3">
                <h2 className="font-semibold">Mis borradores</h2>
                <div className="grid gap-3">
                  {drafts.map((draft) => (
                    <Link
                      className="rounded-xl border bg-card p-4 text-sm transition-colors hover:bg-muted"
                      href={`/dashboard/exercises/create?draft=${draft.id}`}
                      key={draft.id}
                    >
                      <p className="line-clamp-2 font-medium">{draft.title}</p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        Actualizado{" "}
                        {new Date(draft.updatedAt).toLocaleDateString("es-ES")}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
