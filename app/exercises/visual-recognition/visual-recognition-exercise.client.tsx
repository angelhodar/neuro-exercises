"use client";

import { useEffect, useState, useRef } from "react";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";
import { Badge } from "@/components/ui/badge";
import { SelectableMediaCard } from "@/components/media-card";
import {
  type VisualRecognitionConfig,
  type VisualRecognitionQuestionResult,
  type ImageData,
} from "./visual-recognition.schema";
import { createBlobUrl } from "@/lib/utils";

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
    // Reset submission flag for new question
    hasSubmittedRef.current = false;
    
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
        pendingResult: null,
      });
      return;
    }
    setQuestionState({ 
      ...questionData, 
      selectedImageIds: [], 
      isAnswerSubmitted: false,
      pendingResult: null,
    });
  }

  function handleImageClick(imageId: string) {
    // Prevent clicks if already submitted
    if (questionState.isAnswerSubmitted || hasSubmittedRef.current) return;
    
    const isSelected = questionState.selectedImageIds.includes(imageId);
    const updatedSelected = isSelected
      ? questionState.selectedImageIds.filter((id) => id !== imageId)
      : [...questionState.selectedImageIds, imageId];
    
    // Check if we have the correct number of images selected and haven't submitted yet
    if (updatedSelected.length === correctImagesCount && !questionState.isAnswerSubmitted && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      
      // Create result immediately
      const result = {
        targetTag: questionState.targetTag!,
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
            <SelectableMediaCard
              key={image.id}
              src={createBlobUrl(image.url)}
              alt={showImageNames ? image.name : "Imagen del ejercicio"}
              name={image.name}
              showName={showImageNames}
              selected={isSelected}
              disabled={questionState.isAnswerSubmitted}
              onSelect={() => handleImageClick(image.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
