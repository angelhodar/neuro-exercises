"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import {
  STROOP_COLORS,
  type StroopColorInterferenceConfig,
  type StroopColorInterferenceQuestionResult,
} from "./stroop-color-interference.schema";

interface StroopColorInterferenceExerciseProps {
  config: StroopColorInterferenceConfig;
}

interface CurrentQuestion {
  word: { name: string; value: string };
  color: { name: string; value: string };
  options: string[];
}

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function Exercise({ config }: StroopColorInterferenceExerciseProps) {
  const { numOptions } = config;
  const { addResult } = useExerciseExecution();

  const [question, setQuestion] = useState<CurrentQuestion | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    const setupQuestion = () => {
      let word: (typeof STROOP_COLORS)[number];
      let color: (typeof STROOP_COLORS)[number];

      // Asegurarse de que la palabra y el color no sean el mismo
      do {
        word = shuffle([...STROOP_COLORS])[0];
        color = shuffle([...STROOP_COLORS])[0];
      } while (word.name === color.name);

      const correctAnswer = color.name;
      const otherOptions = STROOP_COLORS.map((c) => c.name).filter(
        (name) => name !== correctAnswer
      );

      const shuffledOptions = shuffle(otherOptions).slice(0, numOptions - 1);
      const finalOptions = shuffle([...shuffledOptions, correctAnswer]);

      setQuestion({ word, color, options: finalOptions });
      setStartTime(Date.now());
    };

    setupQuestion();
  }, [numOptions]);

  const handleAnswer = (selectedAnswer: string) => {
    if (!question) {
      return;
    }

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const isCorrect = selectedAnswer === question.color.name;

    const result: StroopColorInterferenceQuestionResult = {
      word: question.word.name,
      color: question.color.name,
      userAnswer: selectedAnswer,
      isCorrect,
      responseTime,
    };

    addResult(result);
  };

  if (!question) {
    return (
      <div className="flex h-full items-center justify-center">Cargando...</div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <div className="mb-12 flex flex-grow items-center justify-center">
        <h1
          className="font-bold text-6xl md:text-8xl"
          style={{ color: question.color.value }}
        >
          {question.word.name}
        </h1>
      </div>
      <div className="flex w-full max-w-4xl flex-shrink-0 flex-wrap items-center justify-center gap-4">
        {question.options.map((option) => (
          <Button
            className="h-auto min-w-[180px] px-12 py-10 text-2xl md:text-3xl"
            key={option}
            onClick={() => handleAnswer(option)}
            size="lg"
            variant="outline"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}
