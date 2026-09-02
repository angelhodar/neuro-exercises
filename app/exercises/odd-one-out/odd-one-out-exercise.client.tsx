"use client";

import { useMemo, useState } from "react";
import {
  MultimediaCard,
  MultimediaCardThumbnail,
  MultimediaCardTitle,
} from "@/components/media/multimedia-card";
import { Selectable } from "@/components/selectable";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import type { SelectableMediaSchema } from "@/lib/schemas/medias";
import { createBlobUrl } from "@/lib/utils";
import type { OddOneOutConfig, OddOneOutResult } from "./odd-one-out.schema";

interface OddOneOutExerciseClientProps {
  config: OddOneOutConfig;
  medias: SelectableMediaSchema[];
}

interface QuestionState {
  isAnswered: boolean;
  selectedAnswerId: number | null;
}

export function OddOneOutExerciseClient({
  config,
  medias,
}: OddOneOutExerciseClientProps) {
  const { currentQuestionIndex, addResult } = useExerciseExecution();

  const [questionState, setQuestionState] = useState<QuestionState>({
    isAnswered: false,
    selectedAnswerId: null,
  });

  // Crear un mapa para acceso rápido por id
  const mediaMap = useMemo(() => {
    const map: Record<number, SelectableMediaSchema> = {};
    for (const m of medias) {
      map[m.id] = m;
    }
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
          correctAnswerId: q.outlierMedia[0].id,
          options,
        };
      }),
    [config, mediaMap]
  );

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (mediaId: number) => {
    if (questionState.isAnswered) {
      return;
    }

    setQuestionState((prev) => ({
      ...prev,
      isAnswered: true,
      selectedAnswerId: mediaId,
    }));

    // Enviar resultado automáticamente después de un breve delay para mostrar feedback
    setTimeout(() => {
      const isCorrect = mediaId === currentQuestion.correctAnswerId;
      addResult({
        correctId: currentQuestion.correctAnswerId,
        isCorrect,
        questionIndex: currentQuestionIndex,
        selectedId: mediaId,
      } as OddOneOutResult);

      // Reset para la siguiente pregunta
      setQuestionState((prev) => ({
        ...prev,
        isAnswered: false,
        selectedAnswerId: null,
      }));
    }, 1500); // 1.5 segundos para ver el feedback
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-4">
      <div className="grid w-full max-w-5xl grid-cols-2 gap-6 lg:grid-cols-3">
        {currentQuestion.options.map((media) => {
          const isSelected = questionState.selectedAnswerId === media.id;

          return (
            <Selectable
              key={media.id}
              onClick={() => handleSelectAnswer(media.id)}
              selected={isSelected}
            >
              <MultimediaCard
                alt={media.name}
                className="h-full"
                preview={false}
                src={createBlobUrl(media.blobKey)}
                type="image"
              >
                <MultimediaCardThumbnail />
                <MultimediaCardTitle className="line-clamp-2 whitespace-normal text-center">
                  {media.name}
                </MultimediaCardTitle>
              </MultimediaCard>
            </Selectable>
          );
        })}
      </div>
    </div>
  );
}
