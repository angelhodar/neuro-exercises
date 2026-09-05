"use client";

import { useChat } from "@ai-sdk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ChatAddToolOutputFunction,
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { ArrowRight, Brain, FileText, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { createExercise } from "@/app/actions/exercises";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
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
import type {
  AskUserQuestionInput,
  AskUserQuestionOutput,
  ExerciseBrief,
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
  if (answer.skipped) {
    return <p className="text-muted-foreground text-sm">Sin preferencia</p>;
  }

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

function getPendingBrief(messages: ExerciseRefinementMessage[]) {
  for (const message of [...messages].reverse()) {
    if (message.role !== "assistant") {
      continue;
    }
    for (const part of [...message.parts].reverse()) {
      if (
        part.type === "tool-proposeExerciseBrief" &&
        part.state === "input-available"
      ) {
        return part;
      }
    }
  }
}

function RequirementsDocument({
  brief,
  creationError,
  creating,
  onCreate,
}: {
  brief: ExerciseBrief;
  creationError: string | null;
  creating: boolean;
  onCreate: () => void;
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
          <span />
        )}
        <Button disabled={creating} onClick={onCreate}>
          {creating ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {creating ? "Preparando ejercicio..." : "Crear ejercicio"}
        </Button>
      </footer>
    </section>
  );
}

function EmptyRequirementsDocument() {
  return (
    <section className="flex h-full flex-col items-center justify-center bg-card p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <FileText className="size-5" />
      </div>
      <h2 className="mt-4 font-medium">Preparando los requisitos</h2>
      <p className="mt-2 max-w-sm text-muted-foreground text-sm">
        El documento aparecerá aquí cuando hayamos definido los detalles del
        ejercicio.
      </p>
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
  currentBrief,
  error,
  messages,
  onRetry,
  onRevise,
  status,
  stop,
}: {
  addToolOutput: ChatAddToolOutputFunction<ExerciseRefinementMessage>;
  busy: boolean;
  currentBrief: ProposeBriefPart | undefined;
  error: Error | undefined;
  messages: ExerciseRefinementMessage[];
  onRetry: () => Promise<void>;
  onRevise: (feedback: string) => void;
  status: "error" | "ready" | "streaming" | "submitted";
  stop: () => void;
}) {
  function submitRevision(message: PromptInputMessage) {
    if (currentBrief && message.text.trim()) {
      onRevise(message.text);
    }
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
                  <MessageScrollerItem key={message.id} messageId={message.id}>
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
                              disabled={busy}
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
                    <Button onClick={onRetry} size="sm" variant="outline">
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
      {currentBrief ? (
        <div className="shrink-0 border-t p-3">
          <PromptInput onSubmit={submitRevision}>
            <PromptInputBody>
              <PromptInputTextarea placeholder="Describe qué quieres cambiar en los requisitos..." />
            </PromptInputBody>
            <PromptInputFooter>
              <p className="text-muted-foreground text-xs">
                El documento se actualizará con tu mensaje.
              </p>
              <PromptInputSubmit onStop={stop} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      ) : null}
    </div>
  );
}

export default function CreateExercisePage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

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
    sendAutomaticallyWhen: shouldContinueRefinement,
    transport: new DefaultChatTransport({
      api: "/api/exercise-refinement",
      credentials: "include",
    }),
  });

  const busy = status === "submitted" || status === "streaming";
  const isMobile = useIsMobile();
  const currentBrief = getPendingBrief(messages);

  async function startRefinement(values: ExerciseIdeaSchema) {
    setStarted(true);
    await sendMessage({ text: values.prompt });
  }

  async function handleCreate(brief: ExerciseBrief) {
    setCreating(true);
    setCreationError(null);
    try {
      const created = await createExercise({
        brief,
      });
      if (!created) {
        throw new Error("Failed to create exercise");
      }
      router.push(`/dashboard/exercises/${created.slug}`);
    } catch {
      setCreationError(
        "No se pudo preparar el ejercicio. Revisa la propuesta e inténtalo de nuevo."
      );
      setCreating(false);
    }
  }

  function retryRefinement() {
    setMessages(withoutUnfinishedStep);
    return sendMessage();
  }

  function reviseBrief(feedback: string) {
    if (!currentBrief) {
      return;
    }
    addToolOutput({
      output: { accepted: false, feedback },
      tool: "proposeExerciseBrief",
      toolCallId: currentBrief.toolCallId,
    });
  }

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
          <div className="h-full">
            <div className="h-full">
              <ResizablePanelGroup
                className="overflow-hidden"
                orientation={isMobile ? "vertical" : "horizontal"}
              >
                <ResizablePanel defaultSize={45} minSize={30}>
                  <RefinementConversation
                    addToolOutput={addToolOutput}
                    busy={busy}
                    currentBrief={currentBrief}
                    error={error}
                    messages={messages}
                    onRetry={retryRefinement}
                    onRevise={reviseBrief}
                    status={status}
                    stop={stop}
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={55} minSize={30}>
                  {currentBrief ? (
                    <RequirementsDocument
                      brief={currentBrief.input.brief}
                      creating={creating}
                      creationError={creationError}
                      onCreate={() => handleCreate(currentBrief.input.brief)}
                    />
                  ) : (
                    <EmptyRequirementsDocument />
                  )}
                </ResizablePanel>
              </ResizablePanelGroup>
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
          </div>
        )}
      </main>
    </div>
  );
}
