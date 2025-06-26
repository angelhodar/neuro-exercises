"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  User,
  Bot,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { addPRComment } from "@/app/actions/github";
import type { PRComment } from "./types";

type RawComment = any;

interface PRChatProps {
  slug: string;
  comments: RawComment[];
}

interface CollapsibleMessageProps {
  comment: PRComment;
  config: any;
  formatTimestamp: (timestamp: string) => string;
  getAuthorIcon: (type: PRComment["type"]) => React.ReactNode;
}

function CollapsibleMessage({
  comment,
  config,
  formatTimestamp,
  getAuthorIcon,
}: CollapsibleMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const previewText =
    comment.content.slice(0, 150) + (comment.content.length > 150 ? "..." : "");

  return (
    <div className="flex items-start gap-3 w-full">
      <Avatar className={`${config.bgColor} flex-shrink-0`}>
        <AvatarFallback className={config.textColor}>
          {getAuthorIcon(comment.type)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm text-gray-700">
            {comment.author}
          </span>
          <span className="text-xs text-gray-500">
            {formatTimestamp(comment.timestamp)}
          </span>
          {comment.isInitial && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Inicial
            </span>
          )}
        </div>
        <div
          className={`${config.messageBg} border rounded-2xl p-4 shadow-sm w-full`}
        >
          <div className="prose prose-sm max-w-none text-gray-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {isExpanded ? comment.content : previewText}
            </ReactMarkdown>
          </div>
          {comment.content.length > 150 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Ver más
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PRChat({ comments: rawComments, slug }: PRChatProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convertir los datos recibidos al formato PRComment
  const comments: PRComment[] = rawComments.map((c: any, index: number) => {
    const rawBody = c.body ?? "";
    // Quitar indentación de 4 espacios que GitHub interpreta como bloque de código
    const normalized = rawBody.replace(/^ {4}/gm, "");

    return {
      id: c.id?.toString() ?? index.toString(),
      author: c.user?.login ?? "Desconocido",
      content: normalized,
      timestamp: c.created_at ?? new Date().toISOString(),
      type: index === 0 ? ("system" as const) : (c.user?.type === "Bot" ? "bot" as const : "user" as const),
      isInitial: index === 0,
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    await addPRComment(slug, newComment.trim());
    setNewComment("");
    setIsSubmitting(false);
  };

  const getAuthorIcon = (type: PRComment["type"]) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />;
      case "bot":
        return <Bot className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
    }
  };

  const getAuthorConfig = (type: PRComment["type"]) => {
    switch (type) {
      case "user":
        return {
          bgColor: "bg-blue-500",
          textColor: "text-white",
          messageBg: "bg-blue-50 border-blue-200",
        };
      case "bot":
        return {
          bgColor: "bg-green-500",
          textColor: "text-white",
          messageBg: "bg-green-50 border-green-200",
        };
      case "system":
        return {
          bgColor: "bg-gray-500",
          textColor: "text-white",
          messageBg: "bg-gray-50 border-gray-200",
        };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Hace unos minutos";
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <Card className="flex flex-col max-h-full shadow-lg">
      <CardHeader className="p-4 border-b">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Chat de creación de ejercicio
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
        <div className="flex-1 space-y-6 p-6 overflow-y-auto bg-gray-50">
          {comments.map((comment, index) => {
            const config = getAuthorConfig(comment.type);

            // Primer mensaje colapsable
            if (index === 0 && comment.isInitial) {
              return (
                <CollapsibleMessage
                  key={comment.id}
                  comment={comment}
                  config={config}
                  formatTimestamp={formatTimestamp}
                  getAuthorIcon={getAuthorIcon}
                />
              );
            }

            // Mensajes del usuario (alineados a la derecha)
            if (comment.type === "user") {
              return (
                <div
                  key={comment.id}
                  className="flex items-start gap-3 w-full justify-end"
                >
                  <div className="flex-1 min-w-0 flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(comment.timestamp)}
                      </span>
                      <span className="font-medium text-sm text-gray-700">
                        {comment.author}
                      </span>
                    </div>
                    <div
                      className={`${config.messageBg} border rounded-2xl p-4 shadow-sm max-w-[85%]`}
                    >
                      <div className="prose prose-sm max-w-none text-gray-800">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {comment.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  <Avatar className={`${config.bgColor} flex-shrink-0`}>
                    <AvatarFallback className={config.textColor}>
                      {getAuthorIcon(comment.type)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              );
            }

            // Mensajes del bot y sistema (alineados a la izquierda)
            return (
              <div key={comment.id} className="flex items-start gap-3 w-full">
                <Avatar className={`${config.bgColor} flex-shrink-0`}>
                  <AvatarFallback className={config.textColor}>
                    {getAuthorIcon(comment.type)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm text-gray-700">
                      {comment.author}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(comment.timestamp)}
                    </span>
                  </div>
                  <div
                    className={`${config.messageBg} border rounded-2xl p-4 shadow-sm max-w-[85%]`}
                  >
                    <div className="prose prose-sm max-w-none text-gray-800">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {comment.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Describe los cambios que necesitas en tu ejercicio..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
            <Button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="w-full text-white font-medium py-2.5"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
