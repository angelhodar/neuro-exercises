"use client";

import { ArrowLeft, ChevronRight, Clock, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { forwardRef, useEffect, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { ExerciseFullscreenButton } from "./exercise-fullscreen-button";

export const FloatingBarButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        className={cn(
          "h-10 w-10 rounded-full transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700",
          className
        )}
        ref={ref}
        size="sm"
        variant="ghost"
        {...props}
      >
        {children}
      </Button>
    );
  }
);

FloatingBarButton.displayName = "FloatingBarButton";

// Format time as MM:SS
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default function FloatingBottomBar() {
  const {
    exercise,
    exerciseState,
    currentQuestionIndex,
    totalQuestions,
    timeLimitSeconds,
    endConditionType,
    nextQuestion,
    waitingForNextQuestionTrigger,
  } = useExerciseExecution();

  const [isExpanded, setIsExpanded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimitSeconds);

  // Timer effect
  useEffect(() => {
    if (exerciseState === "executing" && timeLimitSeconds > 0) {
      setTimeRemaining(timeLimitSeconds);

      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
    setTimeRemaining(timeLimitSeconds);
  }, [exerciseState, timeLimitSeconds]);

  if (exerciseState === "finished") {
    return null;
  }

  // Calculate progress based on end condition type
  const progressPercentage =
    endConditionType === "time"
      ? ((timeLimitSeconds - timeRemaining) / timeLimitSeconds) * 100
      : (currentQuestionIndex / totalQuestions) * 100;

  const showTimer = exerciseState === "executing" && timeLimitSeconds > 0;
  const _isTimeBased = endConditionType === "time";

  return (
    <div className="pointer-events-none fixed inset-0">
      <div className="pointer-events-auto absolute right-6 bottom-6">
        <div className="rounded-2xl border border-blue-200/50 bg-blue-50/90 p-2 shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out hover:shadow-xl">
          {isExpanded ? (
            /* Expanded State - Progress bar + Timer + All buttons */
            <div className="fade-in slide-in-from-bottom animate-in duration-300">
              <Progress className="mb-3 h-2" value={progressPercentage} />

              {/* Timer in expanded state */}
              {showTimer && (
                <div className="flex items-center justify-center gap-2 p-2 font-mono text-base">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-bold text-blue-700 text-xl">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}

              {/* Buttons Row */}
              <div className="flex items-center gap-2">
                {/* Close/Menu Button */}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <FloatingBarButton
                        className="hover:bg-red-100 hover:text-red-700"
                        onClick={() => setIsExpanded(false)}
                      />
                    }
                  >
                    <Menu className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>Cerrar menu</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" />

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <FloatingBarButton render={<Link href="/dashboard" />} />
                    }
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>Ir al dashboard</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" />

                <Tooltip>
                  <TooltipTrigger render={<ExerciseFullscreenButton />} />
                  <TooltipContent>Mostrar pantalla completa</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" />

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <FloatingBarButton
                        render={
                          <Link href={`/exercises/${exercise.slug}/config`} />
                        }
                      />
                    }
                  >
                    <Settings className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>Configurar ejercicio</TooltipContent>
                </Tooltip>

                {waitingForNextQuestionTrigger && (
                  <>
                    <Separator orientation="vertical" />

                    <div className="group fade-in slide-in-from-right relative animate-in duration-300">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <FloatingBarButton
                              className="bg-blue-500 text-white shadow-lg ring-2 ring-blue-300 ring-opacity-50 hover:bg-blue-600"
                              onClick={nextQuestion}
                            />
                          }
                        >
                          <ChevronRight className="h-4 w-4 animate-pulse" />
                        </TooltipTrigger>
                        <TooltipContent>Ir al siguiente ensayo</TooltipContent>
                      </Tooltip>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Collapsed State - Hamburger + Timer + Next button (if shown) */
            <div className="flex items-center">
              <FloatingBarButton onClick={() => setIsExpanded(true)}>
                <Menu className="h-4 w-4" />
              </FloatingBarButton>

              {/* Timer in collapsed state */}
              {showTimer && (
                <>
                  <Separator orientation="vertical" />
                  <div className="flex items-center gap-2 px-2 font-mono text-base">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-blue-700 text-lg">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </>
              )}

              {/* Next Question Button in collapsed state */}
              {waitingForNextQuestionTrigger && (
                <>
                  <Separator orientation="vertical" />

                  <div className="group relative">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <FloatingBarButton
                            className="bg-blue-500 text-white shadow-lg ring-2 ring-blue-300 ring-opacity-50 hover:bg-blue-600"
                            onClick={nextQuestion}
                          />
                        }
                      >
                        <ChevronRight className="h-4 w-4 animate-pulse" />
                      </TooltipTrigger>
                      <TooltipContent>Ir al siguiente ensayo</TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
