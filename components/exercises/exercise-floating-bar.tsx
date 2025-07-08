"use client";

import { forwardRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Settings, Menu } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { ExerciseFullscreenButton } from "./exercise-fullscreen-button";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { createBlobUrl } from "@/lib/utils";

export const FloatingBarButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn(
          "w-10 h-10 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200",
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

FloatingBarButton.displayName = "FloatingBarButton";

export default function FloatingBottomBar() {
  const {
    exercise,
    exerciseState,
    currentQuestionIndex,
    totalQuestions,
    nextQuestion,
    waitingForNextQuestionTrigger,
  } = useExerciseExecution();

  const [isExpanded, setIsExpanded] = useState(false);

  if (exerciseState === "finished") return null;

  const progressPercentage = (currentQuestionIndex / totalQuestions) * 100;

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute bottom-6 right-6 pointer-events-auto">
        <div className="bg-blue-50/90 backdrop-blur-md border border-blue-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out p-2">
          {!isExpanded ? (
            /* Collapsed State - Hamburger + Next button (if shown) */
            <div className="flex items-center gap-2">
              <FloatingBarButton onClick={() => setIsExpanded(true)}>
                <Menu className="h-4 w-4" />
              </FloatingBarButton>

              {/* Next Question Button in collapsed state */}
              {waitingForNextQuestionTrigger && (
                <>
                  <Separator orientation="vertical" />

                  <div className="relative group">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FloatingBarButton
                          className="bg-blue-500 text-white hover:bg-blue-600 shadow-lg ring-2 ring-blue-300 ring-opacity-50"
                          onClick={nextQuestion}
                        >
                          <ChevronRight className="h-4 w-4 animate-pulse" />
                        </FloatingBarButton>
                      </TooltipTrigger>
                      <TooltipContent>Ir al siguiente ensayo</TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Expanded State - Progress bar + All buttons */
            <div className="animate-in fade-in slide-in-from-bottom duration-300">
              <Progress value={progressPercentage} className="h-2 mb-2" />

              {/* Buttons Row */}
              <div className="flex items-center gap-2">
                {/* Close/Menu Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FloatingBarButton
                      className="hover:bg-red-100 hover:text-red-700"
                      onClick={() => setIsExpanded(false)}
                    >
                      <Menu className="h-4 w-4" />
                    </FloatingBarButton>
                  </TooltipTrigger>
                  <TooltipContent>Cerrar menu</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <FloatingBarButton asChild>
                      <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </FloatingBarButton>
                  </TooltipTrigger>
                  <TooltipContent>Ir al dashboard</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <ExerciseFullscreenButton />
                  </TooltipTrigger>
                  <TooltipContent>Mostrar pantalla completa</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <FloatingBarButton asChild>
                      <Link href={`/exercises/${exercise.slug}/config`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </FloatingBarButton>
                  </TooltipTrigger>
                  <TooltipContent>Configurar ejercicio</TooltipContent>
                </Tooltip>

                {waitingForNextQuestionTrigger && (
                  <>
                    <Separator orientation="vertical" />

                    <div className="relative group animate-in fade-in slide-in-from-right duration-300">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FloatingBarButton
                            className="bg-blue-500 text-white hover:bg-blue-600 shadow-lg ring-2 ring-blue-300 ring-opacity-50"
                            onClick={nextQuestion}
                          >
                            <ChevronRight className="h-4 w-4 animate-pulse" />
                          </FloatingBarButton>
                        </TooltipTrigger>
                        <TooltipContent>Ir al siguiente ensayo</TooltipContent>
                      </Tooltip>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
