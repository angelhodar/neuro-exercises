"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import {
  getWordsBySyllableCount,
  type SpanishWord,
} from "./spanish-words-dataset";
import type {
  SyllablesConfig,
  SyllablesQuestionResult,
} from "./syllables.schema";

interface SyllablesExerciseProps {
  config: SyllablesConfig;
}

interface QuestionState {
  currentWord: SpanishWord | null;
  scrambledSyllables: string[];
  selectedSyllables: string[];
}

export function Exercise({ config }: SyllablesExerciseProps) {
  const { syllablesCount } = config;
  const { currentQuestionIndex, addResult } = useExerciseExecution();

  const questionStartTime = useRef(Date.now());

  const [questionState, setQuestionState] = useState<QuestionState>({
    currentWord: null,
    scrambledSyllables: [],
    selectedSyllables: [],
  });

  // Get available words for the selected syllable count
  const availableWords = useMemo(
    () => getWordsBySyllableCount(syllablesCount as 3 | 4 | 5 | 6),
    [syllablesCount]
  );

  // Handle syllable click
  function handleSyllableClick(syllable: string, index: number) {
    if (!questionState.currentWord) {
      return;
    }

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
      const timeSpent = Date.now() - questionStartTime.current;
      const result: SyllablesQuestionResult = {
        targetWord: questionState.currentWord.word,
        targetSyllables: questionState.currentWord.syllables,
        selectedSyllables: updatedSelected,
        timeSpent,
        timeExpired: false,
      };
      addResult(result);
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

  // Setup question when question changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentQuestionIndex is intentionally used as a trigger to reset the question
  useEffect(() => {
    // Select a random word
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const word = availableWords[randomIndex] as SpanishWord;

    // Scramble syllables (Fisher-Yates shuffle)
    const scrambled = [...word.syllables];
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }

    questionStartTime.current = Date.now();
    setQuestionState({
      currentWord: word,
      scrambledSyllables: scrambled,
      selectedSyllables: [],
    });
  }, [currentQuestionIndex, availableWords]);

  return (
    <div className="flex w-full max-w-6xl flex-col items-center gap-6 p-4">
      {/* Selected syllables */}
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4">
          <div className="flex min-h-[3rem] flex-wrap items-center justify-center gap-2">
            {[...questionState.selectedSyllables.entries()].map(
              ([idx, syllable]) => (
                <Button
                  className="text-lg"
                  key={`selected-${syllable}-${idx}`}
                  onClick={() => handleSelectedSyllableClick(syllable, idx)}
                  size="sm"
                  variant="default"
                >
                  {syllable}
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available syllables */}
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap justify-center gap-2">
            {[...questionState.scrambledSyllables.entries()].map(
              ([idx, syllable]) => (
                <Button
                  className="text-2xl"
                  key={`scrambled-${syllable}-${idx}`}
                  onClick={() => handleSyllableClick(syllable, idx)}
                  size="lg"
                  variant="outline"
                >
                  {syllable}
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
