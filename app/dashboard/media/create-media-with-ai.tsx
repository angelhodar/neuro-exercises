"use client";

import { ImageIcon, Loader2, SaveIcon } from "lucide-react";
import { useCallback, useReducer } from "react";
import { toast } from "sonner";
import {
  commitGeneratedImage,
  generateImagePreview,
} from "@/app/actions/media";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Media } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
}

interface CreatorState {
  messages: ChatMessage[];
  latestImageBase64: string | null;
  isGenerating: boolean;
  isCommitting: boolean;
  error: string | null;
  firstPrompt: string | null;
}

type CreatorAction =
  | { type: "ADD_USER_MESSAGE"; prompt: string }
  | { type: "GENERATION_START" }
  | { type: "GENERATION_SUCCESS"; imageBase64: string }
  | { type: "GENERATION_ERROR"; error: string }
  | { type: "COMMIT_START" }
  | { type: "COMMIT_SUCCESS" }
  | { type: "COMMIT_ERROR"; error: string }
  | { type: "RESET" };

const initialState: CreatorState = {
  messages: [],
  latestImageBase64: null,
  isGenerating: false,
  isCommitting: false,
  error: null,
  firstPrompt: null,
};

function creatorReducer(
  state: CreatorState,
  action: CreatorAction
): CreatorState {
  switch (action.type) {
    case "ADD_USER_MESSAGE":
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: "user",
            content: action.prompt,
          },
        ],
        firstPrompt: state.firstPrompt ?? action.prompt,
        error: null,
      };
    case "GENERATION_START":
      return { ...state, isGenerating: true, error: null };
    case "GENERATION_SUCCESS":
      return {
        ...state,
        isGenerating: false,
        latestImageBase64: action.imageBase64,
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Imagen generada",
            imageBase64: action.imageBase64,
          },
        ],
      };
    case "GENERATION_ERROR":
      return {
        ...state,
        isGenerating: false,
        error: action.error,
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Error: ${action.error}`,
          },
        ],
      };
    case "COMMIT_START":
      return { ...state, isCommitting: true, error: null };
    case "COMMIT_SUCCESS":
      return { ...state, isCommitting: false };
    case "COMMIT_ERROR":
      return { ...state, isCommitting: false, error: action.error };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ImagePreview({
  imageUrl,
  isGenerating,
}: {
  imageUrl: string | null;
  isGenerating: boolean;
}) {
  if (isGenerating) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-48 rounded-lg" />
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="size-4 animate-spin" />
            <span>Generando imagen...</span>
          </div>
        </div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border">
        {/* biome-ignore lint/performance/noImgElement: base64 data URLs cannot use next/image */}
        <img
          alt="Vista previa de imagen generada"
          className="size-full object-contain"
          height={512}
          src={imageUrl}
          width={512}
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
      <ImageIcon className="size-12" />
      <p className="text-sm">La imagen aparecerá aquí</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CreateMediaWithAI({
  open,
  setOpen,
  sourceMedia,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  sourceMedia?: Media;
}) {
  const [state, dispatch] = useReducer(creatorReducer, initialState);

  const sourceImageUrl = sourceMedia
    ? createBlobUrl(sourceMedia.blobKey)
    : null;

  const previewUrl = state.latestImageBase64 ?? sourceImageUrl;

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        dispatch({ type: "RESET" });
      }
      setOpen(isOpen);
    },
    [setOpen]
  );

  const handleSendPrompt = useCallback(
    async (message: PromptInputMessage) => {
      const prompt = message.text.trim();
      if (!prompt) {
        return;
      }

      dispatch({ type: "ADD_USER_MESSAGE", prompt });
      dispatch({ type: "GENERATION_START" });

      try {
        // For image-to-image: use latest generated image, or source media for variants
        const sourceBase64 =
          state.latestImageBase64 ??
          (sourceMedia
            ? await fetch(createBlobUrl(sourceMedia.blobKey))
                .then((r) => r.blob())
                .then(
                  (blob) =>
                    new Promise<string>((resolve) => {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result as string);
                      reader.readAsDataURL(blob);
                    })
                )
            : undefined);

        const result = await generateImagePreview(
          prompt,
          sourceBase64 ?? undefined
        );
        dispatch({
          type: "GENERATION_SUCCESS",
          imageBase64: result.imageBase64,
        });
      } catch (e) {
        dispatch({
          type: "GENERATION_ERROR",
          error: e instanceof Error ? e.message : "Error generando la imagen",
        });
      }
    },
    [state.latestImageBase64, sourceMedia]
  );

  const handleCommit = useCallback(async () => {
    if (!(state.latestImageBase64 && state.firstPrompt)) {
      return;
    }

    dispatch({ type: "COMMIT_START" });
    try {
      await commitGeneratedImage(
        state.latestImageBase64,
        state.firstPrompt,
        sourceMedia?.id
      );
      dispatch({ type: "COMMIT_SUCCESS" });
      toast.success("Imagen guardada correctamente");
      dispatch({ type: "RESET" });
      setOpen(false);
    } catch (_e) {
      dispatch({
        type: "COMMIT_ERROR",
        error: "Error guardando la imagen",
      });
      toast.error("Error guardando la imagen");
    }
  }, [state.latestImageBase64, state.firstPrompt, sourceMedia?.id, setOpen]);

  const chatStatus = state.isGenerating ? ("submitted" as const) : undefined;

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            {sourceMedia ? "Crear variante de imagen" : "Generar imagen con IA"}
          </DialogTitle>
          <DialogDescription>
            {sourceMedia
              ? "Escribe instrucciones para modificar la imagen. Puedes iterar hasta conseguir el resultado deseado."
              : "Escribe instrucciones para generar una imagen. Puedes iterar sobre el resultado hasta conseguir el resultado deseado."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-6 md:flex-row">
          {/* Left: Chat panel */}
          <div className="flex min-h-0 flex-1 flex-col rounded-lg border">
            <Conversation className="min-h-0 flex-1">
              <ConversationContent className="gap-4 p-4">
                {state.messages.length === 0 ? (
                  <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
                    <ImageIcon className="size-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm">
                        {sourceMedia
                          ? "Describe los cambios"
                          : "Describe la imagen"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {sourceMedia
                          ? "Indica qué cambios quieres hacer sobre la imagen original"
                          : "Escribe un prompt para generar tu primera imagen"}
                      </p>
                    </div>
                  </div>
                ) : (
                  state.messages.map((m) => (
                    <Message from={m.role} key={m.id}>
                      <MessageContent>
                        {m.imageBase64 ? (
                          // biome-ignore lint/performance/noImgElement: base64 data URLs cannot use next/image
                          <img
                            alt="Imagen generada"
                            className="max-w-48 rounded-md"
                            height={512}
                            src={m.imageBase64}
                            width={512}
                          />
                        ) : (
                          <MessageResponse>{m.content}</MessageResponse>
                        )}
                      </MessageContent>
                    </Message>
                  ))
                )}

                {state.isGenerating && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-blue-600">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Generando imagen...</span>
                  </div>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="shrink-0 border-t p-2">
              <PromptInput onSubmit={handleSendPrompt}>
                <PromptInputBody>
                  <PromptInputTextarea
                    disabled={state.isGenerating || state.isCommitting}
                    placeholder="Describe la imagen que quieres generar..."
                  />
                </PromptInputBody>
                <PromptInputFooter>
                  <div />
                  <PromptInputSubmit
                    disabled={state.isGenerating || state.isCommitting}
                    status={chatStatus}
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>

          {/* Right: Image preview */}
          <div className="flex w-full shrink-0 flex-col md:w-[400px]">
            <ImagePreview
              imageUrl={previewUrl}
              isGenerating={state.isGenerating}
            />
          </div>
        </div>

        <DialogFooter className="px-6 pt-4 pb-6">
          <Button
            onClick={() => handleClose(false)}
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            disabled={
              !state.latestImageBase64 ||
              state.isCommitting ||
              state.isGenerating
            }
            onClick={handleCommit}
            type="button"
          >
            {state.isCommitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <SaveIcon className="size-4" />
                Guardar imagen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
