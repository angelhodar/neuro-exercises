"use client";

import { useMemo, useState } from "react";
import { OddOneOutConfig, OddOneOutResult } from "./odd-one-out-schema";
import MediaCard from "@/components/ui/templates/media-card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { SelectableMediaSchema } from "@/lib/schemas/medias";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { OddOneOutResults } from "./odd-one-out-results";
import { ExerciseControls } from "@/components/exercises/exercise-controls";

interface OddOneOutExerciseClientProps {
  config: OddOneOutConfig;
  medias: SelectableMediaSchema[];
}

export function OddOneOutExerciseClient({
  config,
  medias,
}: OddOneOutExerciseClientProps) {
  const {
    exerciseState,
    currentQuestionIndex,
    addQuestionResult,
    startExercise,
    resetExercise,
    results,
  } = useExerciseExecution();

  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Crear un mapa para acceso rápido por id
  const mediaMap = useMemo(() => {
    const map: Record<number, SelectableMediaSchema> = {};
    medias.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [medias]);

  // Construir las preguntas a partir de la config y el array de medias
  const questions = useMemo(
    () =>
      config.questions.map((q) => {
        const options = [
          ...q.patternMedias.map((m) => mediaMap[m.id]),
          ...q.outlierMedia.map((m) => mediaMap[m.id]),
        ];
        return {
          options,
          correctAnswerId: q.outlierMedia[0].id,
        };
      }),
    [config, mediaMap]
  );

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (mediaId: number) => {
    if (isAnswered || exerciseState !== "executing") return;
    setSelectedAnswerId(mediaId);
    setIsAnswered(true);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswerId == null) return;
    const isCorrect = selectedAnswerId === currentQuestion.correctAnswerId;
    addQuestionResult({
      questionIndex: currentQuestionIndex,
      selectedId: selectedAnswerId,
      correctId: currentQuestion.correctAnswerId,
      isCorrect,
    } as OddOneOutResult);
    setIsAnswered(false);
    setSelectedAnswerId(null);
  };

  // Mostrar resultados si el ejercicio terminó
  if (exerciseState === "finished") {
    return <OddOneOutResults results={results as OddOneOutResult[]} />;
  }

  return (
    <div className="flex flex-col h-full p-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-center">
        {currentQuestion.options.map((media) => {
          const isSelected = selectedAnswerId === media.id;
          const isCorrect = currentQuestion.correctAnswerId === media.id;

          let overlay = null;
          if (isAnswered && isSelected) {
            overlay = isCorrect ? (
              <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                <XCircle className="w-16 h-16 text-white" />
              </div>
            );
          } else if (isAnswered && isCorrect) {
            overlay = (
              <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            );
          }

          return (
            <div key={media.id} className="relative">
              <MediaCard
                media={media}
                variant="selectable"
                isSelected={isSelected}
                onSelect={() => handleSelectAnswer(media.id)}
                className={isAnswered && !isSelected ? "opacity-50" : ""}
              />
              {overlay}
            </div>
          );
        })}
      </div>
      <div className="flex justify-end mt-4">
        {isAnswered && (
          <Button onClick={handleSubmitAnswer}>
            {currentQuestionIndex === questions.length - 1
              ? "Finalizar"
              : "Siguiente"}
          </Button>
        )}
      </div>
    </div>
  );
}
