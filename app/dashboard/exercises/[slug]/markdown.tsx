"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownProps {
  content: string
  role: "user" | "assistant"
}

export function Markdown({ content, role }: MarkdownProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for different elements
          h1: ({ children }) => (
            <h1 className={`text-lg font-bold mb-2 ${role === "user" ? "text-white" : "text-gray-900"}`}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-base font-semibold mb-2 ${role === "user" ? "text-white" : "text-gray-900"}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-sm font-semibold mb-1 ${role === "user" ? "text-white" : "text-gray-900"}`}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={`mb-2 last:mb-0 ${role === "user" ? "text-white" : "text-gray-900"}`}>{children}</p>
          ),
          strong: ({ children }) => (
            <strong className={role === "user" ? "text-white font-semibold" : "text-gray-900 font-semibold"}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={role === "user" ? "text-white italic" : "text-gray-900 italic"}>{children}</em>
          ),
          ul: ({ children }) => (
            <ul className={`list-disc list-inside mb-2 space-y-1 ${role === "user" ? "text-white" : "text-gray-900"}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={`list-decimal list-inside mb-2 space-y-1 ${role === "user" ? "text-white" : "text-gray-900"}`}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => <li className={role === "user" ? "text-white" : "text-gray-900"}>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote
              className={`border-l-4 pl-4 my-2 italic ${
                role === "user" ? "border-white/30 text-white/90" : "border-gray-300 text-gray-700"
              }`}
            >
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code
                  className={`px-1 py-0.5 rounded text-xs font-mono ${
                    role === "user" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {children}
                </code>
              )
            }
            return (
              <code
                className={`block p-2 rounded text-xs font-mono whitespace-pre-wrap ${
                  role === "user" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                {children}
              </code>
            )
          },
          pre: ({ children }) => <pre className="my-2 overflow-x-auto">{children}</pre>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table
                className={`min-w-full text-xs border-collapse ${role === "user" ? "text-white" : "text-gray-900"}`}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className={role === "user" ? "bg-white/20" : "bg-gray-50"}>{children}</thead>,
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
            <td className={`border px-2 py-1 ${role === "user" ? "border-white/30" : "border-gray-300"}`}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
