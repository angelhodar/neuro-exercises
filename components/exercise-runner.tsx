"use client"

import { useState } from "react"
import { notFound } from "next/navigation"
import { ExerciseProvider } from "@/contexts/exercise-context"
import { getExerciseFromRegistry } from "@/app/registry/exercises"

interface ExerciseRunnerProps {
  slug: string
}

export function ExerciseRunner({ slug }: ExerciseRunnerProps) {
  const exerciseDetails = getExerciseFromRegistry(slug)

  if (!exerciseDetails) return notFound()

  const {
    schema,
    defaultConfig,
    ConfigFormComponent,
    ExerciseComponent,
  } = exerciseDetails

  const [config, setConfig] = useState(() => {
    if (defaultConfig) {
      return schema.parse(defaultConfig)
    }
    return null
  })

  function handleConfigSubmit(newConfigData: unknown) {
    try {
      const validatedConfig = schema.parse(newConfigData)
      setConfig(validatedConfig)
    } catch (error) {
      console.error("Form validation failed:", error)
      alert("La configuración no es válida. Por favor, revisa los campos.")
    }
  }

  function handleReset() {
    setConfig(null)
  }

  if (!config) {
    return (
      <ConfigFormComponent
        onSubmit={handleConfigSubmit}
        initialValues={defaultConfig}
      />
    )
  }

  return (
    <ExerciseProvider totalQuestions={config.totalQuestions}>
      <div className="space-y-4">
        <div className="flex justify-center">
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            ← Volver a la Configuración
          </button>
        </div>
        <ExerciseComponent config={config} />
      </div>
    </ExerciseProvider>
  )
}