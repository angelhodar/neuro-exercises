"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { MessageSquare, Settings, FileText, Code, Loader2 } from "lucide-react";
import { useSandbox } from "@/hooks/use-sandbox";
import { stopSandbox } from "@/app/actions/sandbox";
import { Exercise } from "@/lib/db/schema";

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
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No messages yet
      </h3>
      <p className="text-gray-500 text-sm max-w-sm">
        Start a conversation about this exercise. Ask questions, share thoughts,
        or request help.
      </p>
    </div>
  );
}

function getToolIcon(toolName: string) {
  switch (toolName) {
    case "getCurrentGeneratedFiles":
      return <FileText className="w-4 h-4" />;
    case "readFiles":
      return <Code className="w-4 h-4" />;
    case "writeFiles":
      return <Settings className="w-4 h-4" />;
    default:
      return <Settings className="w-4 h-4" />;
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

function getToolParts(parts: Array<{ type: string; state?: string; toolCallId?: string }>) {
  return parts.filter((p) => p.type.startsWith("tool-"));
}

function StreamingStatus({ status, messages }: { status: string; messages: Array<{ role: string; parts: Array<{ type: string; state?: string; toolCallId?: string }> }> }) {
  if (status === "submitted") {
    return (
      <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-lg mb-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Procesando tu petición...</span>
      </div>
    );
  }

  if (status === "streaming") {
    const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
    const toolParts = lastAssistantMessage ? getToolParts(lastAssistantMessage.parts) : [];

    return (
      <div className="bg-blue-50 p-3 rounded-lg mb-4 space-y-2">
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Procesando ejercicio...</span>
        </div>

        {toolParts.length > 0 && (
          <div className="space-y-1">
            {toolParts.map((part, index) => {
              const toolName = part.type.replace("tool-", "");
              return (
                <div
                  key={part.toolCallId ?? index}
                  className="flex items-center space-x-2 text-sm text-gray-600"
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

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    regenerate,
  } = useChat({
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
  }, [autoStart]);

  /*useEffect(() => {
    return () => {
      stopSandbox(exercise.id);
    };
  }, []);*/

  // Filter messages to only include user and assistant roles
  const filteredMessages = messages.filter(
    (msg) => msg.role === "user" || msg.role === "assistant",
  );

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = () => {
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area with scrolling */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {filteredMessages.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {filteredMessages.map((m) => (
                  <ChatMessage
                    key={m.id}
                    role={m.role as "user" | "assistant"}
                    content={getTextContent(m.parts as Array<{ type: string; text?: string }>)}
                  />
                ))}
              </>
            )}

            {/* Show streaming status */}
            <StreamingStatus
              status={status}
              messages={messages as Array<{ role: string; parts: Array<{ type: string; state?: string; toolCallId?: string }> }>}
            />

            {/* Show error if any */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">
                    Error: {error.message}
                  </span>
                  <button
                    onClick={() => regenerate()}
                    className="text-red-600 hover:text-red-700 text-sm underline"
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
          onInputChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onStop={isLoading ? stop : undefined}
        />
      </div>
    </div>
  );
}
