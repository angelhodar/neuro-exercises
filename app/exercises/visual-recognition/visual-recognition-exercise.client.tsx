"use client";

import { useEffect, useRef, useState } from "react";
import {
  MediaCard,
  MediaCardContainer,
  MediaCardTitle,
} from "@/components/media/media-card";
import { MediaImage } from "@/components/media/media-image";
import { Selectable } from "@/components/selectable";
import { Badge } from "@/components/ui/badge";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { createBlobUrl } from "@/lib/utils";
import type {
  ImageData,
  VisualRecognitionConfig,
  VisualRecognitionQuestionResult,
} from "./visual-recognition.schema";

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
  pendingResult: VisualRecognitionQuestionResult | null;
}

export function VisualRecognitionExerciseClient({
  config,
  images,
}: VisualRecognitionExerciseClientProps) {
  const { imagesPerQuestion, correctImagesCount, tags, showImageNames } =
    config;

  const { currentQuestionIndex, addResult } = useExerciseExecution();

  // Use ref to prevent multiple submissions for the same question
  const hasSubmittedRef = useRef(false);

  const [questionState, setQuestionState] = useState<QuestionState>({
    targetTag: null,
    displayedImages: [],
    correctImageIds: [],
    selectedImageIds: [],
    isAnswerSubmitted: false,
    pendingResult: null,
  });

  function handleImageClick(imageId: string) {
    // Prevent clicks if already submitted
    if (questionState.isAnswerSubmitted || hasSubmittedRef.current) {
      return;
    }

    const isSelected = questionState.selectedImageIds.includes(imageId);
    const updatedSelected = isSelected
      ? questionState.selectedImageIds.filter((id) => id !== imageId)
      : [...questionState.selectedImageIds, imageId];

    // Check if we have the correct number of images selected and haven't submitted yet
    if (
      updatedSelected.length === correctImagesCount &&
      !questionState.isAnswerSubmitted &&
      !hasSubmittedRef.current
    ) {
      hasSubmittedRef.current = true;

      // Create result immediately
      const result = {
        targetTag: questionState.targetTag ?? "",
        correctImages: questionState.correctImageIds,
        selectedImages: updatedSelected,
        timeSpent: 0,
        timeExpired: false,
      } as VisualRecognitionQuestionResult;

      // Update state with result and submitted flag
      setQuestionState((prev) => ({
        ...prev,
        selectedImageIds: updatedSelected,
        isAnswerSubmitted: true,
        pendingResult: result,
      }));
    } else {
      // Just update selected images
      setQuestionState((prev) => ({
        ...prev,
        selectedImageIds: updatedSelected,
      }));
    }
  }

  // Process pending results
  useEffect(() => {
    if (questionState.pendingResult) {
      addResult(questionState.pendingResult);
      setQuestionState((prev) => ({
        ...prev,
        pendingResult: null,
      }));
    }
  }, [questionState.pendingResult, addResult]);

  // Setup question when question changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentQuestionIndex is intentionally used as a trigger to reset the question
  useEffect(() => {
    hasSubmittedRef.current = false;

    if (tags.length < 2) {
      console.error(
        "No se pudieron generar las preguntas. Verifica la configuracion y las imagenes disponibles."
      );
      setQuestionState({
        targetTag: "Error",
        displayedImages: [],
        correctImageIds: [],
        selectedImageIds: [],
        isAnswerSubmitted: false,
        pendingResult: null,
      });
      return;
    }

    const targetTag = tags[Math.floor(Math.random() * tags.length)];
    const targetImages = images.filter((img) => img.tags.includes(targetTag));

    if (targetImages.length < correctImagesCount) {
      setQuestionState({
        targetTag: "Error",
        displayedImages: [],
        correctImageIds: [],
        selectedImageIds: [],
        isAnswerSubmitted: false,
        pendingResult: null,
      });
      return;
    }

    const shuffledTargetImages = [...targetImages].sort(
      () => 0.5 - Math.random()
    );
    const correctImages = shuffledTargetImages.slice(0, correctImagesCount);

    const distractorTags = tags.filter((t) => t !== targetTag);
    const distractorImagesNeeded = imagesPerQuestion - correctImagesCount;

    const potentialDistractors = images.filter(
      (img) =>
        !img.tags.includes(targetTag) &&
        img.tags.some((t) => distractorTags.includes(t))
    );

    if (potentialDistractors.length < distractorImagesNeeded) {
      setQuestionState({
        targetTag: "Error",
        displayedImages: [],
        correctImageIds: [],
        selectedImageIds: [],
        isAnswerSubmitted: false,
        pendingResult: null,
      });
      return;
    }

    const shuffledDistractors = [...potentialDistractors].sort(
      () => 0.5 - Math.random()
    );
    const distractorImages = shuffledDistractors.slice(
      0,
      distractorImagesNeeded
    );

    const allImages = [...correctImages, ...distractorImages].sort(
      () => 0.5 - Math.random()
    );

    setQuestionState({
      targetTag,
      displayedImages: allImages,
      correctImageIds: correctImages.map((img) => img.id),
      selectedImageIds: [],
      isAnswerSubmitted: false,
      pendingResult: null,
    });
  }, [
    currentQuestionIndex,
    tags,
    images,
    correctImagesCount,
    imagesPerQuestion,
  ]);

  if (questionState.targetTag === "Error") {
    return (
      <div className="p-8 text-center">
        <p className="font-bold text-red-600">Error al generar la pregunta</p>
        <p className="text-muted-foreground">
          No hay suficientes imágenes con las etiquetas configuradas para crear
          la pregunta.
        </p>
        <p className="mt-2 text-muted-foreground">
          Asegúrate de tener suficientes imágenes correctas y distractoras.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center gap-6 p-4">
      <Badge className="mt-6 px-4 py-2 text-2xl capitalize" variant="outline">
        {questionState.targetTag}
      </Badge>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {questionState.displayedImages.map((image) => {
          const isSelected = questionState.selectedImageIds.includes(image.id);
          return (
            <Selectable
              key={image.id}
              onClick={() => handleImageClick(image.id)}
              selected={isSelected}
            >
              <MediaCard>
                <MediaCardContainer>
                  <MediaImage
                    alt={showImageNames ? image.name : "Imagen del ejercicio"}
                    height={300}
                    src={createBlobUrl(image.url)}
                    width={300}
                  />
                </MediaCardContainer>
                {showImageNames && (
                  <div className="p-2">
                    <MediaCardTitle className="line-clamp-2 text-center text-sm">
                      {image.name}
                    </MediaCardTitle>
                  </div>
                )}
              </MediaCard>
            </Selectable>
          );
        })}
      </div>
    </div>
  );
}
