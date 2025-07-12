import { notFound } from "next/navigation";
import { getExerciseBySlug } from "@/app/actions/exercises";
import { getExerciseGenerations } from "@/app/actions/generations";
import { PreviewIframe } from "./preview-iframe";
import { Chat } from "./chat";
import { SandboxProvider } from "@/hooks/use-sandbox";
import { ExerciseHeader } from "./exercise-header";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export default async function ExerciseChatPage({ params }: PageProps) {
  const { slug } = await params;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) return notFound();

  const generations = await getExerciseGenerations(exercise.id);

  const messages = generations.flatMap((generation) => {
    const m: ChatMessage[] = [
      {
        id: `${generation.id}-user`,
        role: "user",
        content: generation.prompt,
        createdAt: generation.createdAt,
      },
    ];
    
    if (generation.summary) {
      m.push({
        id: `${generation.id}-assistant`,
        role: "assistant",
        content: generation.summary,
        createdAt: generation.createdAt,
      });
    }

    return m;
  });

  const autoStart = generations.length === 1 && generations[0].status === "PENDING";

  return (
    <SandboxProvider exerciseId={exercise.id}>
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={20} minSize={20} maxSize={50}>
            <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm border-r border-gray-200/50">
              <div className="flex-shrink-0">
                <ExerciseHeader exercise={exercise} />
              </div>
              <div className="flex-1 min-h-0">
                <Chat messages={messages} exercise={exercise} autoStart={autoStart} />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="w-1 bg-gray-200/70 hover:bg-gray-300"
          />

          <ResizablePanel defaultSize={80} minSize={50} maxSize={80}>
            <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm relative">
              <PreviewIframe slug={exercise.slug} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </SandboxProvider>
  );
}
