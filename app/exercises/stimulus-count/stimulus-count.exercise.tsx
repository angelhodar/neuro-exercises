"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import type {
  StimulusCountConfig,
  StimulusCountQuestionResult,
  Shape,
  Stimulus,
} from "./stimulus-count.schema";
import { StimulusGrid } from "./stimulus-grid";
import { NumericPad } from "./numeric-pad";

interface StimulusCountExerciseProps {
  config: StimulusCountConfig;
}

interface QuestionState {
  stimuli: Stimulus[];
  userAnswer: string;
  questionStart: number | null;
}

const shapes: Shape[] = ["star", "circle", "square", "triangle"];
const colors = [
  "text-red-500",
  "text-orange-500",
  "text-yellow-500",
  "text-lime-500",
  "text-green-500",
  "text-teal-500",
  "text-blue-500",
  "text-indigo-500",
  "text-pink-500",
];

export function Exercise({ config }: StimulusCountExerciseProps) {
  const { minStimuli, maxStimuli, allowOverlap } = config;

  const { currentQuestionIndex, addQuestionResult } = useExerciseExecution();

  const [questionState, setQuestionState] = useState<QuestionState>({
    stimuli: [],
    userAnswer: "",
    questionStart: null,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  function setupQuestion() {
    const count =
      Math.floor(Math.random() * (maxStimuli - minStimuli + 1)) + minStimuli;
    const newStimuli = Array.from({ length: count }).map(
      (): Stimulus => ({
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    );
    
    setQuestionState({
      stimuli: newStimuli,
      userAnswer: "",
      questionStart: Date.now(),
    });
  }

  useEffect(() => {
    setupQuestion();
  }, [currentQuestionIndex]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [questionState.stimuli]);

  function handleSubmit() {
    if (!questionState.questionStart) return;

    const numericAnswer = parseInt(questionState.userAnswer, 10);
    if (isNaN(numericAnswer)) return;

    const timeSpent = Date.now() - questionState.questionStart;
    const isCorrect = numericAnswer === questionState.stimuli.length;

    const result: StimulusCountQuestionResult = {
      shownStimuli: questionState.stimuli.length,
      userAnswer: numericAnswer,
      isCorrect,
      timeSpent,
    };

    addQuestionResult(result);
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full">
      <div className="flex flex-col md:flex-row gap-6 w-full items-start justify-center">
        <StimulusGrid stimuli={questionState.stimuli} allowOverlap={allowOverlap} />

        <NumericPad
          value={questionState.userAnswer}
          onChange={(value) => setQuestionState(prev => ({ ...prev, userAnswer: value }))}
          onSubmit={handleSubmit}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
} 