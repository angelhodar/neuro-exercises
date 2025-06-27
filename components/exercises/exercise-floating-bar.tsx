"use client";

import { useState } from "react";
import {
  Volume2,
  Maximize,
  ChevronRight,
  ArrowLeft,
  Settings,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";

export default function FloatingBottomBar() {
  const {
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
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
      <div
        className={`
            bg-blue-50/90 backdrop-blur-md border border-blue-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out
            ${isExpanded ? "px-3 py-2" : "px-3 py-3"}
          `}
      >
        {!isExpanded ? (
          /* Collapsed State - Just hamburger button */
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
            onClick={() => setIsExpanded(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        ) : (
          /* Expanded State - Progress bar + All buttons */
          <div className="animate-in fade-in slide-in-from-bottom duration-300">
            {/* Progress Bar */}
            <div className="mb-2">
              <div className="w-full bg-blue-200/50 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center gap-2">
              {/* Close/Menu Button */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 rounded-full hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
                  onClick={() => setIsExpanded(false)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Close menu
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                </div>
              </div>

              {/* Separator */}
              <div className="w-px h-6 bg-blue-300"></div>

              {/* Previous Button (Long Arrow) */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Previous question
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                </div>
              </div>

              {/* Separator */}
              <div className="w-px h-6 bg-blue-300"></div>

              {/* Audio Button */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Listen to instructions
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                </div>
              </div>

              {/* Separator */}
              <div className="w-px h-6 bg-blue-300"></div>

              {/* Full Screen Button */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors duration-200"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Toggle fullscreen
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                </div>
              </div>

              {/* Separator */}
              <div className="w-px h-6 bg-blue-300"></div>

              {/* Config Button */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Settings
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                </div>
              </div>

              {/* Next Question Button - Conditionally Rendered */}
              {waitingForNextQuestionTrigger && (
                <>
                  {/* Separator */}
                  <div className="w-px h-6 bg-blue-300 animate-in fade-in duration-300"></div>

                  <div className="relative group animate-in fade-in slide-in-from-right duration-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-10 h-10 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 shadow-lg ring-2 ring-blue-300 ring-opacity-50"
                      onClick={nextQuestion}
                    >
                      <ChevronRight className="h-4 w-4 animate-pulse" />
                    </Button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      Go to next question
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
