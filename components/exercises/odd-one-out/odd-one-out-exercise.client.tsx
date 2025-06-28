"use client";

import { useMemo, useState } from "react";
import { OddOneOutConfig, OddOneOutResult } from "./odd-one-out-schema";
import MediaCard from "@/components/ui/templates/media-card";
import { CheckCircle, XCircle } from "lucide-react";
import { SelectableMediaSchema } from "@/lib/schemas/medias";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";

interface OddOneOutExerciseClientProps {
  config: OddOneOutConfig;
  medias: SelectableMediaSchema[];
}

interface QuestionState {
  selectedAnswerId: number | null;
  isAnswered: boolean;
}

export function OddOneOutExerciseClient({
  config,
  medias,
}: OddOneOutExerciseClientProps) {
  const { currentQuestionIndex, addQuestionResult } = useExerciseExecution();

  const [questionState, setQuestionState] = useState<QuestionState>({
    selectedAnswerId: null,
    isAnswered: false,
  });

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
    if (questionState.isAnswered) return;
    
    setQuestionState(prev => ({
      ...prev,
      selectedAnswerId: mediaId,
      isAnswered: true,
    }));
    
    // Enviar resultado automáticamente después de un breve delay para mostrar feedback
    setTimeout(() => {
      const isCorrect = mediaId === currentQuestion.correctAnswerId;
      addQuestionResult({
        questionIndex: currentQuestionIndex,
        selectedId: mediaId,
        correctId: currentQuestion.correctAnswerId,
        isCorrect,
      } as OddOneOutResult);
      
      // Reset para la siguiente pregunta
      setQuestionState(prev => ({
        ...prev,
        selectedAnswerId: null,
        isAnswered: false,
      }));
    }, 1500); // 1.5 segundos para ver el feedback
  };

  return (
    <div className="flex flex-col h-full p-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-center">
        {currentQuestion.options.map((media) => {
          const isSelected = questionState.selectedAnswerId === media.id;
          const isCorrect = currentQuestion.correctAnswerId === media.id;

          let overlay = null;
          if (questionState.isAnswered && isSelected) {
            overlay = isCorrect ? (
              <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                <XCircle className="w-16 h-16 text-white" />
              </div>
            );
          } else if (questionState.isAnswered && isCorrect) {
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
                className={questionState.isAnswered && !isSelected ? "opacity-50" : ""}
              />
              {overlay}
            </div>
          );
        })}
      </div>
    </div>
  );
}
