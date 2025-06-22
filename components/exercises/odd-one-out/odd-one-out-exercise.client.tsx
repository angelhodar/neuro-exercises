"use client";

import { useState, useEffect } from "react";
import { Media } from "@/lib/db/schema";
import { OddOneOutConfig } from "./odd-one-out-schema";
import MediaCard from "@/components/ui/templates/media-card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

type Question = {
  options: Media[];
  correctAnswerId: number;
};

interface OddOneOutExerciseClientProps {
  questions: Question[];
  config: OddOneOutConfig;
}

export function OddOneOutExerciseClient({
  questions,
  config,
}: OddOneOutExerciseClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (mediaId: number) => {
    if (isAnswered) return;
    setSelectedAnswerId(mediaId);
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedAnswerId === currentQuestion.correctAnswerId;
    setResults([
      ...results,
      {
        questionIndex: currentQuestionIndex,
        selectedId: selectedAnswerId,
        correctId: currentQuestion.correctAnswerId,
        isCorrect,
      },
    ]);

    setIsAnswered(false);
    setSelectedAnswerId(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };
  
  if (isCompleted) {
    const correctCount = results.filter(r => r.isCorrect).length;
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold mb-4">¡Ejercicio completado!</h2>
        <p className="text-lg">
          Has acertado {correctCount} de {questions.length} preguntas.
        </p>
        {/* Here you would typically show the results component or a link to it */}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Encuentra la imagen diferente</h2>
        <div className="text-lg font-semibold bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md">
          Pregunta: {currentQuestionIndex + 1} / {config.totalQuestions}
        </div>
        {/* Optional: Timer can be added here */}
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {currentQuestion.options.map((media) => {
            const isSelected = selectedAnswerId === media.id;
            const isCorrect = currentQuestion.correctAnswerId === media.id;
            
            let overlay = null;
            if (isAnswered && isSelected) {
              overlay = isCorrect 
                ? <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center"><CheckCircle className="w-16 h-16 text-white" /></div>
                : <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center"><XCircle className="w-16 h-16 text-white" /></div>;
            } else if (isAnswered && isCorrect) {
              overlay = <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center"><CheckCircle className="w-16 h-16 text-white" /></div>
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
      </div>
      <div className="flex justify-end mt-4">
        {isAnswered && (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex === questions.length - 1
              ? "Finalizar"
              : "Siguiente"}
          </Button>
        )}
      </div>
    </div>
  );
} 