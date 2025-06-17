"use client"

import { useState } from "react"
import { notFound } from "next/navigation"
import { ExerciseProvider } from "@/contexts/exercise-context"
import { getExerciseFromRegistry } from "@/app/registry/exercises"

interface ExerciseRunnerProps {
  slug: string
  config?: any
}

export function ExerciseRunner({ slug, config }: ExerciseRunnerProps) {
  const exerciseDetails = getExerciseFromRegistry(slug)

  if (!exerciseDetails) return notFound()

  const {
    schema,
    ConfigFormComponent,
    ExerciseComponent,
  } = exerciseDetails

  const [computedConfig, setComputedConfig] = useState(() => {
    if (config) return schema.parse(config)
    return null
  })

  function handleConfigSubmit(newConfigData: unknown) {
    try {
      const validatedConfig = schema.parse(newConfigData)
      setComputedConfig(validatedConfig)
    } catch (error) {
      console.error("Form validation failed:", error)
      alert("La configuración no es válida. Por favor, revisa los campos.")
    }
  }

  function handleReset() {
    setComputedConfig(null)
  }

  if (!computedConfig) return <ConfigFormComponent onSubmit={handleConfigSubmit} />

  return (
    <ExerciseProvider totalQuestions={computedConfig.totalQuestions}>
      <div className="space-y-4">
        <div className="flex justify-center">
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            ← Volver a la Configuración
          </button>
        </div>
        <ExerciseComponent config={computedConfig} />
      </div>
    </ExerciseProvider>
  )
}