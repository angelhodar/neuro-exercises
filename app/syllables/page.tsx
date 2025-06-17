"use client"

import { useState } from "react"
import { ExerciseProvider } from "@/contexts/exercise-context"
import { SyllablesExercise } from "@/components/exercises/syllables/syllables-exercise"
import { SyllablesConfigForm } from "@/components/exercises/syllables/syllables-config-form"
import type { SyllablesConfig } from "@/components/exercises/syllables/syllables-schema"

export default function SyllablesPage() {
  const [config, setConfig] = useState<SyllablesConfig | null>(null)

  function handleConfigSubmit(newConfig: SyllablesConfig) {
    console.log("Configuración de sílabas:", newConfig)
    setConfig(newConfig)
  }

  function handleReset() {
    setConfig(null)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Ejercicio de Sílabas</h1>

      <div className="max-w-5xl mx-auto">
        {!config ? (
          <SyllablesConfigForm onSubmit={handleConfigSubmit} />
        ) : (
          <ExerciseProvider totalQuestions={config.totalQuestions}>
            <div className="space-y-4">
              <div className="flex justify-center">
                <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700 underline">
                  ← Volver a la Configuración
                </button>
              </div>
              <SyllablesExercise config={config} />
            </div>
          </ExerciseProvider>
        )}
      </div>
    </div>
  )
}
