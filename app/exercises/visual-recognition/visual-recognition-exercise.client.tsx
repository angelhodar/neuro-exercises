"use client";

import { useEffect, useState } from "react";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { Badge } from "@/components/ui/badge";
import {
  type VisualRecognitionConfig,
  type VisualRecognitionQuestionResult,
  type ImageData,
} from "./visual-recognition.schema";
import { cn, createBlobUrl } from "@/lib/utils";

interface VisualRecognitionExerciseClientProps {
  config: VisualRecognitionConfig;
  images: ImageData[];
}

interface QuestionState {
  targetTag: string | null;
  displayedImages: ImageData[];
  correctImageIds: string[];
  selectedImageIds: string[];
  isAnswerSubmitted: boolean;
}

export function VisualRecognitionExerciseClient({
  config,
  images,
}: VisualRecognitionExerciseClientProps) {
  const { imagesPerQuestion, correctImagesCount, tags, showImageNames } =
    config;

  const { currentQuestionIndex, addQuestionResult } = useExerciseExecution();

  const [questionState, setQuestionState] = useState<QuestionState>({
    targetTag: null,
    displayedImages: [],
    correctImageIds: [],
    selectedImageIds: [],
    isAnswerSubmitted: false,
  });

  function selectImagesForQuestion(): {
    targetTag: string;
    displayedImages: ImageData[];
    correctImageIds: string[];
  } | null {
    if (tags.length < 2) return null;

    const targetTag = tags[Math.floor(Math.random() * tags.length)];

    const targetImages = images.filter((img) => img.tags.includes(targetTag));
    if (targetImages.length < correctImagesCount) return null;

    const shuffledTargetImages = [...targetImages].sort(
      () => 0.5 - Math.random(),
    );
    const correctImages = shuffledTargetImages.slice(0, correctImagesCount);

    const distractorTags = tags.filter((t) => t !== targetTag);
    const distractorImagesNeeded = imagesPerQuestion - correctImagesCount;

    const potentialDistractors = images.filter(
      (img) =>
        !img.tags.includes(targetTag) &&
        img.tags.some((t) => distractorTags.includes(t)),
    );

    if (potentialDistractors.length < distractorImagesNeeded) return null;

    const shuffledDistractors = [...potentialDistractors].sort(
      () => 0.5 - Math.random(),
    );
    const distractorImages = shuffledDistractors.slice(
      0,
      distractorImagesNeeded,
    );

    const allImages = [...correctImages, ...distractorImages].sort(
      () => 0.5 - Math.random(),
    );

    return {
      targetTag,
      displayedImages: allImages,
      correctImageIds: correctImages.map((img) => img.id),
    };
  }

  function setupNewQuestion() {
    const questionData = selectImagesForQuestion();
    if (!questionData) {
      console.error(
        "No se pudieron generar las preguntas. Verifica la configuración y las imágenes disponibles.",
      );
      setQuestionState({
        targetTag: "Error",
        displayedImages: [],
        correctImageIds: [],
        selectedImageIds: [],
        isAnswerSubmitted: false,
      });
      return;
    }
    setQuestionState({ ...questionData, selectedImageIds: [], isAnswerSubmitted: false });
  }

  function handleImageClick(imageId: string) {
    if (questionState.isAnswerSubmitted) return;
    
    setQuestionState((prev) => {
      const isSelected = prev.selectedImageIds.includes(imageId);
      const updatedSelected = isSelected
        ? prev.selectedImageIds.filter((id) => id !== imageId)
        : [...prev.selectedImageIds, imageId];
      
      const newState = { ...prev, selectedImageIds: updatedSelected };
      
      if (updatedSelected.length === correctImagesCount && !prev.isAnswerSubmitted) {
        newState.isAnswerSubmitted = true;
        
        setTimeout(() => {
          addQuestionResult({
            targetTag: prev.targetTag!,
            correctImages: prev.correctImageIds,
            selectedImages: updatedSelected,
            timeSpent: 0,
            timeExpired: false,
          } as VisualRecognitionQuestionResult);
        }, 100);
      }
      
      return newState;
    });
  }

  useEffect(() => {
    setupNewQuestion();
  }, [currentQuestionIndex]);

  if (questionState.targetTag === "Error") {
    return (
      <div className="text-center p-8">
        <p className="font-bold text-red-600">Error al generar la pregunta</p>
        <p className="text-muted-foreground">
          No hay suficientes imágenes con las etiquetas configuradas para crear
          la pregunta.
        </p>
        <p className="text-muted-foreground mt-2">
          Asegúrate de tener suficientes imágenes correctas y distractoras.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full h-full">
      <Badge variant="outline" className="mt-6 text-2xl px-4 py-2 capitalize">
        {questionState.targetTag}
      </Badge>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questionState.displayedImages.map((image) => {
          const isSelected = questionState.selectedImageIds.includes(image.id);
          return (
            <div
              key={image.id}
              className={cn(
                "relative cursor-pointer rounded-lg border-2 transition-all duration-200 bg-white",
                questionState.isAnswerSubmitted && "pointer-events-none opacity-75",
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 hover:shadow-md",
              )}
              onClick={() => handleImageClick(image.id)}
            >
              <img
                src={createBlobUrl(image.url) || "/placeholder.svg"}
                alt={showImageNames ? image.name : "Imagen del ejercicio"}
                className="w-full h-48 md:h-56 lg:h-64 object-cover p-1 rounded-lg"
                crossOrigin="anonymous"
              />
              {isSelected && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-lg">
                  ✓
                </div>
              )}
              {showImageNames && (
                <div className="p-3 text-center">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {image.name}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
