"use client";

import { Check, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import {
  COLUMN_KEYS,
  COLUMN_LABELS,
  getRandomGroups,
  type WordGroup,
} from "./word-groups-dataset";
import type {
  WordMatchingConfig,
  WordMatchingQuestionResult,
} from "./word-matching.schema";

// Vibrant card colors for matched groups
const MATCH_COLORS = [
  {
    bg: "bg-emerald-100",
    border: "border-emerald-400",
    text: "text-emerald-800",
  },
  { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-800" },
  {
    bg: "bg-purple-100",
    border: "border-purple-400",
    text: "text-purple-800",
  },
  { bg: "bg-amber-100", border: "border-amber-400", text: "text-amber-800" },
  { bg: "bg-pink-100", border: "border-pink-400", text: "text-pink-800" },
  { bg: "bg-cyan-100", border: "border-cyan-400", text: "text-cyan-800" },
];

// Column header colors
const COLUMN_HEADER_COLORS = [
  "bg-emerald-500 text-white",
  "bg-blue-500 text-white",
  "bg-purple-500 text-white",
  "bg-amber-500 text-white",
];

// Unmatched card colors per column
const COLUMN_CARD_COLORS = [
  {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
    selected: "bg-emerald-500 text-white border-emerald-600",
  },
  {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    selected: "bg-blue-500 text-white border-blue-600",
  },
  {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-900",
    selected: "bg-purple-500 text-white border-purple-600",
  },
  {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    selected: "bg-amber-500 text-white border-amber-600",
  },
];

interface WordMatchingExerciseProps {
  config: WordMatchingConfig;
}

interface QuestionState {
  groups: WordGroup[];
  shuffledColumns: string[][];
  selections: (number | null)[];
  matchedWords: Map<string, number>;
  matchedCount: number;
  incorrectAttempts: number;
  totalAttempts: number;
  feedbackState: "none" | "correct" | "incorrect";
  activeColumnIndex: number | null;
  // Phrase input state
  pendingPhraseGroup: WordGroup | null;
  phraseInput: string;
  phrases: { expected: string; entered: string }[];
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
  const { groupsPerRound, numberOfColumns, requirePhrase } = config;
  const { currentQuestionIndex, addResult } = useExerciseExecution();

  const activeKeys = COLUMN_KEYS.slice(0, numberOfColumns);

  const questionStartTime = useRef(Date.now());
  const feedbackTimeout = useRef<NodeJS.Timeout | null>(null);
  const phraseInputRef = useRef<HTMLInputElement>(null);

  const [questionState, setQuestionState] = useState<QuestionState>({
    groups: [],
    shuffledColumns: [],
    selections: new Array(numberOfColumns).fill(null),
    matchedWords: new Map(),
    matchedCount: 0,
    incorrectAttempts: 0,
    totalAttempts: 0,
    feedbackState: "none",
    activeColumnIndex: null,
    pendingPhraseGroup: null,
    phraseInput: "",
    phrases: [],
  });

  // Setup question when round changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentQuestionIndex is intentionally used as a trigger to reset the question
  useEffect(() => {
    if (feedbackTimeout.current) {
      clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = null;
    }

    const groups = getRandomGroups(groupsPerRound);

    const shuffledColumns = activeKeys.map((key) =>
      shuffleArray(groups.map((g) => g[key]))
    );

    questionStartTime.current = Date.now();
    setQuestionState({
      groups,
      shuffledColumns,
      selections: new Array(numberOfColumns).fill(null),
      matchedWords: new Map(),
      matchedCount: 0,
      incorrectAttempts: 0,
      totalAttempts: 0,
      feedbackState: "none",
      activeColumnIndex: null,
      pendingPhraseGroup: null,
      phraseInput: "",
      phrases: [],
    });

    return () => {
      if (feedbackTimeout.current) {
        clearTimeout(feedbackTimeout.current);
      }
    };
  }, [currentQuestionIndex, groupsPerRound, numberOfColumns]);

  function completeRound(
    state: QuestionState,
    newMatchedCount: number,
    newTotalAttempts: number
  ) {
    const timeSpent = Date.now() - questionStartTime.current;
    const result: WordMatchingQuestionResult = {
      expectedGroups: state.groups,
      correctMatches: newMatchedCount,
      totalAttempts: newTotalAttempts,
      incorrectAttempts: state.incorrectAttempts,
      timeSpent,
      phrases: state.phrases.length > 0 ? state.phrases : undefined,
    };
    setTimeout(() => addResult(result), 400);
  }

  function clearFeedbackAfterDelay() {
    if (feedbackTimeout.current) {
      clearTimeout(feedbackTimeout.current);
    }
    feedbackTimeout.current = setTimeout(() => {
      setQuestionState((prev) => ({ ...prev, feedbackState: "none" }));
    }, 600);
  }

  function handleCorrectMatch(
    newMatchedWords: Map<string, number>,
    newMatchedCount: number,
    newTotalAttempts: number,
    matchedGroup: WordGroup
  ) {
    const emptySelections = new Array(numberOfColumns).fill(null);

    if (requirePhrase) {
      setQuestionState((prev) => ({
        ...prev,
        selections: emptySelections,
        matchedWords: newMatchedWords,
        matchedCount: newMatchedCount,
        totalAttempts: newTotalAttempts,
        feedbackState: "correct",
        activeColumnIndex: null,
        pendingPhraseGroup: matchedGroup,
        phraseInput: "",
      }));

      if (feedbackTimeout.current) {
        clearTimeout(feedbackTimeout.current);
      }
      feedbackTimeout.current = setTimeout(() => {
        setQuestionState((prev) => ({ ...prev, feedbackState: "none" }));
        phraseInputRef.current?.focus();
      }, 600);
    } else {
      setQuestionState((prev) => ({
        ...prev,
        selections: emptySelections,
        matchedWords: newMatchedWords,
        matchedCount: newMatchedCount,
        totalAttempts: newTotalAttempts,
        feedbackState: "correct",
        activeColumnIndex: null,
      }));

      clearFeedbackAfterDelay();

      if (newMatchedCount === questionState.groups.length) {
        completeRound(questionState, newMatchedCount, newTotalAttempts);
      }
    }
  }

  function tryMatch(selections: (number | null)[]) {
    if (selections.some((s) => s === null)) {
      return;
    }

    const selectedWords = selections.map(
      (idx, colIdx) => questionState.shuffledColumns[colIdx][idx as number]
    );

    const groupIdx = questionState.groups.findIndex((g) =>
      activeKeys.every((key, i) => g[key] === selectedWords[i])
    );

    if (groupIdx !== -1) {
      const colorIdx = questionState.matchedCount;
      const newMatchedWords = new Map(questionState.matchedWords);
      for (const word of selectedWords) {
        newMatchedWords.set(word, colorIdx);
      }

      handleCorrectMatch(
        newMatchedWords,
        questionState.matchedCount + 1,
        questionState.totalAttempts + 1,
        questionState.groups[groupIdx]
      );
    } else {
      setQuestionState((prev) => ({
        ...prev,
        selections: new Array(numberOfColumns).fill(null),
        incorrectAttempts: prev.incorrectAttempts + 1,
        totalAttempts: prev.totalAttempts + 1,
        feedbackState: "incorrect",
        activeColumnIndex: null,
      }));

      clearFeedbackAfterDelay();
    }
  }

  function handleSelect(columnIndex: number, wordIndex: number) {
    const word = questionState.shuffledColumns[columnIndex][wordIndex];
    if (questionState.matchedWords.has(word)) {
      return;
    }
    if (questionState.pendingPhraseGroup) {
      return;
    }

    const newSelections = [...questionState.selections];
    newSelections[columnIndex] =
      newSelections[columnIndex] === wordIndex ? null : wordIndex;

    const newActiveColumn =
      newSelections[columnIndex] === null ? null : columnIndex;

    setQuestionState((prev) => ({
      ...prev,
      selections: newSelections,
      activeColumnIndex: newActiveColumn,
    }));
    tryMatch(newSelections);
  }

  function handlePhraseSubmit() {
    if (!questionState.pendingPhraseGroup) {
      return;
    }

    const group = questionState.pendingPhraseGroup;
    const expectedWords = activeKeys.map((key) => group[key]);
    const expected = expectedWords.join(" ");
    const entered = questionState.phraseInput.trim();

    const newPhrases = [...questionState.phrases, { expected, entered }];

    const newState: Partial<QuestionState> = {
      pendingPhraseGroup: null,
      phraseInput: "",
      phrases: newPhrases,
    };

    setQuestionState((prev) => ({ ...prev, ...newState }));

    if (questionState.matchedCount === questionState.groups.length) {
      const updatedState = { ...questionState, phrases: newPhrases };
      completeRound(
        updatedState,
        questionState.matchedCount,
        questionState.totalAttempts
      );
    }
  }

  function handlePhraseKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePhraseSubmit();
    }
  }

  // Determine which words are in the active column
  const hasActiveSelection = questionState.selections.some((s) => s !== null);

  const GRID_COLS_MAP: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };
  const gridColsClass = GRID_COLS_MAP[numberOfColumns] ?? "grid-cols-3";

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-4 p-4">
      {/* Column headers */}
      <div className={`grid w-full gap-3 ${gridColsClass}`}>
        {activeKeys.map((key, colIdx) => {
          const isColumnActive =
            questionState.activeColumnIndex === colIdx || !hasActiveSelection;
          const isColumnDimmed = hasActiveSelection && !isColumnActive;

          return (
            <div
              className={`rounded-xl px-4 py-2.5 text-center font-bold text-base tracking-wide transition-opacity duration-300 ${COLUMN_HEADER_COLORS[colIdx]} ${isColumnDimmed ? "opacity-30" : "opacity-100"}`}
              key={key}
            >
              {COLUMN_LABELS[key]}
            </div>
          );
        })}
      </div>

      {/* Word grid */}
      <div className={`grid w-full gap-3 ${gridColsClass}`}>
        {activeKeys.map((key, colIdx) => {
          const columnWords = questionState.shuffledColumns[colIdx] ?? [];
          const isColumnActive =
            questionState.activeColumnIndex === colIdx || !hasActiveSelection;
          const isColumnDimmed = hasActiveSelection && !isColumnActive;
          const colors = COLUMN_CARD_COLORS[colIdx];

          return (
            <div
              className={`flex flex-col gap-2 transition-opacity duration-300 ${isColumnDimmed ? "opacity-30" : "opacity-100"}`}
              key={key}
            >
              {columnWords.map((word, idx) => {
                const isMatched = questionState.matchedWords.has(word);
                const colorIdx = questionState.matchedWords.get(word);
                const isSelected = questionState.selections[colIdx] === idx;
                const matchColor = isMatched
                  ? MATCH_COLORS[colorIdx ?? 0]
                  : null;

                let cardStyle: string;
                if (isMatched) {
                  cardStyle = `${matchColor?.bg} ${matchColor?.border} ${matchColor?.text} opacity-40`;
                } else if (isSelected) {
                  cardStyle = `${colors.selected} scale-[1.03] shadow-md`;
                } else {
                  cardStyle = `${colors.bg} ${colors.border} ${colors.text} hover:scale-[1.02] hover:shadow-sm`;
                }

                return (
                  <button
                    className={`w-full rounded-xl border-2 px-4 py-3.5 font-semibold text-lg transition-all duration-200 ${cardStyle}`}
                    disabled={isMatched || !!questionState.pendingPhraseGroup}
                    key={word}
                    onClick={() => handleSelect(colIdx, idx)}
                    type="button"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isMatched && <Check className="h-5 w-5" />}
                      {word}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Phrase input area */}
      {questionState.pendingPhraseGroup && (
        <div className="w-full max-w-2xl rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4">
          <p className="mb-3 text-center font-medium text-base text-indigo-900">
            Escribe una frase combinando las palabras:{" "}
            <span className="font-bold">
              {activeKeys
                .map((key) => questionState.pendingPhraseGroup?.[key])
                .join(", ")}
            </span>
          </p>
          <div className="flex gap-2">
            <Input
              className="flex-1 border-indigo-300 bg-white text-base"
              onChange={(e) =>
                setQuestionState((prev) => ({
                  ...prev,
                  phraseInput: (e.target as HTMLInputElement).value,
                }))
              }
              onKeyDown={handlePhraseKeyDown}
              placeholder="Escribe tu frase aquí..."
              ref={phraseInputRef}
              value={questionState.phraseInput}
            />
            <Button
              disabled={!questionState.phraseInput.trim()}
              onClick={handlePhraseSubmit}
              size="lg"
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar
            </Button>
          </div>
        </div>
      )}

      {/* Feedback */}
      {questionState.feedbackState !== "none" && (
        <div
          className={`rounded-xl px-6 py-3 font-semibold text-base ${
            questionState.feedbackState === "correct"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {questionState.feedbackState === "correct"
            ? "¡Correcto!"
            : "Incorrecto, intenta de nuevo"}
        </div>
      )}

      {/* Progress */}
      <p className="font-medium text-base text-muted-foreground">
        {questionState.matchedCount} / {questionState.groups.length} grupos
        emparejados
      </p>
    </div>
  );
}
