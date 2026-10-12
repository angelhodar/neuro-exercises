"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ChatAddToolOutputFunction } from "ai";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
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
import type { ExerciseRefinementMessage } from "@/lib/ai/refinement/agent";
import {
  type AskQuestionPart,
  getPendingSiblingBriefs,
  type ProposeBriefPart,
  type RefinementTextPart,
} from "@/lib/ai/refinement/conversation";
import {
  exerciseRevisionSchema,
  MAX_BRIEF_FEEDBACK_LENGTH,
} from "@/lib/schemas/exercise-refinement";
import { QuestionAnswer, QuestionCard } from "./refinement-question";

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

export function RefinementConversation({
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
