"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import {
  Code,
  FolderSearch,
  Loader2,
  MessageSquare,
  Pencil,
  Settings,
  Terminal,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
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
import { useSandbox } from "@/hooks/use-sandbox";
import type { Exercise } from "@/lib/db/schema";

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

function getToolIcon(toolName: string) {
  switch (toolName) {
    case "read":
    case "readFiles":
      return <Code className="h-4 w-4" />;
    case "glob":
    case "grep":
    case "ls":
    case "listFiles":
      return <FolderSearch className="h-4 w-4" />;
    case "bash":
    case "verifyFiles":
      return <Terminal className="h-4 w-4" />;
    case "edit":
    case "write":
    case "writeFiles":
      return <Pencil className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
}

function getToolDisplayName(toolName: string) {
  switch (toolName) {
    case "read":
    case "readFiles":
      return "Leyendo archivos";
    case "glob":
    case "grep":
    case "ls":
    case "listFiles":
      return "Explorando directorio";
    case "bash":
    case "verifyFiles":
      return "Ejecutando comprobaciones";
    case "edit":
      return "Editando archivos";
    case "write":
    case "writeFiles":
      return "Escribiendo archivos";
    default:
      return toolName;
  }
}

function getToolParts(parts: UIMessage["parts"]) {
  return parts.filter((p) => p.type.startsWith("tool-"));
}

function StreamingStatus({
  status,
  messages,
}: {
  status: string;
  messages: UIMessage[];
}) {
  if (status === "submitted") {
    return (
      <div className="flex items-center space-x-2 rounded-lg bg-blue-50 p-3 text-blue-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Procesando tu petici&oacute;n...</span>
      </div>
    );
  }

  if (status === "streaming") {
    const lastAssistantMessage = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    const toolParts = lastAssistantMessage
      ? getToolParts(lastAssistantMessage.parts)
      : [];

    return (
      <div className="space-y-2 rounded-lg bg-blue-50 p-3">
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-medium text-sm">Procesando ejercicio...</span>
        </div>

        {toolParts.length > 0 && (
          <div className="space-y-1">
            {toolParts.map((part, index) => {
              const toolName = part.type.replace("tool-", "");
              return (
                <div
                  className="flex items-center space-x-2 text-gray-600 text-sm"
                  key={"toolCallId" in part ? part.toolCallId : index}
                >
                  {getToolIcon(toolName)}
                  <span>{getToolDisplayName(toolName)}</span>
                  {"state" in part && part.state === "output-available" && (
                    <span className="text-green-600">&check;</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
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
    onFinish: () => initializeLatestPreview(),
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

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      setGen(null);
      sendMessage({ files: message.files, text: message.text });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-6 p-6">
          {filteredMessages.length === 0 ? (
            <ConversationEmptyState
              description="Start a conversation about this exercise. Ask questions, share thoughts, or request help."
              icon={<MessageSquare className="h-8 w-8" />}
              title="No messages yet"
            />
          ) : (
            filteredMessages.map((m) => (
              <Message from={m.role} key={m.id}>
                <MessageContent>
                  {m.parts.map((part) => {
                    if (part.type === "text") {
                      return (
                        <MessageResponse
                          key={`${m.id}-${part.type}-${part.text}`}
                        >
                          {part.text}
                        </MessageResponse>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))
          )}

          <StreamingStatus messages={messages} status={status} />

          {!!error && (
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
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="shrink-0 border-t p-2">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea placeholder="Ask about this exercise..." />
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
