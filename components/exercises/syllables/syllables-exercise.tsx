"use client"

import { useEffect, useState } from "react"
import { useExerciseExecution } from "@/hooks/use-exercise-execution"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExerciseControls } from "../exercise-controls"
import { SyllablesResults } from "./syllables-results"
import {
  spanishWordsDataset,
  type SyllablesConfig,
  type SyllablesQuestionResult,
  type SpanishWord,
} from "./syllables-schema"

interface SyllablesExerciseProps {
  config: SyllablesConfig
}

interface QuestionState {
  currentWord: SpanishWord | null
  scrambledSyllables: string[]
  selectedSyllables: string[]
}

export function SyllablesExercise({ config }: SyllablesExerciseProps) {
  const { syllablesCount, totalQuestions } = config
  const { exerciseState, currentQuestionIndex, addQuestionResult, startExercise, resetExercise, results } =
    useExerciseExecution()

  const [questionState, setQuestionState] = useState<QuestionState>({
    currentWord: null,
    scrambledSyllables: [],
    selectedSyllables: [],
  })

  // Get available words for the selected syllable count
  const availableWords = spanishWordsDataset[syllablesCount as keyof typeof spanishWordsDataset] || []

  // Select a random word
  function selectRandomWord(): SpanishWord {
    const randomIndex = Math.floor(Math.random() * availableWords.length)
    // @ts-ignore Its ok
    return availableWords[randomIndex]
  }

  // Scramble syllables
  function scrambleSyllables(syllables: string[]): string[] {
    const scrambled = [...syllables]
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]]
    }
    return scrambled
  }

  // Setup new question
  function setupNewQuestion() {
    if (exerciseState !== "executing") return

    const word = selectRandomWord()
    const scrambled = scrambleSyllables(word.syllables)

    setQuestionState({
      currentWord: word,
      scrambledSyllables: scrambled,
      selectedSyllables: [],
    })
  }

  // Handle syllable click
  function handleSyllableClick(syllable: string, index: number) {
    if (exerciseState !== "executing" || !questionState.currentWord) return

    const updatedSelected = [...questionState.selectedSyllables, syllable]
    const updatedScrambled = questionState.scrambledSyllables.filter((_, i) => i !== index)

    setQuestionState((prev) => ({
      ...prev,
      selectedSyllables: updatedSelected,
      scrambledSyllables: updatedScrambled,
    }))

    // Check if word is complete
    if (updatedSelected.length === questionState.currentWord.syllables.length) {
      submitAnswer(updatedSelected)
    }
  }

  // Handle selected syllable click (to remove it)
  function handleSelectedSyllableClick(syllable: string, index: number) {
    if (exerciseState !== "executing") return

    const updatedSelected = questionState.selectedSyllables.filter((_, i) => i !== index)
    const updatedScrambled = [...questionState.scrambledSyllables, syllable]

    setQuestionState((prev) => ({
      ...prev,
      selectedSyllables: updatedSelected,
      scrambledSyllables: updatedScrambled,
    }))
  }

  // Submit answer
  function submitAnswer(selectedSyllables: string[]) {
    if (!questionState.currentWord) return

    const result: SyllablesQuestionResult = {
      targetWord: questionState.currentWord.word,
      targetSyllables: questionState.currentWord.syllables,
      selectedSyllables,
      timeSpent: 0,
      timeExpired: false,
    }

    addQuestionResult(result)
  }

  // Setup question when exercise starts or question changes
  useEffect(() => {
    if (exerciseState === "executing") {
      setupNewQuestion()
    }
  }, [currentQuestionIndex, exerciseState])

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {exerciseState === "finished" ? (
        <SyllablesResults results={results as SyllablesQuestionResult[]} onReset={resetExercise} />
      ) : (
        <>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">Ejercicio de Sílabas</h2>
            <p className="text-gray-600">Haz clic en las sílabas en orden para formar la palabra</p>
            {exerciseState === "executing" && (
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                </p>
              </div>
            )}
          </div>

          {exerciseState === "executing" && questionState.currentWord && (
            <div className="w-full max-w-2xl space-y-6">
              {/* Selected syllables */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-3">Tu palabra:</h3>
                  <div className="flex flex-wrap gap-2 min-h-[3rem] items-center">
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
                    {questionState.selectedSyllables.length === 0 && (
                      <span className="text-muted-foreground text-sm">
                        Haz clic en las sílabas de abajo para construir la palabra
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Available syllables */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-3">Sílabas disponibles:</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {questionState.scrambledSyllables.map((syllable, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="lg"
                        onClick={() => handleSyllableClick(syllable, index)}
                        className="text-lg"
                      >
                        {syllable}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
