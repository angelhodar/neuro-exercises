"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import {
  type StroopColorInterferenceConfig,
  type StroopColorInterferenceQuestionResult,
  STROOP_COLORS,
} from "./stroop-color-interference-schema";
import { shuffle } from "@/lib/utils";

interface StroopColorInterferenceExerciseProps {
  config: StroopColorInterferenceConfig;
}

interface CurrentQuestion {
  word: { name: string; value: string };
  color: { name: string; value: string };
  options: string[];
}

export function StroopColorInterferenceExercise({
  config,
}: StroopColorInterferenceExerciseProps) {
  const { numOptions } = config;
  const { currentQuestionIndex, addQuestionResult } = useExerciseExecution();

  const [question, setQuestion] = useState<CurrentQuestion | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const setupQuestion = useMemo(
    () => () => {
      let word, color;

      // Asegurarse de que la palabra y el color no sean el mismo
      do {
        word = shuffle([...STROOP_COLORS])[0];
        color = shuffle([...STROOP_COLORS])[0];
      } while (word.name === color.name);

      const correctAnswer = color.name;
      const otherOptions = STROOP_COLORS.map((c) => c.name).filter(
        (name) => name !== correctAnswer,
      );

      const shuffledOptions = shuffle(otherOptions).slice(0, numOptions - 1);
      const finalOptions = shuffle([...shuffledOptions, correctAnswer]);

      setQuestion({ word, color, options: finalOptions });
      setStartTime(Date.now());
    },
    [numOptions],
  );

  useEffect(() => {
    setupQuestion();
  }, [currentQuestionIndex, setupQuestion]);

  const handleAnswer = (selectedAnswer: string) => {
    if (!question) return;

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

    addQuestionResult(result);
  };

  if (!question) {
    return (
      <div className="flex items-center justify-center h-full">Cargando...</div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8">
      <div className="flex-grow flex items-center justify-center">
        <h1
          className="text-6xl md:text-8xl font-bold"
          style={{ color: question.color.value }}
        >
          {question.word.name}
        </h1>
      </div>
      <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        {question.options.map((option) => (
          <Button
            key={option}
            onClick={() => handleAnswer(option)}
            className="text-xl py-6"
            variant="outline"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}
