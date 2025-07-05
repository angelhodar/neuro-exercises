import { notFound } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { getExerciseBySlug } from "@/app/actions/exercises";
import { getPRComments } from "@/app/actions/github";
import { PreviewIframe } from "./preview-iframe";
import { ExerciseHeader } from "./header";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { MessageSquare } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
      <p className="text-gray-500 text-sm max-w-sm">
        Start a conversation about this exercise. Ask questions, share thoughts, or request help.
      </p>
    </div>
  );
}

export default async function PendingExercisePage({ params }: PageProps) {
  const { slug } = await params;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) return notFound();

  const comments: any[] = []//await getPRComments(slug);

  const previewUrl = "https://neurogranada.com/exercises/color-sequence";

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Chat Panel - Left Side */}
        <ResizablePanel defaultSize={20} minSize={20} maxSize={50}>
          <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm border-r border-gray-200/50">
            {/* Exercise Header */}
            <ExerciseHeader exercise={exercise} />

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
              {comments.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <ChatMessage
                      key={comment.id}
                      role="user"
                      content={comment.body || ""}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Chat Input - Fixed at Bottom */}
            <ChatInput />
          </div>
        </ResizablePanel>

        {/* Resize Handle */}
        <ResizableHandle
          withHandle
          className="w-1 bg-gray-200/70 hover:bg-gray-300"
        />

        {/* Preview Panel - Right Side */}
        <ResizablePanel defaultSize={80} minSize={50} maxSize={80}>
          <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm relative">
            <PreviewIframe previewUrl={previewUrl} isGenerating={false} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
