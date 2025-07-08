"use client";

import { useEffect, useState } from "react";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  type SyllablesConfig,
  type SyllablesQuestionResult,
} from "./syllables-schema";
import {
  getWordsBySyllableCount,
  type SpanishWord,
} from "./spanish-words-dataset";

interface SyllablesExerciseProps {
  config: SyllablesConfig;
}

interface QuestionState {
  currentWord: SpanishWord | null;
  scrambledSyllables: string[];
  selectedSyllables: string[];
}

export function SyllablesExercise({ config }: SyllablesExerciseProps) {
  const { syllablesCount } = config;
  const { currentQuestionIndex, addQuestionResult } = useExerciseExecution();

  const [questionState, setQuestionState] = useState<QuestionState>({
    currentWord: null,
    scrambledSyllables: [],
    selectedSyllables: [],
  });

  // Get available words for the selected syllable count
  const availableWords = getWordsBySyllableCount(syllablesCount as 3 | 4 | 5 | 6);

  // Select a random word
  function selectRandomWord(): SpanishWord {
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    // @ts-ignore Its ok
    return availableWords[randomIndex];
  }

  // Scramble syllables
  function scrambleSyllables(syllables: string[]): string[] {
    const scrambled = [...syllables];
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    return scrambled;
  }

  // Setup new question
  function setupNewQuestion() {
    const word = selectRandomWord();
    const scrambled = scrambleSyllables(word.syllables);

    setQuestionState({
      currentWord: word,
      scrambledSyllables: scrambled,
      selectedSyllables: [],
    });
  }

  // Handle syllable click
  function handleSyllableClick(syllable: string, index: number) {
    if (!questionState.currentWord) return;

    const updatedSelected = [...questionState.selectedSyllables, syllable];
    const updatedScrambled = questionState.scrambledSyllables.filter(
      (_, i) => i !== index
    );

    setQuestionState((prev) => ({
      ...prev,
      selectedSyllables: updatedSelected,
      scrambledSyllables: updatedScrambled,
    }));

    // Check if word is complete
    if (updatedSelected.length === questionState.currentWord.syllables.length) {
      submitAnswer(updatedSelected);
    }
  }

  // Handle selected syllable click (to remove it)
  function handleSelectedSyllableClick(syllable: string, index: number) {
    const updatedSelected = questionState.selectedSyllables.filter(
      (_, i) => i !== index
    );
    const updatedScrambled = [...questionState.scrambledSyllables, syllable];

    setQuestionState((prev) => ({
      ...prev,
      selectedSyllables: updatedSelected,
      scrambledSyllables: updatedScrambled,
    }));
  }

  // Submit answer
  function submitAnswer(selectedSyllables: string[]) {
    if (!questionState.currentWord) return;

    const result: SyllablesQuestionResult = {
      targetWord: questionState.currentWord.word,
      targetSyllables: questionState.currentWord.syllables,
      selectedSyllables,
      timeSpent: 0,
      timeExpired: false,
    };

    addQuestionResult(result);
  }

  // Setup question when question changes
  useEffect(() => {
    setupNewQuestion();
  }, [currentQuestionIndex]);

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-6xl w-full">
      {/* Selected syllables */}
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 min-h-[3rem] items-center justify-center">
            {questionState.selectedSyllables.map((syllable, index) => (
              <Button
                key={index}
                variant="default"
                size="sm"
                onClick={() => handleSelectedSyllableClick(syllable, index)}
                className="text-lg"
              >
                {syllable}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available syllables */}
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {questionState.scrambledSyllables.map((syllable, index) => (
              <Button
                key={index}
                variant="outline"
                size="lg"
                onClick={() => handleSyllableClick(syllable, index)}
                className="text-2xl"
              >
                {syllable}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
