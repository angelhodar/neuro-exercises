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
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          role === "user"
            ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white"
            : "border border-gray-200 bg-white text-gray-900"
        }`}
      >
        <div className="leading-relaxed">
          <Markdown content={content} role={role} />
        </div>
      </div>
    </div>
  );
}
