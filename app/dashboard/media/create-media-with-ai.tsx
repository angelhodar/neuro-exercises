"use client";

import { ImageIcon, Loader2, SaveIcon } from "lucide-react";
import { useRef, useState } from "react";
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

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
}

function ImagePreview({
  imageUrl,
  isGenerating,
}: {
  imageUrl: string | null;
  isGenerating: boolean;
}) {
  if (isGenerating) {
    return (
      <div className="flex size-full items-center justify-center rounded-lg border border-dashed">
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
      <div className="flex size-full items-center justify-center overflow-hidden rounded-lg border">
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
    <div className="flex size-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
      <ImageIcon className="size-12" />
      <p className="text-sm">La imagen aparecerá aquí</p>
    </div>
  );
}

export default function CreateMediaWithAI({
  open,
  setOpen,
  sourceMedia,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  sourceMedia?: Media;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const firstPromptRef = useRef<string | null>(null);
  const latestImageRef = useRef<string | null>(null);

  const sourceImageUrl = sourceMedia
    ? createBlobUrl(sourceMedia.blobKey)
    : null;
  const previewUrl = latestImageRef.current ?? sourceImageUrl;
  const busy = isGenerating || isCommitting;

  function reset() {
    setMessages([]);
    setIsGenerating(false);
    setIsCommitting(false);
    firstPromptRef.current = null;
    latestImageRef.current = null;
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      reset();
    }
    setOpen(isOpen);
  }

  async function handleSendPrompt(message: PromptInputMessage) {
    const prompt = message.text.trim();
    if (!prompt) {
      return;
    }

    if (!firstPromptRef.current) {
      firstPromptRef.current = prompt;
    }

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: prompt },
    ]);
    setIsGenerating(true);

    try {
      // For image-to-image: use latest generated image, or source media for variants
      let sourceBase64 = latestImageRef.current;
      if (!sourceBase64 && sourceMedia) {
        const res = await fetch(createBlobUrl(sourceMedia.blobKey));
        const blob = await res.blob();
        sourceBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const result = await generateImagePreview(
        prompt,
        sourceBase64 ?? undefined
      );

      latestImageRef.current = result.imageBase64;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Imagen generada",
          imageBase64: result.imageBase64,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${e instanceof Error ? e.message : "Error generando la imagen"}`,
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCommit() {
    if (!(latestImageRef.current && firstPromptRef.current)) {
      return;
    }

    setIsCommitting(true);
    try {
      await commitGeneratedImage(
        latestImageRef.current,
        firstPromptRef.current,
        sourceMedia?.id
      );
      toast.success("Imagen guardada correctamente");
      reset();
      setOpen(false);
    } catch (_e) {
      toast.error("Error guardando la imagen");
    } finally {
      setIsCommitting(false);
    }
  }

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

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-6 md:h-[500px] md:flex-row">
          {/* Chat panel */}
          <div className="flex min-h-64 flex-1 flex-col overflow-hidden rounded-lg border md:min-h-0">
            <Conversation className="min-h-0 flex-1">
              <ConversationContent className="gap-4 p-4">
                {messages.length === 0 ? (
                  <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
                    <ImageIcon className="size-8 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      {sourceMedia
                        ? "Indica qué cambios quieres hacer sobre la imagen original"
                        : "Escribe un prompt para generar tu primera imagen"}
                    </p>
                  </div>
                ) : (
                  messages.map((m) => (
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
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="shrink-0 border-t p-2">
              <PromptInput onSubmit={handleSendPrompt}>
                <PromptInputBody>
                  <PromptInputTextarea
                    disabled={busy}
                    placeholder="Describe la imagen que quieres generar..."
                  />
                </PromptInputBody>
                <PromptInputFooter>
                  <div />
                  <PromptInputSubmit
                    disabled={busy}
                    status={isGenerating ? "submitted" : undefined}
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>

          {/* Image preview */}
          <div className="flex w-full shrink-0 flex-col md:w-[400px]">
            <ImagePreview imageUrl={previewUrl} isGenerating={isGenerating} />
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
            disabled={!latestImageRef.current || busy}
            onClick={handleCommit}
            type="button"
          >
            {isCommitting ? (
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
