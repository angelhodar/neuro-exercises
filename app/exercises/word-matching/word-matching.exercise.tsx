"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { getRandomGroups, type WordGroup } from "./word-groups-dataset";
import type {
  WordMatchingConfig,
  WordMatchingQuestionResult,
} from "./word-matching.schema";

const MATCH_COLORS = [
  "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700",
  "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700",
  "bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700",
  "bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700",
  "bg-pink-100 border-pink-300 dark:bg-pink-900/30 dark:border-pink-700",
  "bg-cyan-100 border-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-700",
];

interface WordMatchingExerciseProps {
  config: WordMatchingConfig;
}

interface QuestionState {
  groups: WordGroup[];
  shuffledObjects: string[];
  shuffledCategories: string[];
  shuffledCharacteristics: string[];
  selectedObject: number | null;
  selectedCategory: number | null;
  selectedCharacteristic: number | null;
  matchedWords: Map<string, number>;
  matchedCount: number;
  incorrectAttempts: number;
  totalAttempts: number;
  feedbackState: "none" | "correct" | "incorrect";
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function Exercise({ config }: WordMatchingExerciseProps) {
  const { groupsPerRound } = config;
  const { currentQuestionIndex, addResult } = useExerciseExecution();

  const questionStartTime = useRef(Date.now());
  const feedbackTimeout = useRef<NodeJS.Timeout | null>(null);

  const [questionState, setQuestionState] = useState<QuestionState>({
    groups: [],
    shuffledObjects: [],
    shuffledCategories: [],
    shuffledCharacteristics: [],
    selectedObject: null,
    selectedCategory: null,
    selectedCharacteristic: null,
    matchedWords: new Map(),
    matchedCount: 0,
    incorrectAttempts: 0,
    totalAttempts: 0,
    feedbackState: "none",
  });

  // Setup question when round changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentQuestionIndex is intentionally used as a trigger to reset the question
  useEffect(() => {
    if (feedbackTimeout.current) {
      clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = null;
    }

    const groups = getRandomGroups(groupsPerRound);

    questionStartTime.current = Date.now();
    setQuestionState({
      groups,
      shuffledObjects: shuffleArray(groups.map((g) => g.object)),
      shuffledCategories: shuffleArray(groups.map((g) => g.category)),
      shuffledCharacteristics: shuffleArray(
        groups.map((g) => g.characteristic)
      ),
      selectedObject: null,
      selectedCategory: null,
      selectedCharacteristic: null,
      matchedWords: new Map(),
      matchedCount: 0,
      incorrectAttempts: 0,
      totalAttempts: 0,
      feedbackState: "none",
    });

    return () => {
      if (feedbackTimeout.current) {
        clearTimeout(feedbackTimeout.current);
      }
    };
  }, [currentQuestionIndex, groupsPerRound]);

  function tryMatch(
    objIdx: number | null,
    catIdx: number | null,
    charIdx: number | null
  ) {
    if (objIdx === null || catIdx === null || charIdx === null) {
      return;
    }

    const objWord = questionState.shuffledObjects[objIdx];
    const catWord = questionState.shuffledCategories[catIdx];
    const charWord = questionState.shuffledCharacteristics[charIdx];

    const groupIdx = questionState.groups.findIndex(
      (g) =>
        g.object === objWord &&
        g.category === catWord &&
        g.characteristic === charWord
    );

    if (groupIdx !== -1) {
      const colorIdx = questionState.matchedCount;
      const newMatchedWords = new Map(questionState.matchedWords);
      newMatchedWords.set(objWord, colorIdx);
      newMatchedWords.set(catWord, colorIdx);
      newMatchedWords.set(charWord, colorIdx);

      const newMatchedCount = questionState.matchedCount + 1;
      const newTotalAttempts = questionState.totalAttempts + 1;

      setQuestionState((prev) => ({
        ...prev,
        selectedObject: null,
        selectedCategory: null,
        selectedCharacteristic: null,
        matchedWords: newMatchedWords,
        matchedCount: newMatchedCount,
        totalAttempts: newTotalAttempts,
        feedbackState: "correct",
      }));

      if (feedbackTimeout.current) {
        clearTimeout(feedbackTimeout.current);
      }
      feedbackTimeout.current = setTimeout(() => {
        setQuestionState((prev) => ({ ...prev, feedbackState: "none" }));
      }, 600);

      if (newMatchedCount === questionState.groups.length) {
        const timeSpent = Date.now() - questionStartTime.current;
        const result: WordMatchingQuestionResult = {
          expectedGroups: questionState.groups,
          correctMatches: newMatchedCount,
          totalAttempts: newTotalAttempts,
          incorrectAttempts: questionState.incorrectAttempts,
          timeSpent,
        };
        setTimeout(() => addResult(result), 400);
      }
    } else {
      const newIncorrect = questionState.incorrectAttempts + 1;
      const newTotalAttempts = questionState.totalAttempts + 1;

      setQuestionState((prev) => ({
        ...prev,
        selectedObject: null,
        selectedCategory: null,
        selectedCharacteristic: null,
        incorrectAttempts: newIncorrect,
        totalAttempts: newTotalAttempts,
        feedbackState: "incorrect",
      }));

      if (feedbackTimeout.current) {
        clearTimeout(feedbackTimeout.current);
      }
      feedbackTimeout.current = setTimeout(() => {
        setQuestionState((prev) => ({ ...prev, feedbackState: "none" }));
      }, 600);
    }
  }

  function handleSelectObject(idx: number) {
    const word = questionState.shuffledObjects[idx];
    if (questionState.matchedWords.has(word)) {
      return;
    }

    const newIdx = questionState.selectedObject === idx ? null : idx;
    setQuestionState((prev) => ({ ...prev, selectedObject: newIdx }));
    tryMatch(
      newIdx,
      questionState.selectedCategory,
      questionState.selectedCharacteristic
    );
  }

  function handleSelectCategory(idx: number) {
    const word = questionState.shuffledCategories[idx];
    if (questionState.matchedWords.has(word)) {
      return;
    }

    const newIdx = questionState.selectedCategory === idx ? null : idx;
    setQuestionState((prev) => ({ ...prev, selectedCategory: newIdx }));
    tryMatch(
      questionState.selectedObject,
      newIdx,
      questionState.selectedCharacteristic
    );
  }

  function handleSelectCharacteristic(idx: number) {
    const word = questionState.shuffledCharacteristics[idx];
    if (questionState.matchedWords.has(word)) {
      return;
    }

    const newIdx = questionState.selectedCharacteristic === idx ? null : idx;
    setQuestionState((prev) => ({
      ...prev,
      selectedCharacteristic: newIdx,
    }));
    tryMatch(
      questionState.selectedObject,
      questionState.selectedCategory,
      newIdx
    );
  }

  function renderWordButton(
    word: string,
    idx: number,
    isSelected: boolean,
    onSelect: (idx: number) => void
  ) {
    const isMatched = questionState.matchedWords.has(word);
    const colorIdx = questionState.matchedWords.get(word);

    return (
      <Button
        className={`h-auto w-full justify-center py-3 text-base transition-all ${
          isMatched ? `${MATCH_COLORS[colorIdx ?? 0]} border opacity-70` : ""
        }`}
        disabled={isMatched}
        key={`${word}-${idx}`}
        onClick={() => onSelect(idx)}
        size="lg"
        variant={isSelected ? "default" : "outline"}
      >
        {isMatched && <Check className="mr-2 h-4 w-4" />}
        {word}
      </Button>
    );
  }

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-6 p-4">
      <div className="grid w-full grid-cols-3 gap-4 text-center">
        <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
          Objeto
        </h3>
        <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
          Categoría
        </h3>
        <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
          Característica
        </h3>
      </div>

      <Card className="w-full">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              {questionState.shuffledObjects.map((word, idx) =>
                renderWordButton(
                  word,
                  idx,
                  questionState.selectedObject === idx,
                  handleSelectObject
                )
              )}
            </div>

            <div className="flex flex-col gap-2">
              {questionState.shuffledCategories.map((word, idx) =>
                renderWordButton(
                  word,
                  idx,
                  questionState.selectedCategory === idx,
                  handleSelectCategory
                )
              )}
            </div>

            <div className="flex flex-col gap-2">
              {questionState.shuffledCharacteristics.map((word, idx) =>
                renderWordButton(
                  word,
                  idx,
                  questionState.selectedCharacteristic === idx,
                  handleSelectCharacteristic
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {questionState.feedbackState !== "none" && (
        <div
          className={`rounded-lg px-4 py-2 font-medium text-sm ${
            questionState.feedbackState === "correct"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {questionState.feedbackState === "correct"
            ? "¡Correcto!"
            : "Incorrecto, intenta de nuevo"}
        </div>
      )}

      <p className="text-muted-foreground text-sm">
        {questionState.matchedCount} / {questionState.groups.length} grupos
        emparejados
      </p>
    </div>
  );
}
