import type {
  HarnessAgentResumeSessionState,
  HarnessAgentSession,
} from "@ai-sdk/harness/agent";
import { getHarnessErrorMessage } from "@ai-sdk/harness/agent";
import { createVercelSandbox } from "@ai-sdk/sandbox-vercel";
import {
  consumeStream,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type ModelMessage,
  toUIMessageStream,
  type UIMessage,
  type UIMessageChunk,
  validateUIMessages,
} from "ai";
import type { NextRequest } from "next/server";
import { getExerciseBySlug } from "@/app/actions/exercises";
import {
  createExerciseGeneration,
  getExerciseGenerations,
  updateExerciseGeneration,
} from "@/app/actions/generations";
import { exerciseAgent } from "@/lib/ai/agent/agent";
import { createExerciseCheckpoint } from "@/lib/ai/exercise-checkpoint";
import { getExerciseWorkspaceSandbox } from "@/lib/ai/exercise-workspace";
import {
  claimExerciseWorkspace,
  refreshExerciseWorkspaceLock,
  releaseExerciseWorkspace,
} from "@/lib/ai/workspace-repository";
import { auth } from "@/lib/auth/auth.server";
import { assertCanEditExercise } from "@/lib/auth/can-edit-exercise";
import type { User } from "@/lib/db/schema";

function messageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

// The agent may emit intermediate commentary between tool calls; the summary
// is the last text block it produces.
function summaryText(message: UIMessage) {
  const textParts = message.parts.filter((part) => part.type === "text");
  return textParts.at(-1)?.text ?? "";
}

function serializableResumeState(state: unknown) {
  return JSON.parse(JSON.stringify(state)) as Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return new Response("No autorizado", { status: 401 });
  }

  let body: { messages: UIMessage[]; slug: string };
  try {
    const input = (await req.json()) as Record<string, unknown>;
    if (!(typeof input.slug === "string" && Array.isArray(input.messages))) {
      throw new Error("Invalid request body");
    }
    body = {
      messages: await validateUIMessages({ messages: input.messages }),
      slug: input.slug,
    };
  } catch {
    return new Response("Solicitud no válida", { status: 400 });
  }

  const { messages } = body;
  const lastMessage = messages.at(-1);
  if (lastMessage?.role !== "user") {
    return new Response("No user message found", { status: 400 });
  }

  const exercise = await getExerciseBySlug(body.slug);
  if (!exercise) {
    return new Response("Exercise not found", { status: 404 });
  }

  try {
    assertCanEditExercise(exercise, session.user as User);
  } catch {
    return new Response("No autorizado", { status: 403 });
  }

  const generations = await getExerciseGenerations(exercise.id);
  if (generations.length === 0) {
    return new Response("No generation to process", { status: 400 });
  }

  let generation = generations.at(-1);
  let createdForRequest = false;
  if (generation?.status === "COMPLETED" || generation?.status === "ERROR") {
    generation =
      (await createExerciseGeneration({
        exerciseId: exercise.id,
        prompt: messageText(lastMessage),
        status: "GENERATING",
      })) ?? undefined;
    createdForRequest = true;
  }

  if (!generation) {
    return new Response("Failed to create generation", { status: 500 });
  }

  const activeExercise = exercise;
  const activeGeneration = generation;

  const workspace = await claimExerciseWorkspace(
    activeExercise.id,
    activeGeneration.id
  );
  if (!workspace) {
    if (createdForRequest) {
      await updateExerciseGeneration(activeGeneration.id, { status: "ERROR" });
    }
    return new Response("Ya hay una generación en curso", { status: 409 });
  }

  const startedGeneration = await updateExerciseGeneration(
    activeGeneration.id,
    {
      status: "GENERATING",
    }
  );
  if (!startedGeneration) {
    await releaseExerciseWorkspace(activeExercise.id, activeGeneration.id, {
      lastError: "No se pudo iniciar la generación",
    });
    return new Response("No se pudo iniciar la generación", { status: 500 });
  }

  const latestCheckpoint = generations.findLast(
    (item) => item.status === "COMPLETED" && item.codeBlobKey
  );
  let modelMessages: ModelMessage[];
  try {
    modelMessages = await convertToModelMessages(messages);
  } catch {
    if (createdForRequest) {
      await updateExerciseGeneration(activeGeneration.id, { status: "ERROR" });
    }
    await releaseExerciseWorkspace(activeExercise.id, activeGeneration.id, {
      lastError: "No se pudieron convertir los mensajes",
    });
    return new Response("Mensajes no válidos", { status: 400 });
  }
  let harnessSession: HarnessAgentSession | null = null;
  const lockHeartbeat = setInterval(() => {
    refreshExerciseWorkspaceLock(activeExercise.id, activeGeneration.id).catch(
      (error: unknown) =>
        console.error("Error refreshing workspace lock:", error)
    );
  }, 60_000);

  function stopLockHeartbeat() {
    clearInterval(lockHeartbeat);
  }

  function parkHarnessSession() {
    if (!harnessSession) {
      throw new Error("La sesión del agente no está disponible");
    }

    const activeSession = harnessSession;
    harnessSession = null;
    return activeSession.detach();
  }

  async function handleGenerationFailure(error: unknown) {
    stopLockHeartbeat();
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    let resumeState: HarnessAgentResumeSessionState | null = null;

    if (harnessSession) {
      try {
        resumeState = await parkHarnessSession();
      } catch (detachError) {
        console.error("Error detaching harness session:", detachError);
      }
    }

    await updateExerciseGeneration(activeGeneration.id, { status: "ERROR" });
    await releaseExerciseWorkspace(activeExercise.id, activeGeneration.id, {
      ...(resumeState
        ? { harnessResumeState: serializableResumeState(resumeState) }
        : {}),
      lastError: message,
    });
  }

  async function completeGeneration(
    sandbox: Awaited<ReturnType<typeof getExerciseWorkspaceSandbox>>,
    responseMessage: UIMessage
  ) {
    const codeBlobKey = await createExerciseCheckpoint(
      sandbox,
      activeExercise.slug
    );
    const resumeState = await parkHarnessSession();
    const completedGeneration = await updateExerciseGeneration(
      activeGeneration.id,
      {
        codeBlobKey,
        status: "COMPLETED",
        summary: summaryText(responseMessage),
      }
    );
    if (!completedGeneration) {
      throw new Error("No se pudo guardar la generación");
    }

    const releasedWorkspace = await releaseExerciseWorkspace(
      activeExercise.id,
      activeGeneration.id,
      {
        harnessResumeState: serializableResumeState(resumeState),
        lastError: null,
      }
    );
    if (!releasedWorkspace) {
      throw new Error("No se pudo liberar el espacio de trabajo");
    }
    stopLockHeartbeat();
  }

  async function handleGenerationEnd(
    sandbox: Awaited<ReturnType<typeof getExerciseWorkspaceSandbox>>,
    event: {
      isAborted: boolean;
      outcome: { status: string };
      responseMessage: UIMessage;
    }
  ) {
    try {
      if (event.isAborted || event.outcome.status !== "completed") {
        throw new Error("La generación no se completó");
      }
      await completeGeneration(sandbox, event.responseMessage);
    } catch (error) {
      await handleGenerationFailure(error);
      throw error;
    }
  }

  return createUIMessageStreamResponse({
    consumeSseStream: consumeStream,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        try {
          const sandbox = await getExerciseWorkspaceSandbox({
            checkpointBlobKey: latestCheckpoint?.codeBlobKey ?? null,
            exercise: activeExercise,
          });
          const sandboxSession = await createVercelSandbox({
            sandbox,
          }).createSession({ sessionId: workspace.harnessSessionId });

          harnessSession = await exerciseAgent.createSession({
            ...(workspace.harnessResumeState
              ? {
                  resumeFrom:
                    workspace.harnessResumeState as HarnessAgentResumeSessionState,
                }
              : {}),
            sandboxSession,
            sessionId: workspace.harnessSessionId,
          });

          const result = await exerciseAgent.stream({
            abortSignal: req.signal,
            messages: modelMessages,
            options: { slug: activeExercise.slug },
            session: harnessSession,
          });

          let finishChunk: UIMessageChunk | undefined;
          let textBuffer: UIMessageChunk[] = [];
          const isTextChunk = (chunk: UIMessageChunk) =>
            chunk.type === "text-start" ||
            chunk.type === "text-delta" ||
            chunk.type === "text-end";
          writer.merge(
            toUIMessageStream({
              onEnd: (event) => handleGenerationEnd(sandbox, event),
              onError: getHarnessErrorMessage,
              originalMessages: messages,
              stream: result.stream,
            }).pipeThrough(
              new TransformStream<UIMessageChunk>({
                flush(controller) {
                  for (const chunk of textBuffer) {
                    controller.enqueue(chunk);
                  }
                  if (finishChunk) {
                    controller.enqueue(finishChunk);
                  }
                },
                transform(chunk, controller) {
                  // The client begins preview initialization on this event. Hold
                  // it until onEnd has saved the checkpoint and generation state.
                  if (chunk.type === "finish") {
                    finishChunk = chunk;
                    return;
                  }
                  // Buffer text blocks: the agent also emits internal commentary
                  // between tool calls, which we don't want to leak. A text block
                  // is only forwarded once it survives until a step boundary
                  // (i.e. it is the final summary); if a tool chunk arrives
                  // first, the block was intermediate and is discarded.
                  if (isTextChunk(chunk)) {
                    textBuffer.push(chunk);
                    return;
                  }
                  if (chunk.type === "finish-step") {
                    for (const buffered of textBuffer) {
                      controller.enqueue(buffered);
                    }
                    textBuffer = [];
                    controller.enqueue(chunk);
                    return;
                  }
                  textBuffer = [];
                  // Tool calls are an implementation detail of the agent; the
                  // client only needs the final text summary.
                  if (chunk.type.startsWith("tool-")) {
                    return;
                  }
                  controller.enqueue(chunk);
                },
              })
            )
          );
        } catch (error) {
          if (harnessSession) {
            await harnessSession.destroy();
            harnessSession = null;
          }
          await handleGenerationFailure(error);
          throw error;
        }
      },
      onError: getHarnessErrorMessage,
    }),
  });
}
