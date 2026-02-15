"use client";

import { useEffect, useRef, useState } from "react";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { NumericPad } from "./numeric-pad";
import type {
  Shape,
  Stimulus,
  StimulusCountConfig,
  StimulusCountQuestionResult,
} from "./stimulus-count.schema";
import { StimulusGrid } from "./stimulus-grid";

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

  const { currentQuestionIndex, addResult } = useExerciseExecution();

  const [questionState, setQuestionState] = useState<QuestionState>({
    stimuli: [],
    userAnswer: "",
    questionStart: null,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: currentQuestionIndex is intentionally used as a trigger to reset the question
  useEffect(() => {
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
  }, [currentQuestionIndex, minStimuli, maxStimuli]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit() {
    if (!questionState.questionStart) {
      return;
    }

    const numericAnswer = Number.parseInt(questionState.userAnswer, 10);
    if (Number.isNaN(numericAnswer)) {
      return;
    }

    const timeSpent = Date.now() - questionState.questionStart;
    const isCorrect = numericAnswer === questionState.stimuli.length;

    const result: StimulusCountQuestionResult = {
      shownStimuli: questionState.stimuli.length,
      userAnswer: numericAnswer,
      isCorrect,
      timeSpent,
    };

    addResult(result);
  }

  return (
    <div className="flex w-full flex-col items-center gap-6 p-4">
      <div className="flex w-full flex-col items-start justify-center gap-6 md:flex-row">
        <StimulusGrid
          allowOverlap={allowOverlap}
          stimuli={questionState.stimuli}
        />

        <NumericPad
          inputRef={inputRef}
          onChange={(value) =>
            setQuestionState((prev) => ({ ...prev, userAnswer: value }))
          }
          onSubmit={handleSubmit}
          value={questionState.userAnswer}
        />
      </div>
    </div>
  );
}
