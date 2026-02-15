"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Code, FileText, Loader2, MessageSquare, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSandbox } from "@/hooks/use-sandbox";
import type { Exercise } from "@/lib/db/schema";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatProps {
  messages: Message[];
  exercise: Exercise;
  autoStart: boolean;
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <MessageSquare className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 font-medium text-gray-900 text-lg">
        No messages yet
      </h3>
      <p className="max-w-sm text-gray-500 text-sm">
        Start a conversation about this exercise. Ask questions, share thoughts,
        or request help.
      </p>
    </div>
  );
}

function getToolIcon(toolName: string) {
  switch (toolName) {
    case "getCurrentGeneratedFiles":
      return <FileText className="h-4 w-4" />;
    case "readFiles":
      return <Code className="h-4 w-4" />;
    case "writeFiles":
      return <Settings className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
}

function getToolDisplayName(toolName: string) {
  switch (toolName) {
    case "getCurrentGeneratedFiles":
      return "Obteniendo archivos de referencia";
    case "readFiles":
      return "Leyendo archivos existentes";
    case "writeFiles":
      return "Escribiendo archivos";
    default:
      return toolName;
  }
}

function getTextContent(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function getToolParts(
  parts: Array<{ type: string; state?: string; toolCallId?: string }>
) {
  return parts.filter((p) => p.type.startsWith("tool-"));
}

function StreamingStatus({
  status,
  messages,
}: {
  status: string;
  messages: Array<{
    role: string;
    parts: Array<{ type: string; state?: string; toolCallId?: string }>;
  }>;
}) {
  if (status === "submitted") {
    return (
      <div className="mb-4 flex items-center space-x-2 rounded-lg bg-blue-50 p-3 text-blue-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Procesando tu petición...</span>
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
      <div className="mb-4 space-y-2 rounded-lg bg-blue-50 p-3">
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
                  key={part.toolCallId ?? index}
                >
                  {getToolIcon(toolName)}
                  <span>{getToolDisplayName(toolName)}</span>
                  {part.state === "output-available" && (
                    <span className="text-green-600">✓</span>
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
  const { initializeSandbox } = useSandbox();
  const hasAutoStarted = useRef(false);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error, stop, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      credentials: "include",
      body: { slug: exercise.slug },
    }),
    messages: initialMessages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      parts: [{ type: "text" as const, text: msg.content }],
    })),
    onFinish: () => initializeSandbox(),
  });

  useEffect(() => {
    if (autoStart && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      regenerate();
    }
  }, [autoStart, regenerate]);

  /*useEffect(() => {
    return () => {
      stopSandbox(exercise.id);
    };
  }, []);*/

  // Filter messages to only include user and assistant roles
  const filteredMessages = messages.filter(
    (msg) => msg.role === "user" || msg.role === "assistant"
  );

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = () => {
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages area with scrolling */}
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="space-y-6 p-6">
            {filteredMessages.length === 0 ? (
              <EmptyState />
            ) : (
              filteredMessages.map((m) => (
                <ChatMessage
                  content={getTextContent(
                    m.parts as Array<{ type: string; text?: string }>
                  )}
                  key={m.id}
                  role={m.role as "user" | "assistant"}
                />
              ))
            )}

            {/* Show streaming status */}
            <StreamingStatus
              messages={
                messages as Array<{
                  role: string;
                  parts: Array<{
                    type: string;
                    state?: string;
                    toolCallId?: string;
                  }>;
                }>
              }
              status={status}
            />

            {/* Show error if any */}
            {error && (
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
          </div>
        </ScrollArea>
      </div>

      {/* Chat input always visible at bottom */}
      <div className="flex-shrink-0">
        <ChatInput
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onStop={isLoading ? stop : undefined}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
