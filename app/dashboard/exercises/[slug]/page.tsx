import { notFound } from "next/navigation";
import { getExerciseBySlug } from "@/app/actions/exercises";
import { getExerciseGenerations } from "@/app/actions/generations";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SandboxProvider } from "@/hooks/use-sandbox";
import { Chat } from "./chat";
import { ExerciseHeader } from "./exercise-header";
import { PreviewIframe } from "./preview-iframe";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ChatMessage {
  content: string;
  createdAt: Date;
  id: string;
  role: "user" | "assistant";
}

export default async function ExerciseChatPage({ params }: PageProps) {
  const { slug } = await params;

  const exercise = await getExerciseBySlug(slug);

  if (!exercise) {
    return notFound();
  }

  const generations = await getExerciseGenerations(exercise.id);

  const messages = generations.flatMap((generation) => {
    const m: ChatMessage[] = [
      {
        content: generation.prompt,
        createdAt: generation.createdAt,
        id: `${generation.id}-user`,
        role: "user",
      },
    ];

    if (generation.summary) {
      m.push({
        content: generation.summary,
        createdAt: generation.createdAt,
        id: `${generation.id}-assistant`,
        role: "assistant",
      });
    }

    return m;
  });

  const autoStart =
    generations.length === 1 && generations[0].status === "PENDING";

  return (
    <SandboxProvider
      exerciseId={exercise.id}
      hasCompletedGeneration={generations.some((g) => g.status === "COMPLETED")}
    >
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100">
        <ResizablePanelGroup className="h-full" orientation="horizontal">
          <ResizablePanel defaultSize={20} maxSize={50} minSize={20}>
            <div className="flex h-full flex-col border-gray-200/50 border-r bg-white/80 backdrop-blur-sm">
              <div className="flex-shrink-0">
                <ExerciseHeader exercise={exercise} generations={generations} />
              </div>
              <div className="min-h-0 flex-1">
                <Chat
                  autoStart={autoStart}
                  exercise={exercise}
                  messages={messages}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle
            className="w-1 bg-gray-200/70 hover:bg-gray-300"
            withHandle
          />

          <ResizablePanel defaultSize={80} maxSize={80} minSize={50}>
            <div className="relative flex h-full flex-col bg-white/80 backdrop-blur-sm">
              <PreviewIframe slug={exercise.slug} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </SandboxProvider>
  );
}
