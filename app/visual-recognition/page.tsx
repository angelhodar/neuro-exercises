"use client"

import { useState } from "react"
import { ExerciseProvider } from "@/contexts/exercise-context"
import { VisualRecognitionExercise } from "@/components/visual-recognition/visual-recognition-exercise"
import { VisualRecognitionConfigForm } from "@/components/visual-recognition/visual-recognition-config-form"
import type { VisualRecognitionConfig } from "@/components/visual-recognition/visual-recognition-schema"

export default function VisualRecognitionPage() {
  const [config, setConfig] = useState<VisualRecognitionConfig | null>(null)

  function handleConfigSubmit(newConfig: VisualRecognitionConfig) {
    setConfig(newConfig)
  }

  function handleReset() {
    setConfig(null)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Ejercicio de Reconocimiento Visual</h1>

      <div className="max-w-5xl mx-auto">
        {!config ? (
          <VisualRecognitionConfigForm onSubmit={handleConfigSubmit} />
        ) : (
          <ExerciseProvider totalQuestions={config.totalQuestions}>
            <div className="space-y-4">
              <div className="flex justify-center">
                <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700 underline">
                  ← Volver a la Configuración
                </button>
              </div>
              <VisualRecognitionExercise config={config} />
            </div>
          </ExerciseProvider>
        )}
      </div>
    </div>
  )
}
