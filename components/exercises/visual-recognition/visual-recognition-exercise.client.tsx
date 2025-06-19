"use client";

import { useEffect, useState } from "react";
import { useExerciseExecution } from "@/contexts/exercise-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseControls } from "../exercise-controls";
import { VisualRecognitionResults } from "./visual-recognition-results";
import { categoryDisplayNames } from "@/lib/medias/generate";
import {
  type VisualRecognitionConfig,
  type VisualRecognitionQuestionResult,
  type ImageCategory,
  type ImageData,
} from "./visual-recognition-schema";
import { createMediaUrl } from "@/lib/utils";

interface VisualRecognitionExerciseClientProps {
  config: VisualRecognitionConfig;
  images: ImageData[];
}

interface QuestionState {
  targetCategory: ImageCategory | null;
  displayedImages: ImageData[];
  correctImageIds: string[];
  selectedImageIds: string[];
}

export function VisualRecognitionExerciseClient({
  config,
  images,
}: VisualRecognitionExerciseClientProps) {
  const {
    imagesPerQuestion,
    correctImagesCount,
    categories,
    showImageNames,
    totalQuestions,
  } = config;

  const {
    exerciseState,
    currentQuestionIndex,
    addQuestionResult,
    startExercise,
    resetExercise,
    results,
  } = useExerciseExecution();

  const [questionState, setQuestionState] = useState<QuestionState>({
    targetCategory: null,
    displayedImages: [],
    correctImageIds: [],
    selectedImageIds: [],
  });

  // Select random images for the question
  function selectImagesForQuestion(): {
    targetCategory: ImageCategory;
    displayedImages: ImageData[];
    correctImageIds: string[];
  } {
    // Select random target category
    const targetCategory = categories[
      Math.floor(Math.random() * categories.length)
    ] as ImageCategory;

    // Get correct images from target category
    const targetCategoryImages = images.filter(
      (img) => img.category === targetCategory
    );
    const shuffledTargetImages = [...targetCategoryImages].sort(
      () => 0.5 - Math.random()
    );
    const correctImages = shuffledTargetImages.slice(0, correctImagesCount);

    // Get distractor images from other categories
    const distractorCategories = categories.filter(
      (cat) => cat !== targetCategory
    ) as ImageCategory[];
    const distractorImagesNeeded = imagesPerQuestion - correctImagesCount;
    const distractorImages: ImageData[] = [];

    // Distribute distractors across other categories
    const imagesPerDistractorCategory = Math.ceil(
      distractorImagesNeeded / distractorCategories.length
    );

    distractorCategories.forEach((category) => {
      const categoryImages = images.filter((img) => img.category === category);
      const shuffledCategoryImages = [...categoryImages].sort(
        () => 0.5 - Math.random()
      );
      const selectedFromCategory = shuffledCategoryImages.slice(
        0,
        imagesPerDistractorCategory
      );
      distractorImages.push(...selectedFromCategory);
    });

    // Take only the needed number of distractors
    const finalDistractors = distractorImages.slice(0, distractorImagesNeeded);

    // Combine and shuffle all images
    const allImages = [...correctImages, ...finalDistractors];
    const shuffledAllImages = allImages.sort(() => 0.5 - Math.random());

    return {
      targetCategory,
      displayedImages: shuffledAllImages,
      correctImageIds: correctImages.map((img) => img.id),
    };
  }

  // Setup new question
  function setupNewQuestion() {
    if (exerciseState !== "executing") return;

    const { targetCategory, displayedImages, correctImageIds } =
      selectImagesForQuestion();

    setQuestionState({
      targetCategory,
      displayedImages,
      correctImageIds,
      selectedImageIds: [],
    });
  }

  // Handle image click
  function handleImageClick(imageId: string) {
    if (exerciseState !== "executing" || !questionState.targetCategory) return;

    setQuestionState((prev) => {
      const isSelected = prev.selectedImageIds.includes(imageId);
      const updatedSelected = isSelected
        ? prev.selectedImageIds.filter((id) => id !== imageId)
        : [...prev.selectedImageIds, imageId];

      return {
        ...prev,
        selectedImageIds: updatedSelected,
      };
    });
  }

  // Submit answer
  function submitAnswer() {
    if (!questionState.targetCategory) return;

    const result: VisualRecognitionQuestionResult = {
      targetCategory: questionState.targetCategory,
      correctImages: questionState.correctImageIds,
      selectedImages: questionState.selectedImageIds,
      timeSpent: 0,
      timeExpired: false,
    };

    addQuestionResult(result);
  }

  // Setup question when exercise starts or question changes
  useEffect(() => {
    if (exerciseState === "executing") {
      setupNewQuestion();
    }
  }, [currentQuestionIndex, exerciseState]);

  // Cleanup on unmount (no timer to clear)

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {exerciseState === "finished" ? (
        <VisualRecognitionResults
          results={results as VisualRecognitionQuestionResult[]}
          onReset={resetExercise}
        />
      ) : (
        <>
          <div className="text-center mb-4">
            {exerciseState === "executing" && questionState.targetCategory && (
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                </p>
                <div className="mt-4">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Categoría:{" "}
                    {categoryDisplayNames[questionState.targetCategory]}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {exerciseState === "executing" &&
            questionState.displayedImages.length > 0 && (
              <div className="w-full max-w-6xl space-y-6">
                {/* Images Grid - Maximum 3 per row with bigger images */}
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {questionState.displayedImages.map((image) => {
                        const isSelected =
                          questionState.selectedImageIds.includes(image.id);
                        return (
                          <div
                            key={image.id}
                            className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 hover:shadow-md"
                            }`}
                            onClick={() => handleImageClick(image.id)}
                          >
                            <img
                              src={
                                createMediaUrl(image.url) || "/placeholder.svg"
                              }
                              alt={
                                showImageNames
                                  ? image.name
                                  : "Imagen del ejercicio"
                              }
                              className="w-full h-48 md:h-56 lg:h-64 object-cover rounded-md"
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
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={submitAnswer}
                    size="lg"
                    disabled={questionState.selectedImageIds.length === 0}
                  >
                    Confirmar Selección ({questionState.selectedImageIds.length}{" "}
                    seleccionadas)
                  </Button>
                </div>
              </div>
            )}

          <ExerciseControls
            exerciseState={exerciseState}
            onStart={startExercise}
            onReset={resetExercise}
          />
        </>
      )}
    </div>
  );
}
