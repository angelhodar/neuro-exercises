import type { HarnessAgentResumeSessionState } from "@ai-sdk/harness/agent";
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
import { createGenerationLifecycle } from "@/lib/ai/generation-lifecycle";
import { createGenerationSummaryStream } from "@/lib/ai/generation-summary-stream";
import {
  claimExerciseWorkspace,
  getOrCreateExerciseWorkspace,
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

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
    query: { disableCookieCache: true },
  });
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

  // Fail before creating a generation or resuming foreign/legacy session state.
  try {
    await getOrCreateExerciseWorkspace(exercise.id);
  } catch (error) {
    console.error("Exercise workspace configuration error:", error);
    return new Response(
      "El espacio de trabajo requiere configuración. Contacta con el administrador.",
      { status: 503 }
    );
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
  const activeGeneration = generation;
  const workspace = await claimExerciseWorkspace(
    exercise.id,
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
    { status: "GENERATING" }
  );
  if (!startedGeneration) {
    await releaseExerciseWorkspace(exercise.id, activeGeneration.id, {
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
    await releaseExerciseWorkspace(exercise.id, activeGeneration.id, {
      lastError: "No se pudieron convertir los mensajes",
    });
    return new Response("Mensajes no válidos", { status: 400 });
  }

  const lifecycle = createGenerationLifecycle(
    {
      exerciseId: exercise.id,
      generationId: activeGeneration.id,
      slug: exercise.slug,
    },
    {
      createCheckpoint: createExerciseCheckpoint,
      refreshLock: refreshExerciseWorkspaceLock,
      releaseWorkspace: releaseExerciseWorkspace,
      updateGeneration: updateExerciseGeneration,
    }
  );

  return createUIMessageStreamResponse({
    consumeSseStream: consumeStream,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        try {
          const sandbox = await getExerciseWorkspaceSandbox({
            checkpointBlobKey: latestCheckpoint?.codeBlobKey ?? null,
            exercise,
          });
          const sandboxSession = await createVercelSandbox({
            sandbox,
          }).createSession({ sessionId: workspace.harnessSessionId });
          const harnessSession = await exerciseAgent.createSession({
            ...(workspace.harnessResumeState
              ? {
                  resumeFrom:
                    workspace.harnessResumeState as HarnessAgentResumeSessionState,
                }
              : {}),
            sandboxSession,
            sessionId: workspace.harnessSessionId,
          });
          lifecycle.attachSession(harnessSession);
          const result = await exerciseAgent.stream({
            abortSignal: req.signal,
            messages: modelMessages,
            options: { slug: exercise.slug },
            session: harnessSession,
          });
          writer.merge(
            toUIMessageStream({
              onEnd: (event) => lifecycle.onEnd(sandbox, event),
              onError: getHarnessErrorMessage,
              originalMessages: messages,
              stream: result.stream,
            }).pipeThrough(createGenerationSummaryStream())
          );
        } catch (error) {
          await lifecycle.destroySession();
          await lifecycle.fail(error);
          throw error;
        }
      },
      onError: getHarnessErrorMessage,
    }),
  });
}
