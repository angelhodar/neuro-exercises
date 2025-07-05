"use client";

import { Markdown } from "./markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div
      className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`rounded-2xl px-4 py-3 shadow-sm max-w-[85%] ${
          role === "user"
            ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white"
            : "bg-white border border-gray-200 text-gray-900"
        }`}
      >
        <div className="leading-relaxed">
          <Markdown content={content} role={role} />
        </div>
      </div>
    </div>
  );
}
