"use client";

import { useEffect, useRef, useState } from "react";
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
  selectedCells: number[];
  reactionTimes: number[];
  pendingResult: ReactionTimeQuestionResult | null;
}

export function Exercise({ config }: ReactionTimeGridProps) {
  const { gridSize, delayMin, delayMax, cells, cellDisplayDuration } = config;
  const { currentQuestionIndex, addResult } = useExerciseExecution();

  // Ref to store the auto-complete timeout
  const autoCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to store the delay timeout
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [questionState, setQuestionState] = useState<QuestionState>({
    targetCells: null,
    startTime: null,
    selectedCells: [],
    reactionTimes: [],
    pendingResult: null,
  });

  // Generate grid cells as simple indices
  const totalCellsCount = gridSize * gridSize;
  const gridCells = Array.from(
    { length: totalCellsCount },
    (_, index) => index
  );

  // Complete current question manually by user action
  function completeCurrentQuestion(
    selectedCells: number[],
    reactionTimes: number[]
  ) {
    // Clear auto-complete timeout
    if (autoCompleteTimeoutRef.current) {
      clearTimeout(autoCompleteTimeoutRef.current);
      autoCompleteTimeoutRef.current = null;
    }

    setQuestionState((currentState) => {
      if (!currentState.targetCells) {
        return currentState;
      }

      const result: ReactionTimeQuestionResult = {
        targetCells: currentState.targetCells,
        selectedCells,
        reactionTimes,
      };

      return {
        ...currentState,
        targetCells: null,
        selectedCells: [],
        reactionTimes: [],
        startTime: null,
        pendingResult: result,
      };
    });
  }

  // Process pending results
  useEffect(() => {
    if (questionState.pendingResult) {
      addResult(questionState.pendingResult);
      setQuestionState((prev) => ({
        ...prev,
        pendingResult: null,
      }));
    }
  }, [questionState.pendingResult, addResult]);

  // Handle cell click
  function handleCellClick(cellIndex: number) {
    if (!questionState.targetCells) {
      return;
    }

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

  // Set up the next target when the question changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentQuestionIndex is intentionally used as a trigger to reset the question
  useEffect(() => {
    // Clear any existing timeouts
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
    if (autoCompleteTimeoutRef.current) {
      clearTimeout(autoCompleteTimeoutRef.current);
      autoCompleteTimeoutRef.current = null;
    }

    setQuestionState((prev) => ({
      ...prev,
      targetCells: null,
      selectedCells: [],
      reactionTimes: [],
      startTime: null,
      pendingResult: null,
    }));

    // Random delay before showing the target
    const delay = Math.floor(Math.random() * (delayMax - delayMin) + delayMin);

    // Generate grid cell indices inline
    const totalCells = gridSize * gridSize;
    const cellIndices = Array.from({ length: totalCells }, (_, i) => i);

    delayTimeoutRef.current = setTimeout(() => {
      // Select random cells to be the targets
      const shuffled = [...cellIndices].sort(() => 0.5 - Math.random());
      const newTargets = shuffled.slice(0, cells);
      const startTime = Date.now();

      // Set up the auto-complete timeout
      autoCompleteTimeoutRef.current = setTimeout(() => {
        // Auto-complete logic inlined
        setQuestionState((currentState) => {
          if (!currentState.targetCells) {
            return currentState;
          }

          const result: ReactionTimeQuestionResult = {
            targetCells: currentState.targetCells,
            selectedCells: currentState.selectedCells,
            reactionTimes: currentState.reactionTimes,
          };

          return {
            ...currentState,
            targetCells: null,
            selectedCells: [],
            reactionTimes: [],
            startTime: null,
            pendingResult: result,
          };
        });
      }, cellDisplayDuration);

      setQuestionState((prev) => ({
        ...prev,
        targetCells: newTargets,
        startTime,
        pendingResult: null,
      }));
    }, delay);

    return () => {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }
      if (autoCompleteTimeoutRef.current) {
        clearTimeout(autoCompleteTimeoutRef.current);
        autoCompleteTimeoutRef.current = null;
      }
    };
  }, [
    currentQuestionIndex,
    gridSize,
    delayMin,
    delayMax,
    cells,
    cellDisplayDuration,
  ]);

  // Check if a cell is a target
  function isTargetCell(cellIndex: number) {
    if (!questionState.targetCells) {
      return false;
    }
    return questionState.targetCells.includes(cellIndex);
  }

  // Check if a cell has been selected
  function isSelectedCell(cellIndex: number) {
    return questionState.selectedCells.includes(cellIndex);
  }

  return (
    <div className="flex aspect-square h-full max-h-[min(calc(100%-2rem),calc(100vw-6rem))] w-full max-w-[min(calc(100%-2rem),calc(100vh-6rem))] items-center justify-center">
      <div
        className="grid h-full w-full gap-1 p-2 sm:gap-2 md:gap-3"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {gridCells.map((cellIndex) => (
          <Cell
            disabled={!questionState.targetCells || isSelectedCell(cellIndex)}
            isSelected={isSelectedCell(cellIndex)}
            isTarget={isTargetCell(cellIndex)}
            key={cellIndex}
            onClick={() => handleCellClick(cellIndex)}
          />
        ))}
      </div>
    </div>
  );
}
