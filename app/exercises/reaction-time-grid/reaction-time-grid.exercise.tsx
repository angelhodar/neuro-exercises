"use client";

import { useEffect, useState, useRef } from "react";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { Cell } from "./cell";
import type {
  ReactionTimeGridConfig,
  ReactionTimeQuestionResult,
} from "./reaction-time-grid.schema";

interface ReactionTimeGridProps {
  config: ReactionTimeGridConfig;
}

interface QuestionState {
  targetCells: number[] | null;
  startTime: number | null;
  timeoutId: NodeJS.Timeout | null;
  displayTimeoutId: NodeJS.Timeout | null;
  selectedCells: number[];
  reactionTimes: number[];
  pendingResult: ReactionTimeQuestionResult | null;
}

export function Exercise({ config }: ReactionTimeGridProps) {
  const { gridSize, delayMin, delayMax, cells, cellDisplayDuration } = config;
  const { currentQuestionIndex, addResult } = useExerciseExecution();
  
  // Ref to store the auto-complete timeout
  const autoCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to track current question setup
  const currentQuestionSetupRef = useRef<number>(-1);

  const [questionState, setQuestionState] = useState<QuestionState>({
    targetCells: null,
    startTime: null,
    timeoutId: null,
    displayTimeoutId: null,
    selectedCells: [],
    reactionTimes: [],
    pendingResult: null,
  });

  // Generate grid cells as simple indices
  const totalCellsCount = gridSize * gridSize;
  const gridCells = Array.from(
    { length: totalCellsCount },
    (_, index) => index,
  );

  // Select random cells to be the targets
  function selectRandomCells() {
    const shuffled = [...gridCells].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, cells);
  }

  // Clear all active timeouts
  function clearTimeouts() {
    if (questionState.timeoutId) {
      clearTimeout(questionState.timeoutId);
    }
    if (questionState.displayTimeoutId) {
      clearTimeout(questionState.displayTimeoutId);
    }
    if (autoCompleteTimeoutRef.current) {
      clearTimeout(autoCompleteTimeoutRef.current);
      autoCompleteTimeoutRef.current = null;
    }
  }

  // Auto-complete current question when time runs out
  function autoCompleteQuestion() {
    setQuestionState((currentState) => {
      if (!currentState.targetCells) {
        return currentState;
      }

      const result: ReactionTimeQuestionResult = {
        targetCells: currentState.targetCells,
        selectedCells: currentState.selectedCells,
        reactionTimes: currentState.reactionTimes,
      };

      // Store result to be processed by useEffect
      return {
        ...currentState,
        targetCells: null,
        selectedCells: [],
        reactionTimes: [],
        displayTimeoutId: null,
        startTime: null,
        pendingResult: result,
      };
    });
  }

  // Complete current question manually by user action
  function completeCurrentQuestion(selectedCells: number[], reactionTimes: number[]) {
    // Clear auto-complete timeout
    if (autoCompleteTimeoutRef.current) {
      clearTimeout(autoCompleteTimeoutRef.current);
      autoCompleteTimeoutRef.current = null;
    }

    setQuestionState((currentState) => {
      if (!currentState.targetCells) return currentState;

      const result: ReactionTimeQuestionResult = {
        targetCells: currentState.targetCells,
        selectedCells: selectedCells,
        reactionTimes: reactionTimes,
      };

      // Store result to be processed by useEffect
      return {
        ...currentState,
        targetCells: null,
        selectedCells: [],
        reactionTimes: [],
        displayTimeoutId: null,
        startTime: null,
        pendingResult: result,
      };
    });
  }

  // Process pending results
  useEffect(() => {
    if (questionState.pendingResult) {
      addResult(questionState.pendingResult);
      // Reset the setup ref so next question can be configured
      currentQuestionSetupRef.current = -1;
      setQuestionState((prev) => ({
        ...prev,
        pendingResult: null,
      }));
    }
  }, [questionState.pendingResult, addResult]);

  // Handle cell click
  function handleCellClick(cellIndex: number) {
    if (!questionState.targetCells) return;

    const endTime = Date.now();
    const reactionTime = questionState.startTime
      ? endTime - questionState.startTime
      : 0;

    // Add to selected cells and reaction times
    const updatedSelectedCells = [...questionState.selectedCells, cellIndex];
    const updatedReactionTimes = [...questionState.reactionTimes, reactionTime];

    setQuestionState((prev) => ({
      ...prev,
      selectedCells: updatedSelectedCells,
      reactionTimes: updatedReactionTimes,
    }));

    // If we've selected enough cells or all target cells, submit the result
    if (updatedSelectedCells.length >= questionState.targetCells.length) {
      completeCurrentQuestion(updatedSelectedCells, updatedReactionTimes);
    }
  }

  // Set up the next target after a random delay
  function setupNextTarget() {
    // Prevent duplicate setup for the same question
    if (currentQuestionSetupRef.current === currentQuestionIndex) {
      return;
    }
    
    // Mark this question as being set up
    currentQuestionSetupRef.current = currentQuestionIndex;
    
    // Clear any existing timeouts FIRST
    clearTimeouts();
    
    // Also clear any pending timeout that might not be tracked in state yet
    if (autoCompleteTimeoutRef.current) {
      clearTimeout(autoCompleteTimeoutRef.current);
      autoCompleteTimeoutRef.current = null;
    }

    setQuestionState((prev) => ({
      ...prev,
      targetCells: null,
      selectedCells: [],
      reactionTimes: [],
      displayTimeoutId: null,
      startTime: null,
      pendingResult: null,
    }));

    // Random delay before showing the target
    const delay = Math.floor(Math.random() * (delayMax - delayMin) + delayMin);

    const timeout = setTimeout(() => {
      const newTargets = selectRandomCells();
      const startTime = Date.now();
      
      // Set up the auto-complete timeout
      autoCompleteTimeoutRef.current = setTimeout(() => {
        autoCompleteQuestion();
      }, cellDisplayDuration);

      setQuestionState((prev) => ({
        ...prev,
        targetCells: newTargets,
        startTime: startTime,
        timeoutId: null,
        displayTimeoutId: null,
        pendingResult: null,
      }));
    }, delay);

    setQuestionState((prev) => ({ 
      ...prev, 
      timeoutId: timeout 
    }));
  }

  // Set up the next target when the question changes
  useEffect(() => {
    setupNextTarget();

    return () => {
      clearTimeouts();
    };
  }, [currentQuestionIndex]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, []);

  // Check if a cell is a target
  function isTargetCell(cellIndex: number) {
    if (!questionState.targetCells) return false;
    return questionState.targetCells.includes(cellIndex);
  }

  // Check if a cell has been selected
  function isSelectedCell(cellIndex: number) {
    return questionState.selectedCells.includes(cellIndex);
  }

  return (
    <div className="flex items-center justify-center w-full h-full aspect-square max-w-[min(calc(100%-2rem),calc(100vh-6rem))] max-h-[min(calc(100%-2rem),calc(100vw-6rem))]">
      <div
        className="grid w-full h-full gap-1 sm:gap-2 md:gap-3 p-2"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {gridCells.map((cellIndex) => (
          <Cell
            key={cellIndex}
            isTarget={isTargetCell(cellIndex)}
            isSelected={isSelectedCell(cellIndex)}
            onClick={() => handleCellClick(cellIndex)}
            disabled={!questionState.targetCells || isSelectedCell(cellIndex)}
          />
        ))}
      </div>
    </div>
  );
}
