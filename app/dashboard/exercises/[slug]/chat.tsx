"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, MessageSquare } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { useSandbox } from "@/hooks/use-sandbox";
import type { Exercise } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface InitialMessage {
  content: string;
  createdAt: Date;
  id: string;
  role: "user" | "assistant";
}

interface ChatProps {
  autoStart: boolean;
  exercise: Exercise;
  messages: InitialMessage[];
}

function ChatMarkdown({
  children,
  invert,
}: {
  children: string;
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "prose prose-sm prose-headings:my-2 prose-ol:my-1 prose-p:my-1 prose-pre:my-2 prose-ul:my-1 max-w-none prose-a:text-inherit prose-code:text-inherit prose-headings:text-inherit prose-li:text-inherit prose-p:text-inherit prose-strong:text-inherit prose-p:first:mt-0 prose-p:last:mb-0",
        invert && "prose-invert"
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]}>{children}</Markdown>
    </div>
  );
}

function StreamingStatus({ status }: { status: string }) {
  if (status !== "submitted" && status !== "streaming") {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 rounded-lg bg-blue-50 p-3 text-blue-600">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">
        Generando ejercicio... Esto puede tardar unos minutos.
      </span>
    </div>
  );
}

export function Chat({
  messages: initialMessages,
  exercise,
  autoStart,
}: ChatProps) {
  const { initializeLatestPreview } = useSandbox();
  const [, setGen] = useQueryState("gen", parseAsInteger);
  const hasAutoStarted = useRef(false);

  const { messages, sendMessage, status, error, stop, regenerate } = useChat({
    messages: initialMessages.map((msg) => ({
      id: msg.id,
      parts: [{ text: msg.content, type: "text" as const }],
      role: msg.role,
    })),
    onFinish: ({ isAbort, isDisconnect, isError }) => {
      if (isAbort || isDisconnect || isError) {
        return;
      }
      return initializeLatestPreview();
    },
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { slug: exercise.slug },
      credentials: "include",
    }),
  });

  useEffect(() => {
    if (autoStart && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      setGen(null);
      regenerate();
    }
  }, [autoStart, regenerate, setGen]);

  const filteredMessages = messages.filter(
    (msg) => msg.role === "user" || msg.role === "assistant"
  );

  const handleSubmit = (message: PromptInputMessage): Promise<void> | void => {
    if (status === "submitted" || status === "streaming") {
      toast.error(
        "Hay una generación en curso. Espera a que termine o deténla antes de enviar otro mensaje."
      );
      // Reject so PromptInput keeps the text (it skips clearing when onSubmit rejects)
      return Promise.reject(new Error("Generation in progress"));
    }
    if (message.text.trim()) {
      setGen(null);
      sendMessage({ files: message.files, text: message.text });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-6 p-6">
              {filteredMessages.length === 0 ? (
                <MessageScrollerItem messageId="empty">
                  <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm">No messages yet</h3>
                      <p className="text-muted-foreground text-sm">
                        Start a conversation about this exercise. Ask questions,
                        share thoughts, or request help.
                      </p>
                    </div>
                  </div>
                </MessageScrollerItem>
              ) : (
                filteredMessages.map((m) => (
                  <MessageScrollerItem
                    key={m.id}
                    messageId={m.id}
                    scrollAnchor={m.role === "user"}
                  >
                    <Message align={m.role === "user" ? "end" : "start"}>
                      <MessageContent>
                        <Bubble
                          variant={m.role === "user" ? "default" : "muted"}
                        >
                          <BubbleContent>
                            <ChatMarkdown invert={m.role === "user"}>
                              {m.parts
                                .filter((part) => part.type === "text")
                                .map((part) => part.text)
                                .join("")}
                            </ChatMarkdown>
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))
              )}

              {status === "submitted" || status === "streaming" ? (
                <MessageScrollerItem messageId="streaming-status">
                  <StreamingStatus status={status} />
                </MessageScrollerItem>
              ) : null}

              {error ? (
                <MessageScrollerItem messageId="error">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-red-600 text-sm">
                        Error: {error.message}
                      </span>
                      <button
                        className="text-red-600 text-sm underline hover:text-red-700"
                        onClick={() => regenerate()}
                        type="button"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                </MessageScrollerItem>
              ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="shrink-0 p-2">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea placeholder="Puedes seguir cambiando el ejercicio aqui..." />
          </PromptInputBody>
          <PromptInputFooter>
            <div />
            <PromptInputSubmit onStop={stop} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
