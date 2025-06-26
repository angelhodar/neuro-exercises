"use client";

import { useEffect, useState, useMemo } from "react";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { Button } from "@/components/ui/button";
import {
  COLORS,
  colorNames,
  type StroopTestConfig,
  type StroopTestQuestionResult,
  type ColorName,
} from "./prueba-pr-schema";
import { PruebaPrResults } from "./prueba-pr-results";

interface PruebaPrExerciseProps {
  config: StroopTestConfig;
}

export function PruebaPrExercise({ config }: PruebaPrExerciseProps) {
  const { testMode, incongruentRatio } = config;

  const { exerciseState, currentQuestionIndex, addQuestionResult, results } =
    useExerciseExecution();

  const [wordText, setWordText] = useState<ColorName | null>(null);
  const [wordColor, setWordColor] = useState<ColorName | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(
    null,
  );
  const [isCongruent, setIsCongruent] = useState<boolean | null>(null);

  // Shuffle color names for buttons to ensure random order
  const shuffledColorNames = useMemo(() => {
    return [...colorNames].sort(() => Math.random() - 0.5);
  }, [currentQuestionIndex, exerciseState]); // Re-shuffle on new question or exercise state change

  function generateQuestion() {
    const allColors = [...colorNames];
    const textOptions = [...colorNames];

    let chosenWordText: ColorName;
    let chosenWordColor: ColorName;
    let currentIsCongruent: boolean;

    if (testMode === "congruent") {
      chosenWordText = allColors[Math.floor(Math.random() * allColors.length)];
      chosenWordColor = chosenWordText;
      currentIsCongruent = true;
    } else if (testMode === "incongruent") {
      chosenWordText = allColors[Math.floor(Math.random() * allColors.length)];
      let tempColor: ColorName;
      do {
        tempColor = allColors[Math.floor(Math.random() * allColors.length)];
      } while (tempColor === chosenWordText);
      chosenWordColor = tempColor;
      currentIsCongruent = false;
    } else {
      // mixed mode
      const shouldBeIncongruent = Math.random() < incongruentRatio;
      chosenWordText = allColors[Math.floor(Math.random() * allColors.length)];

      if (shouldBeIncongruent) {
        let tempColor: ColorName;
        do {
          tempColor = allColors[Math.floor(Math.random() * allColors.length)];
        } while (tempColor === chosenWordText);
        chosenWordColor = tempColor;
        currentIsCongruent = false;
      } else {
        chosenWordColor = chosenWordText;
        currentIsCongruent = true;
      }
    }

    setWordText(chosenWordText);
    setWordColor(chosenWordColor);
    setIsCongruent(currentIsCongruent);
    setQuestionStartTime(Date.now());
  }

  useEffect(() => {
    if (exerciseState === "executing") {
      generateQuestion();
    }
  }, [exerciseState, currentQuestionIndex, testMode, incongruentRatio]);

  const handleAnswer = (selectedColor: ColorName) => {
    if (!questionStartTime || !wordColor || !wordText || isCongruent === null)
      return;

    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = selectedColor === wordColor;

    const result: StroopTestQuestionResult = {
      wordText: wordText,
      wordColor: wordColor,
      isCongruent: isCongruent,
      userAnswer: selectedColor,
      isCorrect: isCorrect,
      timeSpent: timeSpent,
    };

    addQuestionResult(result);
  };

  if (exerciseState === "finished") {
    return <PruebaPrResults results={results as StroopTestQuestionResult[]} />;
  }

  if (exerciseState !== "executing" || !wordText || !wordColor) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl text-muted-foreground">Preparando ejercicio...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="flex-1 flex items-center justify-center w-full">
        <p className={`text-8xl font-bold ${COLORS[wordColor]}`}>
          {wordText.toUpperCase()}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-lg mt-8">
        {shuffledColorNames.map((colorName) => (
          <Button
            key={colorName}
            onClick={() => handleAnswer(colorName)}
            className="h-16 text-lg font-semibold"
            variant="outline"
          >
            {colorName}
          </Button>
        ))}
      </div>
    </div>
  );
}
