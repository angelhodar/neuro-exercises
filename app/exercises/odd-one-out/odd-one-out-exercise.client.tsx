"use client";

import { useMemo, useState } from "react";
import { OddOneOutConfig, OddOneOutResult } from "./odd-one-out.schema";
import { CheckCircle, XCircle } from "lucide-react";
import { SelectableMediaCard } from "@/components/media-card";
import { SelectableMediaSchema } from "@/lib/schemas/medias";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { createBlobUrl } from "@/lib/utils";

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
  const { currentQuestionIndex, addResult } = useExerciseExecution();

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
      addResult({
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
    <div className="flex flex-col items-center gap-6 p-4 w-full h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentQuestion.options.map((media) => {
          const isSelected = questionState.selectedAnswerId === media.id;
          
          return (
            <SelectableMediaCard
              key={media.id}
              src={createBlobUrl(media.blobKey)}
              alt={media.name}
              name={media.name}
              showName={true}
              selected={isSelected}
              disabled={questionState.isAnswered}
              onSelect={() => handleSelectAnswer(media.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
