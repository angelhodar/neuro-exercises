import type { HarnessAgentSession } from "@ai-sdk/harness/agent";
import type { Sandbox } from "@vercel/sandbox";
import type { UIMessage } from "ai";
import type { updateExerciseGeneration } from "@/app/actions/generations";
import type { releaseExerciseWorkspace } from "./workspace-repository";

interface GenerationDependencies {
  createCheckpoint: (sandbox: Sandbox, slug: string) => Promise<string>;
  refreshLock: (exerciseId: number, generationId: number) => Promise<unknown>;
  releaseWorkspace: (
    exerciseId: number,
    generationId: number,
    updates: Parameters<typeof releaseExerciseWorkspace>[2]
  ) => Promise<unknown>;
  updateGeneration: (
    id: number,
    updates: Parameters<typeof updateExerciseGeneration>[1]
  ) => Promise<unknown>;
}

// Only session operations used by this lifecycle are needed. The HTTP route
// owns agent creation and passes the active handle in after initialization.
type GenerationSession = Pick<HarnessAgentSession, "detach" | "destroy">;

function serializableResumeState(state: unknown) {
  return JSON.parse(JSON.stringify(state)) as Record<string, unknown>;
}

// The agent may emit intermediate commentary between tool calls; the summary
// is the last text block it produces.
function summaryText(message: UIMessage) {
  return (
    message.parts.filter((part) => part.type === "text").at(-1)?.text ?? ""
  );
}

export function createGenerationLifecycle(
  {
    exerciseId,
    generationId,
    slug,
  }: {
    exerciseId: number;
    generationId: number;
    slug: string;
  },
  dependencies: GenerationDependencies
) {
  // Keep session and heartbeat ownership local to this generation request.
  let session: GenerationSession | null = null;
  const heartbeat = setInterval(() => {
    dependencies
      .refreshLock(exerciseId, generationId)
      .catch((error: unknown) =>
        console.error("Error refreshing workspace lock:", error)
      );
  }, 60_000);

  function stopHeartbeat() {
    clearInterval(heartbeat);
  }

  function parkSession() {
    if (!session) {
      throw new Error("La sesión del agente no está disponible");
    }
    const activeSession = session;
    session = null;
    return activeSession.detach();
  }

  async function fail(error: unknown) {
    stopHeartbeat();
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    let resumeState: Awaited<ReturnType<GenerationSession["detach"]>> | null =
      null;
    if (session) {
      try {
        resumeState = await parkSession();
      } catch (detachError) {
        console.error("Error detaching harness session:", detachError);
      }
    }
    await dependencies.updateGeneration(generationId, { status: "ERROR" });
    await dependencies.releaseWorkspace(exerciseId, generationId, {
      ...(resumeState
        ? { harnessResumeState: serializableResumeState(resumeState) }
        : {}),
      lastError: message,
    });
  }

  async function complete(sandbox: Sandbox, responseMessage: UIMessage) {
    const codeBlobKey = await dependencies.createCheckpoint(sandbox, slug);
    const resumeState = await parkSession();
    const completedGeneration = await dependencies.updateGeneration(
      generationId,
      {
        codeBlobKey,
        status: "COMPLETED",
        summary: summaryText(responseMessage),
      }
    );
    if (!completedGeneration) {
      throw new Error("No se pudo guardar la generación");
    }
    const releasedWorkspace = await dependencies.releaseWorkspace(
      exerciseId,
      generationId,
      {
        harnessResumeState: serializableResumeState(resumeState),
        lastError: null,
      }
    );
    if (!releasedWorkspace) {
      throw new Error("No se pudo liberar el espacio de trabajo");
    }
    stopHeartbeat();
  }

  async function onEnd(
    sandbox: Sandbox,
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
      await complete(sandbox, event.responseMessage);
    } catch (error) {
      await fail(error);
      throw error;
    }
  }

  return {
    attachSession(activeSession: GenerationSession) {
      session = activeSession;
    },
    async destroySession() {
      if (session) {
        await session.destroy();
        session = null;
      }
    },
    fail,
    onEnd,
  };
}
