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
  const { currentQuestionIndex, addQuestionResult } = useExerciseExecution();
  
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
    console.log('🔴 autoCompleteQuestion triggered', { currentQuestionIndex, cellDisplayDuration });
    setQuestionState((currentState) => {
      if (!currentState.targetCells) {
        console.log('⚠️ No target cells, skipping auto-complete');
        return currentState;
      }

      console.log('✅ Auto-completing question', { 
        targetCells: currentState.targetCells,
        selectedCells: currentState.selectedCells,
        reactionTimes: currentState.reactionTimes
      });

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
      console.log('📊 Processing pending result:', questionState.pendingResult);
      addQuestionResult(questionState.pendingResult);
      // Reset the setup ref so next question can be configured
      currentQuestionSetupRef.current = -1;
      setQuestionState((prev) => ({
        ...prev,
        pendingResult: null,
      }));
    }
  }, [questionState.pendingResult, addQuestionResult]);

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
    console.log('🚀 setupNextTarget called for question', currentQuestionIndex);
    
    // Prevent duplicate setup for the same question
    if (currentQuestionSetupRef.current === currentQuestionIndex) {
      console.log('⚠️ Target already set up for question', currentQuestionIndex, '- skipping');
      return;
    }
    
    // Mark this question as being set up
    currentQuestionSetupRef.current = currentQuestionIndex;
    
    // Clear any existing timeouts FIRST
    clearTimeouts();
    
    // Also clear any pending timeout that might not be tracked in state yet
    if (autoCompleteTimeoutRef.current) {
      console.log('🧹 Clearing previous auto-complete timeout');
      clearTimeout(autoCompleteTimeoutRef.current);
      autoCompleteTimeoutRef.current = null;
    }

    setQuestionState((prev) => ({
      ...prev,
      targetCells: null,
      selectedCells: [],
      reactionTimes: [],
      startTime: null,
      timeoutId: null,
      displayTimeoutId: null,
    }));

    // Random delay before showing targets
    const delay = Math.random() * (delayMax - delayMin) + delayMin;
    console.log(`⏳ Delaying target display by ${delay}ms`);

    const timeoutId = setTimeout(() => {
      console.log('🎯 Showing targets after delay');
      
      const targets = selectRandomCells();
      const startTime = Date.now();

      setQuestionState((prev) => ({
        ...prev,
        targetCells: targets,
        startTime: startTime,
        timeoutId: null,
      }));

      // Set up auto-complete timeout AFTER targets are shown
      console.log(`⏰ Setting auto-complete timeout for ${cellDisplayDuration}ms`);
      autoCompleteTimeoutRef.current = setTimeout(() => {
        console.log('⌛ Auto-complete timeout triggered');
        autoCompleteQuestion();
      }, cellDisplayDuration);

    }, delay);

    setQuestionState((prev) => ({ 
      ...prev, 
      timeoutId: timeoutId 
    }));
  }

  // Check if a cell is a target
  function isTargetCell(cellIndex: number) {
    return questionState.targetCells?.includes(cellIndex) ?? false;
  }

  // Check if a cell is selected
  function isSelectedCell(cellIndex: number) {
    return questionState.selectedCells.includes(cellIndex);
  }

  // Setup next question when currentQuestionIndex changes
  useEffect(() => {
    console.log('📋 Question index changed to:', currentQuestionIndex);
    setupNextTarget();

    // Cleanup function
    return () => {
      console.log('🧽 Cleaning up timeouts for question:', currentQuestionIndex);
      clearTimeouts();
      if (autoCompleteTimeoutRef.current) {
        clearTimeout(autoCompleteTimeoutRef.current);
        autoCompleteTimeoutRef.current = null;
      }
    };
  }, [currentQuestionIndex]);

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full">
      <div
        className="grid gap-2 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          maxWidth: `${Math.min(600, 30 * gridSize)}px`,
          maxHeight: `${Math.min(600, 30 * gridSize)}px`,
        }}
      >
        {gridCells.map((cellIndex) => (
          <Cell
            key={cellIndex}
            isTarget={isTargetCell(cellIndex)}
            isSelected={isSelectedCell(cellIndex)}
            onClick={() => handleCellClick(cellIndex)}
            disabled={!questionState.targetCells}
          />
        ))}
      </div>
    </div>
  );
} 