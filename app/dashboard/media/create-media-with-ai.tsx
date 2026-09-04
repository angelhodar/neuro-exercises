"use client";

import { ImageIcon, Loader2, SaveIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  commitGeneratedImage,
  generateImagePreview,
} from "@/app/actions/media";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Skeleton } from "@/components/ui/skeleton";
import type { Media } from "@/lib/db/schema";
import { createBlobUrl } from "@/lib/utils";

interface ChatMessage {
  content: string;
  id: string;
  imageBase64?: string;
  role: "user" | "assistant";
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

    const firstPrompt = firstPromptRef.current as string | null;
    if (!firstPrompt) {
      firstPromptRef.current = prompt;
    }

    setMessages((prev) => [
      ...prev,
      { content: prompt, id: crypto.randomUUID(), role: "user" },
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
          content: "Imagen generada",
          id: crypto.randomUUID(),
          imageBase64: result.imageBase64,
          role: "assistant",
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          content: `Error: ${e instanceof Error ? e.message : "Error generando la imagen"}`,
          id: crypto.randomUUID(),
          role: "assistant",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCommit() {
    const image = latestImageRef.current as string | null;
    const prompt = firstPromptRef.current as string | null;
    if (!(image && prompt)) {
      return;
    }

    setIsCommitting(true);
    try {
      await commitGeneratedImage(image, prompt, sourceMedia?.id);
      toast.success("Imagen guardada correctamente");
      reset();
      setOpen(false);
    } catch {
      toast.error("Error guardando la imagen");
    } finally {
      setIsCommitting(false);
    }
  }

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
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

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 md:h-[800px] md:max-h-[800px] md:flex-row">
          {/* Chat panel */}
          <div className="flex min-h-64 flex-1 flex-col overflow-hidden rounded-lg border md:min-h-0">
            <MessageScrollerProvider autoScroll defaultScrollPosition="end">
              <MessageScroller className="min-h-0 flex-1">
                <MessageScrollerViewport>
                  <MessageScrollerContent className="justify-end gap-4 p-4">
                    {messages.length === 0 ? (
                      <MessageScrollerItem messageId="empty">
                        <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
                          <ImageIcon className="size-8 text-muted-foreground" />
                          <p className="text-muted-foreground text-sm">
                            {sourceMedia
                              ? "Indica qué cambios quieres hacer sobre la imagen original"
                              : "Escribe un prompt para generar tu primera imagen"}
                          </p>
                        </div>
                      </MessageScrollerItem>
                    ) : (
                      messages.map((m) => (
                        <MessageScrollerItem key={m.id} messageId={m.id}>
                          <Message align={m.role === "user" ? "end" : "start"}>
                            <MessageContent>
                              <Bubble
                                variant={
                                  m.role === "user" ? "default" : "muted"
                                }
                              >
                                <BubbleContent>
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
                                    m.content
                                  )}
                                </BubbleContent>
                              </Bubble>
                            </MessageContent>
                          </Message>
                        </MessageScrollerItem>
                      ))
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>

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
            disabled={!(latestImageRef.current as string | null) || busy}
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
