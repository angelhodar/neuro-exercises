"use client";

import { useChat } from "@ai-sdk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ChatAddToolOutputFunction,
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { ArrowRight, Brain, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { createRequirementDraft } from "@/app/actions/exercise-requirement-drafts";
import { createExercise } from "@/app/actions/exercises";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ExerciseRefinementMessage } from "@/lib/ai/refinement/agent";
import { formatExerciseBrief } from "@/lib/ai/refinement/format-brief";
import { getRefinementState } from "@/lib/ai/refinement/state";
import type {
  AskUserQuestionInput,
  AskUserQuestionOutput,
  ExerciseBrief,
} from "@/lib/schemas/exercise-refinement";
import {
  exerciseRevisionSchema,
  MAX_BRIEF_FEEDBACK_LENGTH,
} from "@/lib/schemas/exercise-refinement";
import {
  type ExerciseIdeaSchema,
  exerciseIdeaSchema,
} from "@/lib/schemas/exercises";

type AskQuestionPart = Extract<
  ExerciseRefinementMessage["parts"][number],
  { type: "tool-askUserQuestion" }
>;
type ProposeBriefPart = Extract<
  ExerciseRefinementMessage["parts"][number],
  { type: "tool-proposeExerciseBrief" }
>;
type RefinementTextPart = Extract<
  ExerciseRefinementMessage["parts"][number],
  { type: "text" }
>;

function getPendingSiblingBriefs(
  part: AskQuestionPart | ProposeBriefPart | RefinementTextPart,
  pendingBriefs: ProposeBriefPart[]
) {
  if (part.type === "tool-askUserQuestion") {
    return pendingBriefs;
  }
  if (part.type === "tool-proposeExerciseBrief") {
    return pendingBriefs.filter(
      (brief) => brief.toolCallId !== part.toolCallId
    );
  }
  return [];
}

const questionAnswerSchema = z
  .object({
    freeText: z.string().trim().max(1000),
    selected: z.array(z.string()).max(4),
  })
  .refine(
    (answer) => answer.selected.length > 0 || answer.freeText.length > 0,
    {
      message: "Selecciona una opción o escribe una respuesta",
      path: ["selected"],
    }
  );

type QuestionAnswerForm = z.infer<typeof questionAnswerSchema>;

function shouldContinueRefinement({
  messages,
}: {
  messages: ExerciseRefinementMessage[];
}) {
  const lastMessage = messages.at(-1);
  if (lastMessage?.role !== "assistant") {
    return false;
  }

  if (!lastAssistantMessageIsCompleteWithToolCalls({ messages })) {
    return false;
  }

  const latestStepStart = lastMessage.parts.findLastIndex(
    (part) => part.type === "step-start"
  );
  const latestToolParts = lastMessage.parts
    .slice(latestStepStart + 1)
    .filter(
      (part) =>
        part.type === "tool-askUserQuestion" ||
        part.type === "tool-proposeExerciseBrief"
    );

  return (
    latestToolParts.length > 0 &&
    latestToolParts.every(
      (part) =>
        part.state === "output-error" ||
        (part.state === "output-available" &&
          (part.type === "tool-askUserQuestion" || !part.output.accepted))
    )
  );
}

function withoutUnfinishedStep(messages: ExerciseRefinementMessage[]) {
  const lastMessage = messages.at(-1);
  if (lastMessage?.role !== "assistant") {
    return messages;
  }

  const latestStepStart = lastMessage.parts.findLastIndex(
    (part) => part.type === "step-start"
  );
  const hasUnfinishedTool = lastMessage.parts
    .slice(latestStepStart + 1)
    .some(
      (part) =>
        (part.type === "tool-askUserQuestion" ||
          part.type === "tool-proposeExerciseBrief") &&
        (part.state === "input-available" || part.state === "input-streaming")
    );
  if (!hasUnfinishedTool) {
    return messages;
  }

  if (latestStepStart < 0) {
    return messages.slice(0, -1);
  }

  return [
    ...messages.slice(0, -1),
    {
      ...lastMessage,
      parts: lastMessage.parts.slice(0, latestStepStart),
    },
  ];
}

function QuestionAnswer({ answer }: { answer: AskUserQuestionOutput }) {
  return (
    <div className="flex flex-wrap gap-2">
      {answer.selected.map((selection) => (
        <span
          className="rounded-full bg-blue-100 px-2.5 py-1 font-medium text-blue-800 text-xs"
          key={selection}
        >
          {selection}
        </span>
      ))}
      {answer.freeText ? (
        <p className="w-full whitespace-pre-wrap text-sm">{answer.freeText}</p>
      ) : null}
    </div>
  );
}

function QuestionCard({
  disabled,
  input,
  onAnswer,
}: {
  disabled: boolean;
  input: AskUserQuestionInput;
  onAnswer: (answer: AskUserQuestionOutput) => void;
}) {
  const form = useForm<QuestionAnswerForm>({
    defaultValues: { freeText: "", selected: [] },
    resolver: zodResolver(questionAnswerSchema),
  });
  const selected = form.watch("selected");
  const freeText = form.watch("freeText");
  const error =
    form.formState.errors.selected?.message ??
    form.formState.errors.freeText?.message;

  function toggleSelection(label: string, checked: boolean) {
    let nextSelected: string[] = [];
    if (input.multiSelect) {
      nextSelected = checked
        ? [...selected, label]
        : selected.filter((selection) => selection !== label);
    } else if (checked) {
      nextSelected = [label];
    }

    form.setValue("selected", nextSelected, { shouldValidate: true });
  }

  function submitAnswer(answer: QuestionAnswerForm) {
    onAnswer({
      freeText: answer.freeText || undefined,
      selected: answer.selected,
    });
  }

  return (
    <Card className="border-blue-100 bg-white shadow-sm" size="sm">
      <CardContent>
        <Form {...form}>
          <Questionnaire
            items={[
              {
                choices: input.options?.map((option) => ({
                  disabled,
                  value: option.label,
                })),
                name: "answer",
              },
            ]}
            onSubmit={form.handleSubmit(submitAnswer)}
            shortcuts="letters"
          >
            <QuestionnaireItem
              invalid={Boolean(error)}
              multiple={input.multiSelect}
              name="answer"
            >
              <QuestionnaireTitle>{input.question}</QuestionnaireTitle>
              <QuestionnaireDescription>
                Puedes elegir una opción, escribir un matiz o combinar ambas.
              </QuestionnaireDescription>
              <QuestionnaireChoices>
                {input.options?.map((option) => (
                  <QuestionnaireChoice
                    checked={selected.includes(option.label)}
                    disabled={disabled}
                    key={option.label}
                    onChange={(event) =>
                      toggleSelection(option.label, event.currentTarget.checked)
                    }
                    value={option.label}
                  >
                    <span className="font-medium">{option.label}</span>
                    {option.description ? (
                      <QuestionnaireChoiceDescription>
                        {option.description}
                      </QuestionnaireChoiceDescription>
                    ) : null}
                  </QuestionnaireChoice>
                ))}
                <FormField
                  control={form.control}
                  name="freeText"
                  render={({ field }) => (
                    <QuestionnaireInput
                      {...field}
                      aria-label="Añadir una respuesta personalizada"
                      disabled={disabled}
                      placeholder={
                        input.options
                          ? "Añade un matiz o escribe otra respuesta..."
                          : "Escribe tu respuesta..."
                      }
                    />
                  )}
                />
              </QuestionnaireChoices>
              <QuestionnaireError>{error}</QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireActions>
              <Button
                className="col-start-3 justify-self-end"
                disabled={
                  disabled || (selected.length === 0 && freeText.trim() === "")
                }
                onClick={form.handleSubmit(submitAnswer)}
                type="button"
              >
                Continuar
                <ArrowRight />
              </Button>
            </QuestionnaireActions>
          </Questionnaire>
        </Form>
      </CardContent>
    </Card>
  );
}

function RequirementsDocument({
  brief,
  canCreate,
  creationError,
  creating,
  onCreate,
  statusMessage,
}: {
  brief: ExerciseBrief;
  canCreate: boolean;
  creationError: string | null;
  creating: boolean;
  onCreate: () => void;
  statusMessage: string | undefined;
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
      <footer className="flex items-center justify-between gap-4 border-t p-4">
        {creationError ? (
          <p className="text-destructive text-sm" role="alert">
            {creationError}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm" role="status">
            {statusMessage}
          </p>
        )}
        <Button disabled={!canCreate || creating} onClick={onCreate}>
          {creating ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {creating ? "Preparando ejercicio..." : "Crear ejercicio"}
        </Button>
      </footer>
    </section>
  );
}

function ToolPart({
  addToolOutput,
  disabled,
  part,
  pendingSiblingBriefs,
}: {
  addToolOutput: ChatAddToolOutputFunction<ExerciseRefinementMessage>;
  disabled: boolean;
  part: AskQuestionPart | ProposeBriefPart;
  pendingSiblingBriefs: ProposeBriefPart[];
}) {
  if (part.state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-white p-4 text-muted-foreground text-sm">
        <Loader2 className="size-4 animate-spin" />
        Preparando la siguiente propuesta...
      </div>
    );
  }

  if (part.type === "tool-askUserQuestion") {
    if (part.state === "input-available") {
      return (
        <QuestionCard
          disabled={disabled}
          input={part.input}
          onAnswer={(output) => {
            addToolOutput({
              output,
              tool: "askUserQuestion",
              toolCallId: part.toolCallId,
            });
            for (const briefPart of pendingSiblingBriefs) {
              addToolOutput({
                output: {
                  accepted: false,
                  feedback:
                    "Reformula la propuesta incorporando las respuestas pendientes.",
                },
                tool: "proposeExerciseBrief",
                toolCallId: briefPart.toolCallId,
              });
            }
          }}
        />
      );
    }
    if (part.state === "output-available") {
      return (
        <Card className="border-border/60 bg-muted/30" size="sm">
          <CardHeader>
            <CardTitle>{part.input.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionAnswer answer={part.output} />
          </CardContent>
        </Card>
      );
    }
  }

  if (part.type === "tool-proposeExerciseBrief") {
    if (part.state === "input-available") {
      return null;
    }
    if (part.state === "output-available") {
      return (
        <Message align="end">
          <MessageContent>
            <Bubble align="end" variant="default">
              <BubbleContent>{part.output.feedback}</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      );
    }
  }

  if (part.state === "output-error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
        {part.errorText}
      </div>
    );
  }

  return null;
}

function AssistantPart({
  addToolOutput,
  disabled,
  hasPendingQuestion,
  part,
  pendingSiblingBriefs,
}: {
  addToolOutput: ChatAddToolOutputFunction<ExerciseRefinementMessage>;
  disabled: boolean;
  hasPendingQuestion: boolean;
  part: AskQuestionPart | ProposeBriefPart | RefinementTextPart;
  pendingSiblingBriefs: ProposeBriefPart[];
}) {
  if (part.type === "text") {
    return part.text.trim() ? (
      <p className="whitespace-pre-wrap text-muted-foreground text-sm">
        {part.text}
      </p>
    ) : null;
  }

  if (part.type === "tool-proposeExerciseBrief" && hasPendingQuestion) {
    return null;
  }

  return (
    <ToolPart
      addToolOutput={addToolOutput}
      disabled={disabled}
      part={part}
      pendingSiblingBriefs={pendingSiblingBriefs}
    />
  );
}

function RefinementConversation({
  addToolOutput,
  busy,
  canRevise,
  creating,
  hasBrief,
  error,
  messages,
  onRetry,
  onRevise,
  status,
  stop,
}: {
  addToolOutput: ChatAddToolOutputFunction<ExerciseRefinementMessage>;
  busy: boolean;
  canRevise: boolean;
  creating: boolean;
  hasBrief: boolean;
  error: Error | undefined;
  messages: ExerciseRefinementMessage[];
  onRetry: () => Promise<void>;
  onRevise: (feedback: string) => Promise<void>;
  status: "error" | "ready" | "streaming" | "submitted";
  stop: () => void;
}) {
  const revisionForm = useForm<z.infer<typeof exerciseRevisionSchema>>({
    defaultValues: { feedback: "" },
    resolver: zodResolver(exerciseRevisionSchema),
  });

  function submitRevision() {
    if (!canRevise || creating) {
      return Promise.reject(
        new Error("Espera a que termine la operación actual")
      );
    }
    return revisionForm.handleSubmit(
      async ({ feedback }) => {
        await onRevise(feedback);
        revisionForm.reset();
      },
      () => {
        throw new Error("Revisa los cambios antes de enviarlos");
      }
    )();
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-5 p-5">
              {messages.map((message) => {
                const latestStepStart = message.parts.findLastIndex(
                  (part) => part.type === "step-start"
                );
                const latestStepParts = message.parts.slice(
                  latestStepStart + 1
                );
                const pendingQuestions = latestStepParts.filter(
                  (part) =>
                    part.type === "tool-askUserQuestion" &&
                    part.state === "input-available"
                );
                const pendingBriefs = latestStepParts.filter(
                  (part) =>
                    part.type === "tool-proposeExerciseBrief" &&
                    part.state === "input-available"
                );

                return (
                  <MessageScrollerItem
                    className="flex flex-col gap-5"
                    key={message.id}
                    messageId={message.id}
                  >
                    {message.role === "user" ? (
                      <Message align="end">
                        <MessageContent>
                          <Bubble align="end" variant="default">
                            <BubbleContent>
                              {message.parts
                                .filter((part) => part.type === "text")
                                .map((part) => part.text)
                                .join("")}
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    ) : null}
                    {message.role === "assistant"
                      ? message.parts
                          .filter(
                            (part) =>
                              part.type === "text" ||
                              part.type === "tool-askUserQuestion" ||
                              part.type === "tool-proposeExerciseBrief"
                          )
                          .map((part) => (
                            <AssistantPart
                              addToolOutput={addToolOutput}
                              disabled={busy || creating}
                              hasPendingQuestion={pendingQuestions.length > 0}
                              key={
                                part.type === "text"
                                  ? part.text
                                  : part.toolCallId
                              }
                              part={part}
                              pendingSiblingBriefs={getPendingSiblingBriefs(
                                part,
                                pendingBriefs
                              )}
                            />
                          ))
                      : null}
                  </MessageScrollerItem>
                );
              })}

              {busy ? (
                <MessageScrollerItem messageId="streaming-status">
                  <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-blue-800 text-sm">
                    <Loader2 className="size-4 animate-spin" />
                    Revisando los requisitos...
                  </div>
                </MessageScrollerItem>
              ) : null}

              {error ? (
                <MessageScrollerItem messageId="error">
                  <div
                    className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm"
                    role="alert"
                  >
                    <span>No se pudo continuar: {error.message}</span>
                    <Button
                      disabled={busy || creating}
                      onClick={onRetry}
                      size="sm"
                      variant="outline"
                    >
                      Reintentar
                    </Button>
                  </div>
                </MessageScrollerItem>
              ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
      {hasBrief ? (
        <div className="shrink-0 border-t p-3">
          <Form {...revisionForm}>
            <PromptInput onSubmit={submitRevision}>
              <PromptInputBody>
                <FormField
                  control={revisionForm.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <PromptInputTextarea
                          {...field}
                          aria-label="Cambios en los requisitos"
                          disabled={!canRevise || creating}
                          maxLength={MAX_BRIEF_FEEDBACK_LENGTH}
                          name="message"
                          placeholder="Describe qué quieres cambiar en los requisitos..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </PromptInputBody>
              <PromptInputFooter>
                <p className="text-muted-foreground text-xs">
                  {creating
                    ? "Creando el ejercicio con esta especificación."
                    : "El documento se actualizará con tu mensaje."}
                </p>
                <PromptInputSubmit
                  disabled={creating || !(busy || canRevise)}
                  onStop={stop}
                  status={status}
                />
              </PromptInputFooter>
            </PromptInput>
          </Form>
        </div>
      ) : null}
    </div>
  );
}

function getRequirementsStatus({
  creating,
  busy,
  hasPendingQuestion,
  canUseBrief,
}: {
  creating: boolean;
  busy: boolean;
  hasPendingQuestion: boolean;
  canUseBrief: boolean;
}) {
  if (creating) {
    return "Creando el ejercicio con esta especificación.";
  }
  if (busy) {
    return "Actualizando los requisitos...";
  }
  if (hasPendingQuestion) {
    return "Responde a las preguntas pendientes antes de crear el ejercicio.";
  }
  if (!canUseBrief) {
    return "Reintenta la revisión para completar la propuesta.";
  }
}

export default function CreateExercise({
  initialDraft,
  drafts,
}: {
  initialDraft?: {
    id: string;
    revision: number;
    messages: ExerciseRefinementMessage[];
  };
  drafts: { id: string; title: string; updatedAt: Date }[];
}) {
  const router = useRouter();
  const [started, setStarted] = useState(Boolean(initialDraft));
  const draftId = useRef(initialDraft?.id);
  const draftRevision = useRef(initialDraft?.revision ?? 0);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const creationInProgress = useRef<boolean>(false);

  const form = useForm<ExerciseIdeaSchema>({
    defaultValues: { prompt: "" },
    resolver: zodResolver(exerciseIdeaSchema),
  });

  const {
    addToolOutput,
    error,
    messages,
    sendMessage,
    setMessages,
    status,
    stop,
  } = useChat<ExerciseRefinementMessage>({
    messages: initialDraft?.messages,
    sendAutomaticallyWhen: shouldContinueRefinement,
    transport: new DefaultChatTransport({
      api: "/api/exercise-refinement",
      body: () => ({
        draftId: draftId.current,
        revision: draftRevision.current,
      }),
      credentials: "include",
      fetch: async (input, init) => {
        const response = await fetch(input, init);
        const revision = response.headers.get("x-draft-revision");
        if (revision !== null) {
          draftRevision.current = Number(revision);
        }
        return response;
      },
    }),
  });

  const busy = status === "submitted" || status === "streaming";
  const isMobile = useIsMobile();
  const { displayBrief, pendingBrief, hasPendingQuestion, canUseBrief } =
    getRefinementState({
      creating,
      hasError: Boolean(error),
      messages,
      status,
    });
  const requirementsStatus = getRequirementsStatus({
    busy,
    canUseBrief,
    creating,
    hasPendingQuestion,
  });

  const addRefinementToolOutput: ChatAddToolOutputFunction<
    ExerciseRefinementMessage
  > = async (options) => {
    if (creationInProgress.current) {
      return;
    }
    await addToolOutput(options);
  };

  async function startRefinement(values: ExerciseIdeaSchema) {
    setDraftError(null);
    try {
      const draft = await createRequirementDraft(values.prompt);
      draftId.current = draft.id;
      draftRevision.current = 0;
      const url = new URL(window.location.href);
      url.searchParams.set("draft", draft.id);
      window.history.replaceState(null, "", url);
      setStarted(true);
    } catch {
      setDraftError("No se pudo guardar el borrador. Inténtalo de nuevo.");
      return;
    }
    await sendMessage({ text: values.prompt });
  }

  async function handleCreate() {
    if (!(canUseBrief && pendingBrief) || creationInProgress.current) {
      return;
    }
    const { brief } = pendingBrief.input;
    creationInProgress.current = true;
    setCreating(true);
    setCreationError(null);
    try {
      const created = await createExercise({
        brief,
        draftId: draftId.current,
        draftRevision: draftRevision.current,
      });
      if (!created) {
        throw new Error("Failed to create exercise");
      }
      router.push(`/dashboard/exercises/${created.slug}`);
    } catch {
      creationInProgress.current = false;
      setCreationError(
        "No se pudo preparar el ejercicio. Revisa la propuesta e inténtalo de nuevo."
      );
      setCreating(false);
    }
  }

  function retryRefinement() {
    if (creationInProgress.current) {
      return Promise.resolve();
    }
    setMessages(withoutUnfinishedStep);
    return sendMessage();
  }

  async function reviseBrief(feedback: string) {
    if (!(canUseBrief && pendingBrief) || creationInProgress.current) {
      throw new Error("La propuesta todavía no está lista para editarse");
    }
    const input = exerciseRevisionSchema.parse({ feedback });
    setCreationError(null);
    await addRefinementToolOutput({
      output: { accepted: false, feedback: input.feedback },
      tool: "proposeExerciseBrief",
      toolCallId: pendingBrief.toolCallId,
    });
  }

  const conversation = (
    <RefinementConversation
      addToolOutput={addRefinementToolOutput}
      busy={busy}
      canRevise={canUseBrief}
      creating={creating}
      error={error}
      hasBrief={Boolean(displayBrief)}
      messages={messages}
      onRetry={retryRefinement}
      onRevise={reviseBrief}
      status={status}
      stop={stop}
    />
  );

  const needsContinuation =
    !(busy || error || creating) &&
    (messages.at(-1)?.role === "user" ||
      shouldContinueRefinement({ messages }));

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
                onClick={() => {
                  setStarted(false);
                  setMessages([]);
                  router.refresh();
                }}
              >
                Mis borradores
              </Link>
            </div>
            {needsContinuation ? (
              <div className="flex shrink-0 items-center justify-between gap-4 border-b px-5 py-2 text-sm">
                <span>
                  La revisión quedó pendiente. Puedes continuar el borrador.
                </span>
                <Button onClick={retryRefinement} size="sm" variant="outline">
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
                      onCreate={handleCreate}
                      statusMessage={requirementsStatus}
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
                onSubmit={form.handleSubmit(startRefinement)}
              >
                {draftError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {draftError}
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
