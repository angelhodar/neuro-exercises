"use client";

import { useChat } from "@ai-sdk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ChatAddToolOutputFunction,
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  ArrowRight,
  Brain,
  ChartNoAxesColumnIncreasing,
  ListChecks,
  Loader2,
  MessageSquareText,
  Pencil,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createExercise } from "@/app/actions/exercises";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ExerciseRefinementMessage } from "@/lib/ai/refinement/agent";
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

const briefFeedbackSchema = z.object({
  feedback: z.string().trim().min(1, "Explica qué quieres ajustar").max(2000),
});

type QuestionAnswerForm = z.infer<typeof questionAnswerSchema>;
type BriefFeedbackForm = z.infer<typeof briefFeedbackSchema>;

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
                disabled={disabled}
                onClick={() => onAnswer({ selected: [], skipped: true })}
                type="button"
                variant="ghost"
              >
                Sin preferencia
              </Button>
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

type BriefSectionKey = Exclude<keyof ExerciseBrief, "summary">;

const briefTabs: Array<{
  icon: LucideIcon;
  label: string;
  sections: Array<{ key: BriefSectionKey; label: string }>;
  value: string;
}> = [
  {
    icon: Settings2,
    label: "Configuración",
    sections: [
      { key: "configurableParameters", label: "Parámetros configurables" },
      { key: "difficultyAndProgression", label: "Dificultad y progresión" },
    ],
    value: "configuration",
  },
  {
    icon: ListChecks,
    label: "Actividad",
    sections: [
      { key: "stimuli", label: "Estímulos" },
      { key: "taskFlow", label: "Flujo de la tarea" },
      { key: "completionCriteria", label: "Finalización" },
      { key: "feedback", label: "Feedback" },
    ],
    value: "activity",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    label: "Resultados",
    sections: [{ key: "resultsToRecord", label: "Resultados" }],
    value: "results",
  },
  {
    icon: Accessibility,
    label: "Accesibilidad",
    sections: [
      { key: "accessibilityConsiderations", label: "Consideraciones" },
    ],
    value: "accessibility",
  },
];

function BriefValue({ value }: { value: string | string[] }) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <p className="text-muted-foreground">Sin requisitos adicionales</p>
      );
    }
    return (
      <ul className="space-y-1">
        {value.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="mt-2 size-1 shrink-0 rounded-full bg-blue-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <p>{value}</p>;
}

function BriefCard({
  brief,
  creating,
  disabled,
  onCreate,
  onRevise,
}: {
  brief: ExerciseBrief;
  creating: boolean;
  disabled: boolean;
  onCreate: () => void;
  onRevise: (feedback: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const form = useForm<BriefFeedbackForm>({
    defaultValues: { feedback: "" },
    resolver: zodResolver(briefFeedbackSchema),
  });

  function submitFeedback(values: BriefFeedbackForm) {
    onRevise(values.feedback);
  }

  return (
    <Card className="gap-0 border-blue-200 py-0 shadow-md">
      <CardHeader className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0 border-b bg-blue-50/70 py-5">
        <div className="row-span-2 flex size-9 items-center justify-center rounded-lg bg-blue-700 text-white">
          <Sparkles className="size-4" />
        </div>
        <CardTitle>Requisitos del ejercicio</CardTitle>
        <CardDescription className="mt-0.5">{brief.summary}</CardDescription>
      </CardHeader>
      <Tabs className="gap-4 p-6" defaultValue="configuration">
        <TabsList className="flex w-full">
          {briefTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger className="flex-1" key={tab.value} value={tab.value}>
                <Icon />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {briefTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <CardContent className="space-y-5 px-0">
              {tab.sections.map(({ key, label }) => (
                <div key={key}>
                  <p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    {label}
                  </p>
                  <BriefValue value={brief[key]} />
                </div>
              ))}
            </CardContent>
          </TabsContent>
        ))}
      </Tabs>
      {editing ? (
        <CardFooter className="border-t bg-muted/30 py-4">
          <Form {...form}>
            <form
              className="w-full space-y-3"
              onSubmit={form.handleSubmit(submitFeedback)}
            >
              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        autoFocus
                        placeholder="Describe qué cambiarías de la propuesta..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setEditing(false)}
                  type="button"
                  variant="ghost"
                >
                  Cancelar
                </Button>
                <Button disabled={disabled} type="submit">
                  Enviar cambios
                </Button>
              </div>
            </form>
          </Form>
        </CardFooter>
      ) : (
        <CardFooter className="justify-end gap-2 border-t bg-muted/30 py-4">
          <Button
            disabled={disabled || creating}
            onClick={() => setEditing(true)}
            type="button"
            variant="outline"
          >
            <Pencil />
            Ajustar
          </Button>
          <Button disabled={disabled || creating} onClick={onCreate}>
            {creating ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {creating ? "Preparando ejercicio..." : "Crear ejercicio"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function ToolPart({
  addToolOutput,
  creating,
  disabled,
  onCreate,
  part,
  pendingSiblingBriefs,
}: {
  addToolOutput: ChatAddToolOutputFunction<ExerciseRefinementMessage>;
  creating: boolean;
  disabled: boolean;
  onCreate: (brief: ExerciseBrief) => void;
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
      return (
        <BriefCard
          brief={part.input.brief}
          creating={creating}
          disabled={disabled}
          onCreate={() => onCreate(part.input.brief)}
          onRevise={(feedback) => {
            addToolOutput({
              output: { accepted: false, feedback },
              tool: "proposeExerciseBrief",
              toolCallId: part.toolCallId,
            });
            for (const briefPart of pendingSiblingBriefs) {
              addToolOutput({
                output: {
                  accepted: false,
                  feedback:
                    "Descarta esta propuesta duplicada y genera una sola versión revisada.",
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
        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="font-medium">Cambios solicitados</p>
          <p className="mt-1 text-muted-foreground">{part.output.feedback}</p>
        </div>
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
  activeBriefId,
  addToolOutput,
  creating,
  disabled,
  hasPendingQuestion,
  onCreate,
  part,
  pendingSiblingBriefs,
}: {
  activeBriefId: string | undefined;
  addToolOutput: ChatAddToolOutputFunction<ExerciseRefinementMessage>;
  creating: boolean;
  disabled: boolean;
  hasPendingQuestion: boolean;
  onCreate: (brief: ExerciseBrief) => void;
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

  if (
    part.type === "tool-proposeExerciseBrief" &&
    part.state === "input-available" &&
    (hasPendingQuestion || part.toolCallId !== activeBriefId)
  ) {
    return null;
  }

  return (
    <ToolPart
      addToolOutput={addToolOutput}
      creating={creating}
      disabled={disabled}
      onCreate={onCreate}
      part={part}
      pendingSiblingBriefs={pendingSiblingBriefs}
    />
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

  const { addToolOutput, error, messages, sendMessage, setMessages, status } =
    useChat<ExerciseRefinementMessage>({
      sendAutomaticallyWhen: shouldContinueRefinement,
      transport: new DefaultChatTransport({
        api: "/api/exercise-refinement",
        credentials: "include",
      }),
    });

  const busy = status === "submitted" || status === "streaming";

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

  return (
    <div className="-m-4 min-h-[calc(100vh-3rem)] w-[calc(100%+2rem)] bg-linear-to-b from-blue-50/70 via-white to-white px-4 py-8 pb-12 sm:px-6 md:py-10 md:pb-16 lg:px-8">
      <main className="mx-auto w-full max-w-4xl">
        {started ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <MessageSquareText className="size-5" />
              </div>
              <h1 className="font-semibold text-2xl text-blue-950">
                Afinemos el ejercicio
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                Preguntaremos únicamente por decisiones que afectan a la
                actividad.
              </p>
            </div>

            <div className="space-y-5">
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
                const activeBriefId = pendingBriefs.at(-1)?.toolCallId;

                return (
                  <div className="space-y-3" key={message.id}>
                    {message.role === "user" ? (
                      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-blue-700 px-4 py-3 text-sm text-white shadow-sm">
                        {message.parts.map((part) => {
                          if (part.type === "text") {
                            return (
                              <p
                                className="whitespace-pre-wrap"
                                key={part.text}
                              >
                                {part.text}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
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
                              activeBriefId={activeBriefId}
                              addToolOutput={addToolOutput}
                              creating={creating}
                              disabled={busy}
                              hasPendingQuestion={pendingQuestions.length > 0}
                              key={
                                part.type === "text"
                                  ? part.text
                                  : part.toolCallId
                              }
                              onCreate={handleCreate}
                              part={part}
                              pendingSiblingBriefs={getPendingSiblingBriefs(
                                part,
                                pendingBriefs
                              )}
                            />
                          ))
                      : null}
                  </div>
                );
              })}

              {busy ? (
                <div
                  aria-live="polite"
                  className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-blue-800 text-sm"
                >
                  <Loader2 className="size-4 animate-spin" />
                  Revisando los detalles del ejercicio...
                </div>
              ) : null}

              {error ? (
                <div
                  className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm"
                  role="alert"
                >
                  <span>No se pudo continuar: {error.message}</span>
                  <Button onClick={retryRefinement} size="sm" variant="outline">
                    Reintentar
                  </Button>
                </div>
              ) : null}

              {creationError ? (
                <div
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm"
                  role="alert"
                >
                  {creationError}
                </div>
              ) : null}
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
