"use client"

import { useState } from "react"
import { ExerciseProvider } from "@/contexts/ExerciseContext"
import { ReactionTimeGrid } from "@/components/reaction-time-grid/reaction-time-grid"
import { ReactionTimeConfigForm } from "@/components/reaction-time-grid/reaction-time-config-form"
import type { ReactionTimeGridConfig } from "@/components/reaction-time-grid/reaction-time-grid-schema"

export default function ReactionGridPage() {
  const [config, setConfig] = useState<ReactionTimeGridConfig | null>(null)

  function handleConfigSubmit(newConfig: ReactionTimeGridConfig) {
    console.log("Configuración de cuadrícula de reacción:", newConfig)
    setConfig(newConfig)
  }

  function handleReset() {
    setConfig(null)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Cuadrícula de Tiempo de Reacción</h1>

      <div className="max-w-5xl mx-auto">
        {!config ? (
          <ReactionTimeConfigForm onSubmit={handleConfigSubmit} />
        ) : (
          <ExerciseProvider totalQuestions={config.totalQuestions}>
            <div className="space-y-4">
              <div className="flex justify-center">
                <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700 underline">
                  ← Volver a la Configuración
                </button>
              </div>
              <ReactionTimeGrid {...config} />
            </div>
          </ExerciseProvider>
        )}
      </div>
    </div>
  )
}
