"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import {
  type StroopColorInterferenceConfig,
  type StroopColorInterferenceQuestionResult,
  STROOP_COLORS,
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

export function Exercise({
  config,
}: StroopColorInterferenceExerciseProps) {
  const { numOptions } = config;
  const { currentQuestionIndex, addResult } = useExerciseExecution();

  const [question, setQuestion] = useState<CurrentQuestion | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    const setupQuestion = () => {
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
    };

    setupQuestion();
  }, [currentQuestionIndex, numOptions]);

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

    addResult(result);
  };

  if (!question) {
    return (
      <div className="flex items-center justify-center h-full">Cargando...</div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8">
      <div className="flex-grow flex items-center justify-center mb-12">
        <h1
          className="text-6xl md:text-8xl font-bold"
          style={{ color: question.color.value }}
        >
          {question.word.name}
        </h1>
      </div>
      <div className="flex-shrink-0 flex flex-wrap justify-center items-center gap-4 w-full max-w-4xl">
        {question.options.map((option) => (
          <Button
            key={option}
            onClick={() => handleAnswer(option)}
            className="text-2xl md:text-3xl py-10 px-12 h-auto min-w-[180px]"
            variant="outline"
            size="lg"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}