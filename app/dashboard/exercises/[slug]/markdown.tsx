"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  content: string;
  role: "user" | "assistant";
}

export function Markdown({ content, role }: MarkdownProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          // Custom styling for different elements
          h1: ({ children }) => (
            <h1
              className={`mb-2 font-bold text-lg ${role === "user" ? "text-white" : "text-gray-900"}`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`mb-2 font-semibold text-base ${role === "user" ? "text-white" : "text-gray-900"}`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`mb-1 font-semibold text-sm ${role === "user" ? "text-white" : "text-gray-900"}`}
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p
              className={`mb-2 last:mb-0 ${role === "user" ? "text-white" : "text-gray-900"}`}
            >
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong
              className={
                role === "user"
                  ? "font-semibold text-white"
                  : "font-semibold text-gray-900"
              }
            >
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em
              className={
                role === "user" ? "text-white italic" : "text-gray-900 italic"
              }
            >
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul
              className={`mb-2 list-inside list-disc space-y-1 ${role === "user" ? "text-white" : "text-gray-900"}`}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={`mb-2 list-inside list-decimal space-y-1 ${role === "user" ? "text-white" : "text-gray-900"}`}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={role === "user" ? "text-white" : "text-gray-900"}>
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={`my-2 border-l-4 pl-4 italic ${
                role === "user"
                  ? "border-white/30 text-white/90"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className={`rounded px-1 py-0.5 font-mono text-xs ${
                    role === "user"
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={`block whitespace-pre-wrap rounded p-2 font-mono text-xs ${
                  role === "user"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto">{children}</pre>
          ),
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table
                className={`min-w-full border-collapse text-xs ${role === "user" ? "text-white" : "text-gray-900"}`}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={role === "user" ? "bg-white/20" : "bg-gray-50"}>
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th
              className={`border px-2 py-1 text-left font-semibold ${
                role === "user" ? "border-white/30" : "border-gray-300"
              }`}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className={`border px-2 py-1 ${role === "user" ? "border-white/30" : "border-gray-300"}`}
            >
              {children}
            </td>
          ),
        }}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
