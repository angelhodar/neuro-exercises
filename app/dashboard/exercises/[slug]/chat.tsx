"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
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

function StreamingStatus({ status, data }: { status: string; data?: any }) {
  if (status === "submitted") {
    return (
      <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-lg mb-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Procesando tu petición...</span>
      </div>
    );
  }

  if (status === "streaming") {
    return (
      <div className="bg-blue-50 p-3 rounded-lg mb-4 space-y-2">
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Procesando ejercicio...</span>
        </div>

        {data?.toolInvocations && data.toolInvocations.length > 0 && (
          <div className="space-y-1">
            {data.toolInvocations.map((invocation: any, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-sm text-gray-600"
              >
                {getToolIcon(invocation.toolName)}
                <span>{getToolDisplayName(invocation.toolName)}</span>
                {invocation.state === "result" && (
                  <span className="text-green-600">✓</span>
                )}
              </div>
            ))}
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

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    error,
    stop,
    reload,
    data,
  } = useChat({
    api: "/api/chat",
    initialMessages: initialMessages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
    })),
    credentials: "include",
    body: { slug: exercise.slug },
    onFinish: initializeSandbox,
  });

  useEffect(() => {
    if (autoStart && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      reload();
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
  ) as Array<{ id: string; role: "user" | "assistant"; content: string }>;

  const isLoading = status === "submitted" || status === "streaming";

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
                  <ChatMessage key={m.id} role={m.role} content={m.content} />
                ))}
              </>
            )}

            {/* Show streaming status */}
            <StreamingStatus status={status} data={data} />

            {/* Show error if any */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">
                    Error: {error.message}
                  </span>
                  <button
                    onClick={() => reload()}
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
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onStop={isLoading ? stop : undefined}
        />
      </div>
    </div>
  );
}
